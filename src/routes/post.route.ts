import express, { NextFunction, Request, Response } from "express";

// Middlewares imports
import slugMiddleware from "../middlewares/slugMiddleware";
import { validationMiddleware } from "../middlewares/validationMiddleware";
import authMiddleware from "../middlewares/authMiddleware";
import upload from "../middlewares/uploadMiddleware";

// Utils imports
import db from "../utils/prisma";
import cloudinary from "../utils/cloudinary";

// Validators imports
import {
  createPostSchema,
  updatePostSchema,
} from "../validators/postValidator";

// Errors imports
import { DatabaseError } from "../errors/DatabaseError";
import { ValidationError } from "../errors/ValidationError";
import { NotFoundError } from "../errors/NotFoundError";

interface CustomRequest extends Request {
  userId: string;
}

const router = express.Router();

// CREATE
router.post(
  "/",
  authMiddleware,
  upload.single("thumbnail"),
  validationMiddleware(createPostSchema),
  slugMiddleware("title"),
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    const { title, slug, description, content } = req.body;

    try {
      if (!req.file) {
        return next(
          new ValidationError("Validation failed", [
            { field: "thumbnail", message: "Thumbnail is required" },
          ])
        );
      }

      // File extension validation
      const ext = req.file.originalname.split(".").pop();

      if (ext !== "png" && ext !== "jpg" && ext !== "jpeg") {
        return next(
          new ValidationError("Validation failed", [
            { field: "thumbnail", message: "Invalid file format" },
          ])
        );
      }

      // Upload thumbnail to cloudinary
      const { public_id, secure_url } = await cloudinary.uploader.upload(
        req.file.path,
        {
          folder: "newsapp/thumbnails",
        }
      );

      const createdPost = await db.post.create({
        data: {
          title,
          slug,
          description,
          content,
          thumbnail: {
            create: {
              public_id: public_id,
              url: secure_url,
            },
          },
          author: { connect: { id: req.userId } },
        },
        include: {
          thumbnail: { select: { url: true } },
          author: { select: { id: true, name: true, email: true } },
        },
      });

      if (!createdPost) return next(new DatabaseError());

      res.status(201).json({
        message: "Post successfully registered",
        post: createdPost,
      });
    } catch (error) {
      console.error(error);
      next(error);
    }
  }
);

// GET ALL
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const posts = await db.post.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        thumbnail: { select: { url: true } },
        author: { select: { name: true, email: true } },
      },
    });

    if (posts.length === 0) {
      return next(new NotFoundError("No posts found"));
    }

    res.status(200).json({ posts });
  } catch (error) {
    console.log(error);
    next(error);
  }
});

// GET ONE
router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;

  try {
    const post = await db.post.findUnique({ where: { id } });

    if (!post) return next(new NotFoundError("Post not found"));
    res.status(200).json({ post });
  } catch (error) {
    console.log(error);
    next(error);
  }
});

// UPDATE
router.patch(
  "/:id",
  authMiddleware,
  upload.single("thumbnail"),
  validationMiddleware(updatePostSchema),
  slugMiddleware("title"),
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    if (!id) {
      return next(
        new ValidationError("Validation failed", [
          { field: "id", message: "Post Id is required" },
        ])
      );
    }

    try {
      const post = await db.post.findUnique({
        where: { id },
        include: { thumbnail: true },
      });

      if (!post) {
        return next(new NotFoundError("Post not found"));
      }

      // File extension validation
      const ext = req.file.originalname.split(".").pop();

      if (ext !== "png" && ext !== "jpg" && ext !== "jpeg") {
        return next(
          new ValidationError("Validation failed", [
            { field: "thumbnail", message: "Invalid file format" },
          ])
        );
      }

      // Upload thumbnail to cloudinary and remove old thumbnail
      if (req.file) {
        const { public_id, secure_url } = await cloudinary.uploader.upload(
          req.file.path,
          {
            folder: "newsapp/thumbnails",
          }
        );

        await cloudinary.uploader.destroy(post.thumbnail.public_id);

        await db.post.update({
          where: { id },
          data: {
            ...req.body,
            thumbnail: {
              update: {
                public_id,
                url: secure_url,
              },
            },
          },
        });
      } else {
        await db.post.update({
          where: { id },
          data: {
            ...req.body,
          },
        });
      }

      res.status(200).json({ message: "Post updated successfully" });
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
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    if (!id) {
      return next(
        new ValidationError("Validation failed", [
          { field: "id", message: "Post Id is required" },
        ])
      );
    }

    try {
      const post = await db.post.findUnique({ where: { id } });

      if (!post) return next(new NotFoundError("Post not found"));

      await db.post.delete({ where: { id } });

      res.status(200).json({ message: "Post deleted successfully" });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

export default router;
