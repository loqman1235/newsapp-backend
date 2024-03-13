import { z } from "zod";

export const createCategorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { message: "Category is required" })
    .min(3, { message: "Category must be at least 3 characters" })
    .max(15, { message: "Category must not be more than 15 characters" }),
});

export const updateCategorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { message: "Category is required" })
    .min(3, { message: "Category must be at least 3 characters" })
    .max(15, { message: "Category must not be more than 15 characters" })
    .optional(),
});
