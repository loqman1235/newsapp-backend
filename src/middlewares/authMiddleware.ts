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
  // Get access token from headers
  const reqHeaders = req.headers.authorization;

  // Check if access token is valid
  if (!reqHeaders) return next(new AuthError("Unauthorized"));

  // Get access token
  const accessToken = reqHeaders.split(" ")[1];

  // Check if access token is valid
  if (!accessToken) return next(new AuthError("Unauthorized"));

  // Verify token
  jwt.verify(
    accessToken,
    process.env.ACCESS_TOKEN_SECRET,
    (err: jwt.VerifyErrors, user) => {
      // Check if token is valid
      if (err) return next(new AuthError("Invalid token"));

      // Check if user exists
      if (!user) return next(new AuthError("Invalid token"));

      // Get userId from token
      const { userId } = user as { userId: string };

      // Set userId in request object
      req.userId = userId;

      // Call next middleware
      next();
    }
  );
};

export default authMiddleware;
