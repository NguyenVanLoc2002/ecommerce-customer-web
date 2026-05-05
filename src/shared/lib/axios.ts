import axios from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';

import { config } from '@/constants/config';
import { refreshSessionWithToken } from '@/features/auth/services/refreshSession';
import { normalizeApiError } from '@/shared/lib/normalizeApiError';
import { unwrapApiResponseData } from '@/shared/lib/unwrapApiResponseData';
import { useAuthStore } from '@/shared/stores/authStore';

export const apiClient = axios.create({
  baseURL: config.apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

const publicAuthRoutes = new Set(['/auth/login', '/auth/register', '/auth/refresh-token']);
let refreshSessionPromise: Promise<ReturnType<typeof refreshSessionWithToken> extends Promise<infer T> ? T : never> | null = null;

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

const isPublicAuthRequest = (url?: string) => {
  if (!url) {
    return false;
  }

  const normalizedUrl = url.startsWith('http')
    ? new URL(url).pathname.replace(config.apiBaseUrl, '')
    : url.replace(config.apiBaseUrl, '');

  return publicAuthRoutes.has(normalizedUrl);
};

const getStoredRefreshToken = () => {
  const { refreshToken } = useAuthStore.getState();

  if (refreshToken) {
    return refreshToken;
  }

  if (typeof window === 'undefined') {
    return null;
  }

  return window.localStorage.getItem(config.authHintKey);
};

apiClient.interceptors.request.use((requestConfig) => {
  const token = useAuthStore.getState().accessToken;

  if (token && !isPublicAuthRequest(requestConfig.url)) {
    requestConfig.headers.Authorization = `Bearer ${token}`;
  }

  return requestConfig;
});

apiClient.interceptors.response.use(
  (response) => {
    return unwrapApiResponseData(response.data);
  },
  async (error) => {
    if (!axios.isAxiosError(error)) {
      return Promise.reject(error);
    }

    const requestConfig = error.config as RetryableRequestConfig | undefined;
    const status = error.response?.status;
    const isAuthFailure = status === 401 || status === 403;
    const isPublicRequest = isPublicAuthRequest(requestConfig?.url);

    if (!requestConfig || !isAuthFailure) {
      return Promise.reject(normalizeApiError(error));
    }

    if (requestConfig._retry) {
      if (!isPublicRequest) {
        useAuthStore.getState().clearSession();
      }

      return Promise.reject(normalizeApiError(error));
    }

    if (isPublicRequest) {
      return Promise.reject(normalizeApiError(error));
    }

    const refreshToken = getStoredRefreshToken();
    if (!refreshToken) {
      useAuthStore.getState().clearSession();
      return Promise.reject(normalizeApiError(error));
    }

    requestConfig._retry = true;

    try {
      refreshSessionPromise ??= refreshSessionWithToken(refreshToken).finally(() => {
        refreshSessionPromise = null;
      });

      const session = await refreshSessionPromise;
      useAuthStore.getState().setSession(session);
      requestConfig.headers.Authorization = `Bearer ${session.accessToken}`;

      return apiClient.request(requestConfig);
    } catch (refreshError) {
      useAuthStore.getState().clearSession();
      return Promise.reject(normalizeApiError(refreshError));
    }
  },
);
