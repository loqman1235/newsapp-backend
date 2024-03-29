import express, { NextFunction, Request, Response } from "express";
import { validationMiddleware } from "../middlewares/validationMiddleware";
import { hashPasswordMiddleware } from "../middlewares/hashPasswordMiddleware";
import { ValidationError } from "../errors/ValidationError";
import { AuthError } from "../errors/AuthError";
import { userCreateSchema, userLoginSchema } from "../validators/userValidator";
import verifyTokenMiddleware from "../middlewares/verifyTokenMiddleware";
import jwt from "jsonwebtoken";

import db from "../utils/prisma";
import bcrypt from "bcrypt";
import {
  createAccessToken,
  createRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt";
import authMiddleware from "../middlewares/authMiddleware";
import config from "../config";
import { Role } from "@prisma/client";
import rateLimitMiddleware from "../middlewares/rateLimitMiddleware";

const router = express.Router();

// Sign up user
router.post(
  "/signup",
  validationMiddleware(userCreateSchema),
  hashPasswordMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    // Register user
    const { name, email, password } = req.body;

    try {
      // Check if email exists
      const existingUser = await db.user.findUnique({ where: { email } });

      if (existingUser) {
        return next(
          new ValidationError("Validation failed", [
            { field: "email", message: "Email already exists" },
          ])
        );
      }

      const createdUser = await db.user.create({
        data: {
          name,
          email,
          password,
        },
      });

      if (createdUser) {
        res.status(201).json({
          message: "User successfully registered",
          user: createdUser,
        });
      }
    } catch (error) {
      console.error(error);
      next(error);
    }
  }
);

// Sign in user
router.post(
  "/signin",
  validationMiddleware(userLoginSchema),
  rateLimitMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password: userPass } = req.body;

    // Verify user
    try {
      const existingUser = await db.user.findUnique({ where: { email } });

      // Check if email exists
      if (!existingUser) {
        return next(new AuthError("Wrong credentials"));
      }

      // Verify Password
      const isValidPassword = await bcrypt.compare(
        userPass,
        existingUser.password
      );

      if (!isValidPassword) {
        return next(new AuthError("Wrong credentials"));
      }

      // Setting up access token and refresh token
      const accessToken = createAccessToken({
        userId: existingUser.id,
        role: existingUser.role,
      });

      const refreshToken = createRefreshToken({
        userId: existingUser.id,
      });

      // Save refresh token in refresh token table
      await db.refreshToken.create({
        data: {
          token: refreshToken,
          userId: existingUser.id,
        },
      });

      // res.cookie("accessToken", accessToken, {
      //   httpOnly: true,
      //   maxAge: Number(config.ACCESS_TOKEN_COOKIE_MAX_AGE),
      //   secure: process.env.NODE_ENV === "production",
      // });

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        maxAge: Number(config.REFRESH_TOKEN_COOKIE_MAX_AGE),
        secure: process.env.NODE_ENV === "production",
      });

      const { password, ...userWithoutPass } = existingUser;

      res.status(200).json({
        message: "User logged In successfully",
        user: userWithoutPass,
        accessToken,
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

// Sign Out user
router.post(
  "/signout",
  authMiddleware,
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      await db.refreshToken.deleteMany({ where: { userId: req.userId } });

      res.clearCookie("refreshToken");
      res.status(200).json({ message: "User signed out successfully" });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

// Refresh token
router.post(
  "/refresh-token",
  async (req: Request, res: Response, next: NextFunction) => {
    const { refreshToken } = req.cookies;

    if (!refreshToken) return next(new AuthError("Refresh token is missing"));

    try {
      const decoded = jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET
      );

      const { userId } = decoded as { userId: string };

      const existingUser = await db.user.findUnique({
        where: { id: userId },
        select: { id: true, name: true, email: true, role: true },
      });

      if (!existingUser) return next(new AuthError("User not found"));

      const existingRefreshToken = await db.refreshToken.findFirst({
        where: { token: refreshToken, userId },
      });

      if (!existingRefreshToken)
        return next(new AuthError("Invalid refresh token"));

      const accessToken = createAccessToken({
        userId,
        role: existingUser.role,
      });

      // Save in cookies
      res.status(200).json({ accessToken, user: existingUser });
    } catch (error) {
      console.log(error);
      return next(new AuthError("Invalid refresh token"));
    }
  }
);

interface CustomRequest extends Request {
  userId: string;
  role: Role;
}

// Protected route test
router.get(
  "/protected",
  authMiddleware,
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    res
      .status(200)
      .json({ message: "This is a protected route", user: req.userId });
  }
);

// Verify token
router.get("/verify", authMiddleware, (req: CustomRequest, res: Response) => {
  res.status(200).json({ isValid: true });
});

export default router;
