import { AuthError } from "../errors/AuthError";
import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

interface CustomRequest extends Request {
  userId?: string;
}

const verifyTokenMiddleware = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  const { accessToken } = req.cookies;

  if (accessToken) {
    try {
      const decoded = jwt.verify(
        accessToken,
        process.env.JWT_SECRET
      ) as JwtPayload;

      req.userId = decoded.userId;
      next();
    } catch (error) {
      return next(new AuthError("Not authorized"));
    }
  } else {
    return next(new AuthError("Not authorized"));
  }
};

export default verifyTokenMiddleware;
