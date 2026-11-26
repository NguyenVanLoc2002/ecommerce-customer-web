import type { FieldValues, Path, UseFormSetError } from 'react-hook-form';

import { passwordPolicyMessage } from '@/features/auth/services/authSchemas';
import type { ServiceError } from '@/shared/lib/serviceError';

const localizedPasswordPolicy = 'Dùng 8–64 ký tự, gồm chữ hoa, chữ thường và chữ số.';

const messages: Record<string, string> = {
  REQUEST_FAILED: 'Không thể kết nối. Vui lòng thử lại.',
  INVALID_CREDENTIALS: 'Email hoặc mật khẩu không chính xác.',
  ACCOUNT_DISABLED: 'Tài khoản hiện không khả dụng.',
  EMAIL_ALREADY_EXISTS: 'Địa chỉ email này đã được đăng ký.',
  PHONE_ALREADY_EXISTS: 'Số điện thoại này đã được sử dụng.',
  VALIDATION_ERROR: 'Vui lòng kiểm tra lại các trường được đánh dấu.',
  OTP_INVALID: 'Mã xác thực không chính xác.',
  OTP_EXPIRED: 'Mã xác thực đã hết hạn. Vui lòng yêu cầu mã mới.',
  OTP_USED: 'Mã xác thực đã được sử dụng. Vui lòng yêu cầu mã mới.',
  OTP_TOO_MANY_ATTEMPTS: 'Bạn đã nhập sai quá nhiều lần. Vui lòng yêu cầu mã mới.',
  OTP_RATE_LIMITED: 'Bạn đã gửi yêu cầu quá thường xuyên. Vui lòng thử lại sau.',
  RESET_TOKEN_INVALID: 'Phiên đặt lại mật khẩu không hợp lệ. Vui lòng bắt đầu lại.',
  RESET_TOKEN_EXPIRED: 'Phiên đặt lại mật khẩu đã hết hạn. Vui lòng bắt đầu lại.',
  PASSWORD_MISMATCH: 'Mật khẩu xác nhận không khớp.',
  PASSWORD_POLICY_VIOLATED: localizedPasswordPolicy,
  PASSWORD_REUSED: 'Vui lòng chọn mật khẩu khác mật khẩu hiện tại.',
  CSRF_TOKEN_INVALID: 'Không thể xác thực phiên bảo mật. Vui lòng tải lại trang và thử lại.',
};

export const authErrorMessage = (error: ServiceError) => messages[error.code] ?? error.message;

export const applyAuthFormErrors = <T extends FieldValues>(
  error: ServiceError,
  setError: UseFormSetError<T>,
  fields: Partial<Record<string, Path<T>>> = {},
) => {
  Object.entries(error.fieldErrors ?? {}).forEach(([field, message]) => {
    setError(field as Path<T>, { message });
  });

  const field = fields[error.code];
  if (field) {
    setError(field, { message: authErrorMessage(error) }, { shouldFocus: true });
  }

  return authErrorMessage(error);
};

export const localizedPasswordMessage = (message?: string) =>
  message === passwordPolicyMessage ? localizedPasswordPolicy : message;
