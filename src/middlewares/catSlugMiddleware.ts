import { NextFunction, Request, Response } from "express";
import slugify from "slugify";

const catSlugMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { name } = req.body;

  const slug = slugify(name, {
    lower: true,
    strict: true,
    trim: true,
  });

  req.body.slug = slug;

  next();
};

export default catSlugMiddleware;
