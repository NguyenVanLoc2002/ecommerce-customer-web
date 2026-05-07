import axios from 'axios';

import { config } from '@/constants/config';
import { getCsrfHeaders } from '@/shared/lib/csrf';
import { toAuthUser } from '@/shared/lib/apiMappers';
import { unwrapApiResponseData } from '@/shared/lib/unwrapApiResponseData';
import type { ApiResponse } from '@/shared/types/api.types';
import type { ApiTokenResponse, AuthResponse } from '@/shared/types/auth.types';
import type { ApiUserProfileResponse } from '@/shared/types/profile.types';

const authBootstrapClient = axios.create({
  baseURL: config.apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const refreshSession = async (): Promise<AuthResponse> => {
  const tokenResponse = await authBootstrapClient.post<ApiResponse<ApiTokenResponse>>('/auth/refresh-token', undefined, {
    headers: getCsrfHeaders(),
    withCredentials: true,
  });
  const tokens = unwrapApiResponseData(tokenResponse.data);

  const profileResponse = await authBootstrapClient.get<ApiResponse<ApiUserProfileResponse>>('/me', {
    headers: {
      Authorization: `${tokens.tokenType} ${tokens.accessToken}`,
    },
  });
  const profile = unwrapApiResponseData(profileResponse.data);

  return {
    accessToken: tokens.accessToken,
    tokenType: tokens.tokenType,
    expiresIn: tokens.expiresIn,
    user: toAuthUser(profile),
  };
};
