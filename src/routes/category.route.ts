import express, { NextFunction, Request, Response } from "express";
import { validationMiddleware } from "../middlewares/validationMiddleware";
import slugMiddleware from "../middlewares/slugMiddleware";
import authMiddleware from "../middlewares/authMiddleware";
import { DatabaseError } from "../errors/DatabaseError";
import { NotFoundError } from "../errors/NotFoundError";
import { ValidationError } from "../errors/ValidationError";
import { AuthError } from "../errors/AuthError";
import {
  createCategorySchema,
  updateCategorySchema,
} from "../validators/catValidator";
import db from "../utils/prisma";
import { Role } from "@prisma/client";

interface CustomRequest extends Request {
  userId: string;
  role: Role;
}

const router = express.Router();

// CREATE
router.post(
  "/",
  authMiddleware,
  validationMiddleware(createCategorySchema),
  slugMiddleware("name"),
  async (req: CustomRequest, res: Response, next: NextFunction) => {
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
      select: {
        id: true,
        name: true,
        slug: true,
        posts: {
          select: {
            id: true,
            title: true,
            slug: true,
            content: true,
            thumbnail: { select: { id: true, url: true } },
            author: { select: { id: true, name: true, email: true } },
            published: true,
          },
        },
        published: true,
        createdAt: true,
      },
      // where: { published: true },
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

// TOTAL CATEGORIES
router.get(
  "/total",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const total = await db.category.count();
      res.status(200).json({ total });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

// GET ONE
router.get(
  "/:slug",
  async (req: Request, res: Response, next: NextFunction) => {
    const { slug } = req.params;

    if (!slug) {
      return next(
        new ValidationError("Validation failed", [
          { field: "slug", message: "Category slug is required" },
        ])
      );
    }
    try {
      const category = await db.category.findUnique({
        where: { slug },
        select: {
          id: true,
          name: true,
          posts: {
            select: {
              id: true,
              title: true,
              slug: true,
              content: true,
              thumbnail: { select: { id: true, url: true } },
              author: { select: { id: true, name: true, email: true } },
            },
          },
          createdAt: true,
          published: true,
        },
      });

      if (!category) {
        return next(new NotFoundError("Category not found"));
      }

      res.status(200).json({ category });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);
// UPDATE
router.patch(
  "/:id",
  authMiddleware,
  slugMiddleware("name"),
  validationMiddleware(updateCategorySchema),
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;

    // if (req.role !== "ADMIN") {
    //   return next(
    //     new AuthError("Unauthorized: Only admins can update a category")
    //   );
    // }

    if (!id) {
      return next(
        new ValidationError("Validation failed", [
          { field: "id", message: "Category id is required" },
        ])
      );
    }

    try {
      const category = await db.category.findUnique({ where: { id } });

      if (!category) {
        return next(new NotFoundError("Category not found"));
      }

      const updatedCategory = await db.category.update({
        where: { id },
        data: {
          ...req.body,
        },
      });

      if (!updatedCategory) {
        return next(new NotFoundError("Category not found"));
      }

      res.status(200).json({ category: updatedCategory });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);
// DELETE
router.delete(
  "/:id",
  authMiddleware,
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;

    if (!id) {
      return next(
        new ValidationError("Validation failed", [
          { field: "id", message: "Category id is required" },
        ])
      );
    }

    try {
      const category = await db.category.findUnique({ where: { id } });

      if (!category) {
        return next(new NotFoundError("Category not found"));
      }

      await db.category.delete({ where: { id } });

      res.status(200).json({ message: "Category deleted successfully" });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

export default router;
