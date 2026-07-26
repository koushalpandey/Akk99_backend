import { z } from "zod"

export const createReviewSchema = z.object({
  productId: z
    .number({
      required_error: "Product ID is required",
      invalid_type_error: "Product ID must be a number",
    })
    .positive("Product ID must be a positive number"),

  rating: z
    .number({
      required_error: "Rating is required",
      invalid_type_error: "Rating must be a number",
    })
    .min(1, "Rating must be at least 1")
    .max(5, "Rating cannot be more than 5"),

  comment: z
    .string({
      required_error: "Comment is required",
      invalid_type_error: "Comment must be a string",
    })
    .trim()
    .min(1, "Comment cannot be empty"),
});

