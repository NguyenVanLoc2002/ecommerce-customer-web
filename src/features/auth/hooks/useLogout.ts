import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import { routes } from '@/constants/routes';
import { clearCustomerSessionState } from '@/features/auth/lib/clearCustomerSessionState';
import { authService } from '@/features/auth/services/authService';
import { useUiStore } from '@/shared/stores/uiStore';

type LogoutMutationInput = {
  redirectTo?: string;
};

export const useLogout = () => {
  const addToast = useUiStore((state) => state.addToast);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation<void, Error, LogoutMutationInput | undefined>({
    mutationFn: async () => authService.logout(),
    onSettled: async (_data, _error, variables) => {
      await clearCustomerSessionState(queryClient);
      addToast({
        tone: 'success',
        title: 'Signed out',
        description: 'Your customer session has been cleared on this device.',
      });
      navigate(variables?.redirectTo ?? routes.home, { replace: true });
    },
  });
};
