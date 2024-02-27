import { ValidationError } from "../errors/ValidationError";
import { NextFunction, Request, Response } from "express";
import { ValidationErrorDetail } from "../utils/CustomError";
import { ZodError } from "zod";

export const validationMiddleware = (
  schema: any
): ((req: Request, res: Response, next: NextFunction) => void) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const validationErrors: ValidationErrorDetail[] = error.errors.map(
          (issue) => {
            return {
              field: issue.path.join("."),
              message: issue.message,
            };
          }
        );

        next(new ValidationError("Validation failed", validationErrors));
      }

      next(error);
    }
  };
};
