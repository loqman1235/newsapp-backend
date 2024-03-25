import { NextFunction, Request, Response } from "express";
import slugify from "slugify";

const slugMiddleware =
  (key: string) => async (req: Request, res: Response, next: NextFunction) => {
    const value = req.body[key];
    let slug: string = "";

    if (!value) return res.status(400).json({ error: "Missing key" });

    slug = slugify(value, {
      lower: true,
      trim: true,
      strict: true,
      remove: /[*+~.()'"!:@]/g,
    });

    req.body.slug = slug;

    next();
  };

export default slugMiddleware;
