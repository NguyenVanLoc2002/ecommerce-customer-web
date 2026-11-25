import { apiClient } from '@/shared/lib/axios';
import type { ApiResponse } from '@/shared/types/api.types';

export type CustomerSession = {
  id: string;
  userAgent?: string | null;
  lastRefreshedAt: string;
  expiresAt: string;
  current: boolean;
};

export const customerSessionService = {
  list: () => apiClient.get<ApiResponse<CustomerSession[]>, CustomerSession[]>('/auth/sessions', { withCredentials: true }),
  revoke: (id: string | null) => apiClient.delete<ApiResponse<null>, null>(
    id ? `/auth/sessions/${encodeURIComponent(id)}` : '/auth/sessions',
    { withCredentials: true },
  ),
};
