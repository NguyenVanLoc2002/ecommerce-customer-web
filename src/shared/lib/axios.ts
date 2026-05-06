import axios from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';

import { config } from '@/constants/config';
import { refreshSession } from '@/features/auth/services/refreshSession';
import { normalizeApiError } from '@/shared/lib/normalizeApiError';
import { unwrapApiResponseData } from '@/shared/lib/unwrapApiResponseData';
import { useAuthStore } from '@/shared/stores/authStore';

export const apiClient = axios.create({
  baseURL: config.apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

const apiBasePath = config.apiBaseUrl.startsWith('http') ? new URL(config.apiBaseUrl).pathname : config.apiBaseUrl;
const requestsWithoutAuthHeader = new Set(['/auth/login', '/auth/register', '/auth/refresh-token']);
const refreshRetryExcludedRoutes = new Set(['/auth/login', '/auth/register', '/auth/refresh-token', '/auth/logout']);
let refreshSessionPromise: Promise<ReturnType<typeof refreshSession> extends Promise<infer T> ? T : never> | null = null;

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

const getRelativeApiPath = (url?: string) => {
  if (!url) {
    return '';
  }

  const pathname = url.startsWith('http') ? new URL(url).pathname : url.split(/[?#]/, 1)[0];

  return pathname.startsWith(apiBasePath) ? pathname.slice(apiBasePath.length) || '/' : pathname;
};

apiClient.interceptors.request.use((requestConfig) => {
  const token = useAuthStore.getState().accessToken;

  if (token && !requestsWithoutAuthHeader.has(getRelativeApiPath(requestConfig.url))) {
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
    const isExcludedFromRefreshRetry = refreshRetryExcludedRoutes.has(getRelativeApiPath(requestConfig?.url));

    if (!requestConfig || !isAuthFailure) {
      return Promise.reject(normalizeApiError(error));
    }

    if (requestConfig._retry) {
      if (!isExcludedFromRefreshRetry) {
        useAuthStore.getState().clearSession();
      }

      return Promise.reject(normalizeApiError(error));
    }

    if (isExcludedFromRefreshRetry) {
      return Promise.reject(normalizeApiError(error));
    }

    requestConfig._retry = true;

    try {
      refreshSessionPromise ??= refreshSession().finally(() => {
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
