import { apiClient } from '@/shared/lib/axios';
import { toUserProfile } from '@/shared/lib/apiMappers';
import type { ApiResponse } from '@/shared/types/api.types';
import type { ApiUserProfileResponse, UpdateProfileRequest } from '@/shared/types/profile.types';

export const profileService = {
  async getProfile() {
    const response = await apiClient.get<ApiResponse<ApiUserProfileResponse>, ApiUserProfileResponse>('/me');
    return toUserProfile(response);
  },
  async updateProfile(payload: UpdateProfileRequest) {
    const response = await apiClient.patch<ApiResponse<ApiUserProfileResponse>, ApiUserProfileResponse>('/me', payload);
    return toUserProfile(response);
  },
};
