import { AuthError } from "../errors/AuthError";
import { NextFunction, Request, Response } from "express";
import {
  createAccessToken,
  verifyAccessToken,
  verifyRefreshToken,
} from "../utils/jwt";
import jwt from "jsonwebtoken";
import db from "../utils/prisma";

interface CustomRequest extends Request {
  userId: string;
}

const authMiddleware = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  const { accessToken } = req.cookies;

  if (!accessToken) {
    return next(new AuthError("Unauthorized"));
  }

  try {
    const decoded = verifyAccessToken(accessToken);

    req.userId = decoded.userId;

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      const { refreshToken } = req.cookies;

      if (!refreshToken) {
        return next(new AuthError("Unauthorized"));
      }

      const decoded = verifyRefreshToken(refreshToken);

      if (!decoded) {
        return next(new AuthError("Unauthorized"));
      }

      const user = await db.user.findUnique({ where: { id: decoded.userId } });

      if (!user) {
        return next(new AuthError("Unauthorized"));
      }

      const newAccessToken = createAccessToken({
        userId: user.id,
      });

      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        maxAge: 5000, // 5 seconds
        secure: process.env.NODE_ENV === "production",
      });

      next();
    }

    next(new AuthError("Unauthorized"));
  }
};

export default authMiddleware;
