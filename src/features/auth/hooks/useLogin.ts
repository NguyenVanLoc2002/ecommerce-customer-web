import { useMutation } from '@tanstack/react-query';

import { authService } from '@/features/auth/services/authService';
import { useAuthStore } from '@/shared/stores/authStore';
import type { LoginInput } from '@/shared/types/auth.types';

export const useLogin = () => {
  const setSession = useAuthStore((state) => state.setSession);

  return useMutation({
    mutationFn: (payload: LoginInput) => authService.login(payload),
    onSuccess: (response) => {
      setSession(response);
    },
  });
};

