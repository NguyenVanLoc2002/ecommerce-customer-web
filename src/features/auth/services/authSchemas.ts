import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Enter a valid email address.'),
  password: z.string().min(8, 'Password must be at least 8 characters.'),
});

export const registerSchema = loginSchema.extend({
  firstName: z.string().min(2, 'First name must be at least 2 characters.'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters.'),
  phoneNumber: z
    .string()
    .min(10, 'Phone number must be at least 10 digits.')
    .max(15, 'Phone number must be at most 15 digits.'),
});

export type LoginSchemaInput = z.infer<typeof loginSchema>;
export type RegisterSchemaInput = z.infer<typeof registerSchema>;

