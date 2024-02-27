import express, { NextFunction, Request, Response } from "express";
import { validationMiddleware } from "../middlewares/validationMiddleware";
import { hashPasswordMiddleware } from "../middlewares/hashPasswordMiddleware";
import { ValidationError } from "../errors/ValidationError";
import { AuthError } from "../errors/AuthError";
import { userCreateSchema, userLoginSchema } from "../validators/userValidator";
import verifyTokenMiddleware from "../middlewares/verifyTokenMiddleware";

import db from "../utils/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

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

      // Setting up access token
      const accessToken = jwt.sign(
        { userId: existingUser.id },
        process.env.JWT_SECRET,
        {
          expiresIn: "2 days",
        }
      );

      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        expires: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
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
  verifyTokenMiddleware,
  async (req: Request, res: Response) => {
    // todo
    res.clearCookie("accessToken");
    res.status(200).json({ message: "User logged out successfully" });
  }
);

export default router;
