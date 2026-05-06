import { apiClient } from '@/shared/lib/axios';
import { refreshSession } from '@/features/auth/services/refreshSession';
import { toAuthResponse, toUserProfile } from '@/shared/lib/apiMappers';
import type { ApiResponse } from '@/shared/types/api.types';
import type { ApiAuthResponse, AuthResponse, LoginInput, RegisterInput } from '@/shared/types/auth.types';
import type { ApiUserProfileResponse } from '@/shared/types/profile.types';

export const authService = {
  async login(payload: LoginInput) {
    const response = await apiClient.post<ApiResponse<ApiAuthResponse>, ApiAuthResponse>('/auth/login', payload, {
      withCredentials: true,
    });
    return toAuthResponse(response);
  },
  async register(payload: RegisterInput) {
    const response = await apiClient.post<ApiResponse<ApiAuthResponse>, ApiAuthResponse>('/auth/register', payload, {
      withCredentials: true,
    });
    return toAuthResponse(response);
  },
  async refreshToken(): Promise<AuthResponse> {
    return refreshSession();
  },
  async logout() {
    await apiClient.post<ApiResponse<null>, null>('/auth/logout', undefined, {
      withCredentials: true,
    });
  },
  async getCurrentUser() {
    const profile = await apiClient.get<ApiResponse<ApiUserProfileResponse>, ApiUserProfileResponse>('/me');
    return toUserProfile(profile);
  },
};
