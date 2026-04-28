import { useMutation } from '@tanstack/react-query';

import { authService } from '@/features/auth/services/authService';
import { useAuthStore } from '@/shared/stores/authStore';

export const useLogout = () => {
  const clearSession = useAuthStore((state) => state.clearSession);

  return useMutation({
    mutationFn: () => authService.logout(),
    onSettled: () => {
      clearSession();
    },
  });
};

