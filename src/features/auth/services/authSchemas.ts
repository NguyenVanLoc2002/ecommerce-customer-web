import { z } from 'zod';

const passwordPolicyMessage = 'Use 8-64 characters with at least one lowercase letter, one uppercase letter, and one number.';
const passwordPolicyPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,64}$/;

export const passwordSchema = z
  .string()
  .min(8, passwordPolicyMessage)
  .max(64, passwordPolicyMessage)
  .regex(passwordPolicyPattern, passwordPolicyMessage);

export const loginSchema = z.object({
  email: z.string().email('Enter a valid email address.'),
  password: z.string().min(8, 'Password must be at least 8 characters.'),
});

export const registerSchema = loginSchema.extend({
  firstName: z.string().min(2, 'First name must be at least 2 characters.'),
  lastName: z
    .string()
    .trim()
    .max(100, 'Last name must be at most 100 characters.')
    .optional()
    .or(z.literal('')),
  phoneNumber: z
    .string()
    .trim()
    .max(15, 'Phone number must be at most 15 digits.')
    .optional()
    .or(z.literal('')),
  password: passwordSchema,
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email('Enter a valid email address.'),
});

export const verifyForgotPasswordOtpSchema = z.object({
  otp: z.string().trim().regex(/^\d{6}$/, 'Enter the 6-digit verification code.'),
});

export const resetPasswordSchema = z
  .object({
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, 'Confirm your new password.'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'The password confirmation does not match.',
    path: ['confirmPassword'],
  });

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Enter your current password.'),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, 'Confirm your new password.'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'The password confirmation does not match.',
    path: ['confirmPassword'],
  });

export type LoginSchemaInput = z.infer<typeof loginSchema>;
export type RegisterSchemaInput = z.infer<typeof registerSchema>;
export type ForgotPasswordSchemaInput = z.infer<typeof forgotPasswordSchema>;
export type VerifyForgotPasswordOtpSchemaInput = z.infer<typeof verifyForgotPasswordOtpSchema>;
export type ResetPasswordSchemaInput = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordSchemaInput = z.infer<typeof changePasswordSchema>;
