import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import { routes } from '@/constants/routes';
import { clearCustomerSessionState } from '@/features/auth/lib/clearCustomerSessionState';
import { authService } from '@/features/auth/services/authService';
import { useUiStore } from '@/shared/stores/uiStore';
import type { ChangePasswordRequest } from '@/shared/types/auth.types';

export const useChangePassword = () => {
  const addToast = useUiStore((state) => state.addToast);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ChangePasswordRequest) => authService.changePassword(payload),
    onSuccess: async () => {
      await clearCustomerSessionState(queryClient);
      addToast({
        tone: 'success',
        title: 'Password updated',
        description: 'Please sign in again with your new password.',
      });
      navigate(routes.login, { replace: true });
    },
  });
};
