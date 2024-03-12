import { NextFunction, Request, Response } from "express";
import slugify from "slugify";

const postSlugMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { title } = req.body;

  const slug = slugify(title, {
    lower: true,
    strict: true,
    trim: true,
  });

  req.body.slug = slug;

  next();
};

export default postSlugMiddleware;
