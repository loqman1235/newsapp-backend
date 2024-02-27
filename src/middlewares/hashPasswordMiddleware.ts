import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";

export const hashPasswordMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { password } = req.body;

  const hashedPassword = bcrypt.hashSync(password, 10);

  req.body.password = hashedPassword;

  next();
};
