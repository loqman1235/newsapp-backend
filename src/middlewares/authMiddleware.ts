import { AuthError } from "../errors/AuthError";
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

interface CustomRequest extends Request {
  userId: string;
}

const authMiddleware = (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  // Get access token from cookies
  const { accessToken } = req.cookies;

  // Check if access token is valid
  if (!accessToken) return next(new AuthError("Unauthorized"));

  // Verify token
  jwt.verify(
    accessToken,
    process.env.ACCESS_TOKEN_SECRET,
    (
      err: jwt.VerifyErrors,
      user: { userId: string; iat: number; exp: number }
    ) => {
      // Check if token is valid
      if (err) return next(new AuthError("Invalid token"));

      // Check if user exists
      if (!user) return next(new AuthError("Invalid token"));

      // Get userId from token
      const { userId } = user;

      // Set userId in request object
      req.userId = userId;

      // Call next middleware
      next();
    }
  );
};

export default authMiddleware;
