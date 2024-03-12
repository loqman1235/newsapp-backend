import express, { NextFunction, Request, Response } from "express";
import { validationMiddleware } from "../middlewares/validationMiddleware";
import catSlugMiddleware from "../middlewares/catSlugMiddleware";
import authMiddleware from "../middlewares/authMiddleware";
import { DatabaseError } from "../errors/DatabaseError";
import { NotFoundError } from "../errors/NotFoundError";
import { ValidationError } from "../errors/ValidationError";
import { createCategorySchema } from "../validators/catValidator";
import db from "../utils/prisma";

const router = express.Router();

// CREATE
router.post(
  "/",
  authMiddleware,
  validationMiddleware(createCategorySchema),
  catSlugMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, slug } = req.body;

    try {
      // Check if category name exists
      const existingCat = await db.category.findUnique({ where: { name } });

      if (existingCat) {
        return next(
          new ValidationError("Validation failed", [
            { field: "name", message: "Category name already exists" },
          ])
        );
      }

      const createdCat = await db.category.create({
        data: {
          name,
          slug,
        },
      });

      if (!createdCat) return next(new DatabaseError());

      res.status(201).json({
        message: "Category successfully created",
        category: createdCat,
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);
// GET ALL
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cats = await db.category.findMany({
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, published: true },
      where: { published: true },
    });

    if (cats.length === 0) {
      return next(new NotFoundError("No categories found"));
    }

    res.status(200).json({ categories: cats });
  } catch (error) {
    console.log(error);
    next(error);
  }
});
// GET ONE
// UPDATE
// DELETE

export default router;
