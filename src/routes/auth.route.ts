import express, { NextFunction, Request, Response } from "express";
import { validationMiddleware } from "../middlewares/validationMiddleware";
import { hashPasswordMiddleware } from "../middlewares/hashPasswordMiddleware";
import { ValidationError } from "../errors/ValidationError";
import { AuthError } from "../errors/AuthError";
import { userCreateSchema, userLoginSchema } from "../validators/userValidator";
import verifyTokenMiddleware from "../middlewares/verifyTokenMiddleware";

import db from "../utils/prisma";
import bcrypt from "bcrypt";
import {
  createAccessToken,
  createRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt";
import authMiddleware from "../middlewares/authMiddleware";

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
      });

      const refreshToken = createRefreshToken({
        userId: existingUser.id,
      });

      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        maxAge: 5000, // 5 seconds
        secure: process.env.NODE_ENV === "production",
      });

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        secure: process.env.NODE_ENV === "production",
      });

      const { password, ...userWithoutPass } = existingUser;

      res.status(200).json({
        message: "User logged In successfully",
        user: userWithoutPass,
        accessToken,
        refreshToken,
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

// Sign Out user
router.post("/signout", authMiddleware, async (req: Request, res: Response) => {
  // todo
  res.clearCookie("accessToken");
  res.status(200).json({ message: "User logged out successfully" });
});

// refresh token
// router.get(
//   "/refresh",
//   async (req: Request, res: Response, next: NextFunction) => {
//     const { refreshToken } = req.cookies;

//     if (!refreshToken) {
//       return next(new AuthError("No refresh token"));
//     }

//     const decoded = verifyRefreshToken(refreshToken);

//     if (!decoded) {
//       return next(new AuthError("Invalid refresh token"));
//     }

//     const user = await db.user.findUnique({ where: { id: decoded.userId } });

//     if (!user) {
//       return next(new AuthError("User not found"));
//     }

//     const accessToken = createAccessToken({
//       userId: user.id,
//     });

//     res.cookie("accessToken", accessToken, {
//       httpOnly: true,
//       maxAge: 5000, // 5 seconds
//       secure: process.env.NODE_ENV === "production",
//     });

//     res.status(200).json({ accessToken });
//   }
// );

interface CustomRequest extends Request {
  userId: string;
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

export default router;
