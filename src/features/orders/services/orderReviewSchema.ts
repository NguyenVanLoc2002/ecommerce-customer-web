import { z } from 'zod';

export const orderReviewSchema = z.object({
  rating: z.number().min(1, 'Select a rating before you submit.').max(5),
  comment: z
    .string()
    .trim()
    .min(12, 'Write at least 12 characters of feedback.')
    .max(1000, 'Reviews must stay within 1000 characters.'),
});

export type OrderReviewSchemaInput = z.infer<typeof orderReviewSchema>;
