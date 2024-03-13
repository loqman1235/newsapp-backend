import { z } from "zod";

export const createPostSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, { message: "Title is required" })
    .min(5, { message: "Title must be at least 5 characters" })
    .max(40, { message: "Title must be at not be more than 30 characters" }),
  description: z
    .string()
    .trim()
    .min(5, { message: "Description must be at least 5 characters" })
    .max(200, {
      message: "Description must not be more than 200 characters",
    })
    .optional(),
  content: z
    .string()
    .trim()
    .min(1, { message: "Content is required" })
    .min(5, { message: "Content must be at least 5 characters" }),
});

export const updatePostSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, { message: "Title is required" })
    .min(5, { message: "Title must be at least 5 characters" })
    .max(40, { message: "Title must be at not be more than 30 characters" })
    .optional(),
  description: z
    .string()
    .trim()
    .min(5, { message: "Description must be at least 5 characters" })
    .max(200, {
      message: "Description must not be more than 200 characters",
    })
    .optional(),
  content: z
    .string()
    .trim()
    .min(1, { message: "Content is required" })
    .min(5, { message: "Content must be at least 5 characters" })
    .optional(),
});
