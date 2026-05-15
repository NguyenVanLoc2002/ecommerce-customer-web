import { useMutation } from '@tanstack/react-query';

import { authService } from '@/features/auth/services/authService';
import type { ResetPasswordRequest } from '@/shared/types/auth.types';

export const useResetPassword = () =>
  useMutation({
    mutationFn: (payload: ResetPasswordRequest) => authService.resetPassword(payload),
  });
