import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/constants/queryKeys';
import { profileService } from '@/features/profile/services/profileService';
import { useAuthStore } from '@/shared/stores/authStore';
import type { UpdateProfileRequest } from '@/shared/types/profile.types';

export const useProfile = () =>
  useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: profileService.getProfile,
  });

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateProfileRequest) => profileService.updateProfile(payload),
    onSuccess: (profile) => {
      useAuthStore.getState().updateUser({
        firstName: profile.firstName,
        lastName: profile.lastName,
        phoneNumber: profile.phoneNumber,
        avatarUrl: profile.avatarUrl,
        loyaltyPoints: profile.loyaltyPoints,
      });

      queryClient.setQueryData(queryKeys.auth.me, profile);
    },
  });
};
