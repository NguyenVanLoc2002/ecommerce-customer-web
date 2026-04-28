import axios from 'axios';

import { config } from '@/constants/config';
import { useAuthStore } from '@/shared/stores/authStore';

export const apiClient = axios.create({
  baseURL: config.apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((requestConfig) => {
  const token = useAuthStore.getState().accessToken;

  if (token) {
    requestConfig.headers.Authorization = `Bearer ${token}`;
  }

  return requestConfig;
});

