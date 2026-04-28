import { useMutation } from '@tanstack/react-query';

import { authService } from '@/features/auth/services/authService';
import { useAuthStore } from '@/shared/stores/authStore';
import type { RegisterInput } from '@/shared/types/auth.types';

export const useRegister = () => {
  const setSession = useAuthStore((state) => state.setSession);

  return useMutation({
    mutationFn: (payload: RegisterInput) => authService.register(payload),
    onSuccess: (response) => {
      setSession(response);
    },
  });
};

