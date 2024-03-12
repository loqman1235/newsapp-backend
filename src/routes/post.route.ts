import express, { NextFunction, Request, Response } from "express";

// Middlewares imports
import postSlugMiddleware from "../middlewares/postSlugMiddleware";
import { validationMiddleware } from "../middlewares/validationMiddleware";
import authMiddleware from "../middlewares/authMiddleware";
import upload from "../middlewares/uploadMiddleware";

// Utils imports
import db from "../utils/prisma";
import cloudinary from "../utils/cloudinary";

// Validators imports
import { createPostSchema } from "../validators/postValidator";

// Errors imports
import { DatabaseError } from "../errors/DatabaseError";
import { ValidationError } from "../errors/ValidationError";
import { NotFoundError } from "../errors/NotFoundError";

interface CustomRequest extends Request {
  userId: string;
}

const router = express.Router();

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  // GET POSTS
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

router.get("/:id", async (req: Request, res: Response) => {
  res.send("Post");
});

router.post(
  "/",
  authMiddleware,
  upload.single("thumbnail"),
  validationMiddleware(createPostSchema),
  postSlugMiddleware,
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

router.patch("/:id", async (req: Request, res: Response) => {
  // UPDATE POST
});

router.delete("/:id", async (req: Request, res: Response) => {
  // DELETE POST
});

export default router;
