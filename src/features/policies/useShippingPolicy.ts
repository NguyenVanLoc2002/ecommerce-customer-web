import { useQuery } from '@tanstack/react-query';

import { apiClient } from '@/shared/lib/axios';
import type { ServiceError } from '@/shared/lib/serviceError';
import type { ApiResponse } from '@/shared/types/api.types';

type ShippingPolicy = {
  version: number;
  title: string;
  content: string;
  effectiveFrom: string;
  publishedAt: string;
};

export const useShippingPolicy = (enabled = true) => useQuery({
  queryKey: ['policies', 'shipping'],
  enabled,
  queryFn: async ({ signal }) => {
    try {
      return await apiClient.get<ApiResponse<ShippingPolicy>, ShippingPolicy>('/policies/shipping', { signal });
    } catch (error) {
      if ((error as ServiceError | undefined)?.status === 404) return null;
      throw error;
    }
  },
  retry: false,
  staleTime: 0,
});
