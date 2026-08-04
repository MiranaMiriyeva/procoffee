import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email({ message: "Enter a valid email address." }),
  password: z
    .string()
    .min(1, { message: "Password is required." })
    .max(200, { message: "Password is too long." }),
});
export type LoginInput = z.infer<typeof loginSchema>;

const optionalTrimmedString = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .nullable()
    .transform((v) => v ?? "");

export const categorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { message: "Category name is required." })
    .max(60, { message: "Category name must be 60 characters or fewer." }),
  nameAz: optionalTrimmedString(60),
  nameRu: optionalTrimmedString(60),
});
export type CategoryInput = z.infer<typeof categorySchema>;

export const itemSchema = z.object({
  categoryId: z.string().min(1),
  title: z.string().trim().min(1).max(80),
  titleAz: optionalTrimmedString(80),
  titleRu: optionalTrimmedString(80),
  subtitle: z.string().trim().max(120).optional().nullable(),
  subtitleAz: optionalTrimmedString(120),
  subtitleRu: optionalTrimmedString(120),
  description: z.string().trim().max(500).optional().nullable(),
  descriptionAz: optionalTrimmedString(500),
  descriptionRu: optionalTrimmedString(500),
  price: z
    .union([z.string(), z.number()])
    .transform((v) => (typeof v === "number" ? v : parseFloat(v)))
    .refine((n) => Number.isFinite(n) && n >= 0 && n <= 999999, {
      message: "Price must be a non-negative number.",
    })
    .transform((n) => n.toFixed(2)),
  imageUrl: z.string().url().optional().nullable(),
  available: z.boolean(),
});
export type ItemInput = z.infer<typeof itemSchema>;

export const reorderSchema = z.object({
  ids: z.array(z.string().min(1)).min(1).max(500),
});
export type ReorderInput = z.infer<typeof reorderSchema>;
