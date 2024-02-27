import { NextFunction, Request, Response } from "express";
import CustomError from "../utils/CustomError";

const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof CustomError) {
    res.status(err.statusCode).json(err.serialize());
  }

  console.error(err);
  return res.status(500).json({
    message: "Something went wrong",
  });
};

export default errorHandler;
