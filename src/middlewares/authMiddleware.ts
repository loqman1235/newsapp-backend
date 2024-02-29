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
  // Check if access token exists

  const reqHeaders = req.headers.authorization;

  if (!reqHeaders) return next(new AuthError("Unauthorized"));

  const accessToken = reqHeaders.split(" ")[1];

  if (!accessToken) return next(new AuthError("Unauthorized"));

  // Check if access token is valid
  jwt.verify(
    accessToken,
    process.env.ACCESS_TOKEN_SECRET,
    (err: jwt.VerifyErrors, user) => {
      if (err) return next(new AuthError("Invalid token"));

      if (!user) return next(new AuthError("Invalid token"));

      const { userId } = user as { userId: string };

      // Fix this
      req.userId = userId;

      next();
    }
  );
};

export default authMiddleware;
