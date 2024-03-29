import { AuthError } from "../errors/AuthError";
import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { createAccessToken, createRefreshToken } from "../utils/jwt";

interface CustomRequest extends Request {
  userId?: string;
}

const verifyTokenMiddleware = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  const { accessToken } = req.cookies;

  if (!accessToken) {
    return next(new AuthError("Unauthorized"));
  }

  try {
    const decoded = jwt.verify(
      accessToken,
      process.env.ACCESS_TOKEN_SECRET
    ) as JwtPayload;

    req.userId = decoded.userId;

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      const { refreshToken } = req.cookies;

      if (!refreshToken) {
        return next(new AuthError("Unauthorized"));
      }

      const decoded = jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET
      ) as JwtPayload;

      const newAccessToken = createAccessToken({
        userId: decoded.userId,
      });

      res.cookie("accessToken", newAccessToken, {
        httpOnly: true,
        maxAge: 60 * 1000,
        secure: process.env.NODE_ENV === "production",
      });

      next();
    }

    return next(new AuthError("Unauthorized"));
  }
};

export default verifyTokenMiddleware;
