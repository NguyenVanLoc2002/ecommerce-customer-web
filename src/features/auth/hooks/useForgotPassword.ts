import { useMutation } from '@tanstack/react-query';

import { authService } from '@/features/auth/services/authService';
import type { ForgotPasswordRequest } from '@/shared/types/auth.types';

export const useForgotPassword = () =>
  useMutation({
    mutationFn: (payload: ForgotPasswordRequest) => authService.forgotPassword(payload),
  });
