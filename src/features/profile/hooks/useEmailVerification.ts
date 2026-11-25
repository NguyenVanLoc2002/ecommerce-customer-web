import { useMutation, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/constants/queryKeys';
import { profileService } from '@/features/profile/services/profileService';
import type { UserProfile } from '@/shared/types/profile.types';

export const useEmailVerification = () => {
  const queryClient = useQueryClient();
  const request = useMutation({ mutationFn: profileService.requestEmailVerification });
  const confirm = useMutation({
    mutationFn: profileService.confirmEmailVerification,
    onSuccess: () => {
      queryClient.setQueryData<UserProfile>(queryKeys.auth.me, (profile) =>
        profile ? { ...profile, emailVerified: true } : undefined,
      );
    },
  });

  return { request, confirm };
};
