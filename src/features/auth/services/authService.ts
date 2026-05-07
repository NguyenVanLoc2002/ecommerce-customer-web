import { apiClient } from '@/shared/lib/axios';
import { getCsrfHeaders } from '@/shared/lib/csrf';
import { refreshSession } from '@/features/auth/services/refreshSession';
import { toAuthResponse, toUserProfile } from '@/shared/lib/apiMappers';
import type { ApiResponse } from '@/shared/types/api.types';
import type {
  ApiAuthResponse,
  AuthResponse,
  ChangePasswordRequest,
  ForgotPasswordRequest,
  LoginInput,
  RegisterInput,
  ResetPasswordRequest,
  VerifyForgotPasswordOtpRequest,
  VerifyForgotPasswordOtpResponse,
} from '@/shared/types/auth.types';
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
      headers: getCsrfHeaders(),
      withCredentials: true,
    });
  },
  async forgotPassword(payload: ForgotPasswordRequest) {
    await apiClient.post<ApiResponse<null>, null>('/auth/password/forgot', payload, {
      headers: getCsrfHeaders(),
      withCredentials: true,
    });
  },
  async verifyForgotPasswordOtp(payload: VerifyForgotPasswordOtpRequest) {
    return apiClient.post<ApiResponse<VerifyForgotPasswordOtpResponse>, VerifyForgotPasswordOtpResponse>(
      '/auth/password/forgot/verify',
      payload,
      {
        headers: getCsrfHeaders(),
        withCredentials: true,
      },
    );
  },
  async resetPassword(payload: ResetPasswordRequest) {
    await apiClient.post<ApiResponse<null>, null>('/auth/password/reset', payload, {
      headers: getCsrfHeaders(),
      withCredentials: true,
    });
  },
  async changePassword(payload: ChangePasswordRequest) {
    await apiClient.post<ApiResponse<null>, null>('/account/password/change', payload, {
      headers: getCsrfHeaders(),
    });
  },
  async getCurrentUser() {
    const profile = await apiClient.get<ApiResponse<ApiUserProfileResponse>, ApiUserProfileResponse>('/me');
    return toUserProfile(profile);
  },
};
