const apiErrorMessages = {
  INVALID_CREDENTIALS: 'Email or password is incorrect.',
  ACCOUNT_DISABLED: 'This account is currently unavailable. Please contact support if you need help.',
  UNAUTHORIZED: 'Please sign in again to continue.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  VALIDATION_ERROR: 'Please review the highlighted fields and try again.',
  OTP_INVALID: 'The verification code is incorrect.',
  OTP_EXPIRED: 'The verification code has expired. Request a new code to continue.',
  OTP_USED: 'This verification code has already been used. Request a new code to continue.',
  OTP_TOO_MANY_ATTEMPTS: 'Too many incorrect attempts. Request a new verification code and try again.',
  OTP_RATE_LIMITED: 'Please wait a moment before requesting another verification code.',
  RESET_TOKEN_INVALID: 'This password reset link is no longer valid. Start the reset flow again.',
  RESET_TOKEN_EXPIRED: 'This password reset session has expired. Start the reset flow again.',
  PASSWORD_MISMATCH: 'The password confirmation does not match.',
  PASSWORD_POLICY_VIOLATED: 'Use 8-64 characters with at least one lowercase letter, one uppercase letter, and one number.',
  PASSWORD_REUSED: 'Choose a new password that is different from your current password.',
  CURRENT_PASSWORD_INVALID: 'Your current password is incorrect.',
  CSRF_TOKEN_INVALID: 'Your security session could not be verified. Refresh the page and try again.',
  IDEMPOTENCY_KEY_REQUIRED: 'Không thể xác định yêu cầu. Vui lòng thử lại.',
  IDEMPOTENCY_KEY_TOO_LONG: 'Mã xử lý yêu cầu không hợp lệ. Vui lòng thử lại.',
  IDEMPOTENCY_KEY_CONFLICT: 'Yêu cầu này đã được dùng cho dữ liệu khác. Vui lòng tải lại trang và thử lại.',
  IDEMPOTENCY_REQUEST_IN_PROGRESS: 'Yêu cầu đang được xử lý. Vui lòng không thao tác lại.',
  IDEMPOTENCY_REPLAY_NOT_AVAILABLE: 'Yêu cầu trước đó không thể khôi phục. Vui lòng thử lại với thao tác mới.',
  INSUFFICIENT_STOCK: 'Sản phẩm vừa hết hàng hoặc tồn kho đã thay đổi.',
  ORDER_STATUS_INVALID: 'Trạng thái đơn hàng đã thay đổi. Vui lòng tải lại.',
  PAYMENT_ALREADY_PROCESSED: 'Thanh toán đã được ghi nhận trước đó.',
  CONFLICT: 'Dữ liệu đã thay đổi. Vui lòng tải lại và thử lại.',
  OPTIMISTIC_LOCK_CONFLICT: 'Dữ liệu đã thay đổi. Vui lòng tải lại và thử lại.',
} as const;

export const getApiErrorMessage = (code: string, fallbackMessage: string) => {
  return apiErrorMessages[code as keyof typeof apiErrorMessages] ?? fallbackMessage;
};
