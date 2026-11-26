import { z } from 'zod';

export const passwordPolicyMessage = 'Use 8-64 characters with at least one lowercase letter, one uppercase letter, and one number.';
const passwordPolicyPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,64}$/;

export const passwordSchema = z
  .string()
  .min(8, passwordPolicyMessage)
  .max(64, passwordPolicyMessage)
  .regex(passwordPolicyPattern, passwordPolicyMessage);

export const loginSchema = z.object({
  email: z.string().email('Nhập địa chỉ email hợp lệ.'),
  password: z.string().min(8, 'Mật khẩu phải có ít nhất 8 ký tự.'),
});

export const registerSchema = loginSchema.extend({
  firstName: z.string().min(2, 'Tên phải có ít nhất 2 ký tự.'),
  lastName: z
    .string()
    .trim()
    .max(100, 'Họ và tên đệm tối đa 100 ký tự.')
    .optional()
    .or(z.literal('')),
  phoneNumber: z
    .string()
    .trim()
    .max(15, 'Số điện thoại tối đa 15 chữ số.')
    .optional()
    .or(z.literal('')),
  password: passwordSchema,
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email('Nhập địa chỉ email hợp lệ.'),
});

export const verifyForgotPasswordOtpSchema = z.object({
  otp: z.string().trim().regex(/^\d{6}$/, 'Nhập mã xác thực gồm 6 chữ số.'),
});

export const resetPasswordSchema = z
  .object({
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, 'Xác nhận mật khẩu mới của bạn.'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp.',
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
