import { z } from "zod";

export const userCreateSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { message: "Name is required" })
    .min(3, { message: "Name must be at least 3 characters" })
    .max(30, { message: "Name must be less than 30 characters" }),
  email: z.string().trim().email(),
  password: z
    .string()
    .trim()
    .min(1, { message: "Password is required" })
    .min(6, {
      message: "Password must be at least 6 characters",
    }),
});

export const userLoginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().trim().min(1, { message: "Password is required" }),
});
