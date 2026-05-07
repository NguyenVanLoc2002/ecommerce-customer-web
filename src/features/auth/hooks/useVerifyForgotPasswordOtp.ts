import { useMutation } from '@tanstack/react-query';

import { authService } from '@/features/auth/services/authService';
import type { VerifyForgotPasswordOtpRequest } from '@/shared/types/auth.types';

export const useVerifyForgotPasswordOtp = () =>
  useMutation({
    mutationFn: (payload: VerifyForgotPasswordOtpRequest) => authService.verifyForgotPasswordOtp(payload),
  });
