import { apiClient } from '@/shared/lib/axios';
import { refreshSessionWithToken } from '@/features/auth/services/refreshSession';
import { toAuthResponse, toUserProfile } from '@/shared/lib/apiMappers';
import type { ApiResponse } from '@/shared/types/api.types';
import type { ApiAuthResponse, AuthResponse, LoginInput, RegisterInput } from '@/shared/types/auth.types';
import type { ApiUserProfileResponse } from '@/shared/types/profile.types';

export const authService = {
  async login(payload: LoginInput) {
    const response = await apiClient.post<ApiResponse<ApiAuthResponse>, ApiAuthResponse>('/auth/login', payload);
    return toAuthResponse(response);
  },
  async register(payload: RegisterInput) {
    const response = await apiClient.post<ApiResponse<ApiAuthResponse>, ApiAuthResponse>('/auth/register', payload);
    return toAuthResponse(response);
  },
  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    return refreshSessionWithToken(refreshToken);
  },
  async logout() {
    await apiClient.post<ApiResponse<null>, null>('/auth/logout');
  },
  async getCurrentUser() {
    const profile = await apiClient.get<ApiResponse<ApiUserProfileResponse>, ApiUserProfileResponse>('/me');
    return toUserProfile(profile);
  },
};
