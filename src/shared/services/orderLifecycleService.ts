import { apiClient } from '@/shared/lib/axios';
import type { ApiResponse } from '@/shared/types/api.types';
import type { OrderResponse } from '@/shared/types/commerce.types';

export const orderLifecycleService = {
  async getById(orderId: string): Promise<OrderResponse> {
    return apiClient.get<ApiResponse<OrderResponse>, OrderResponse>(`/orders/${orderId}`);
  },
};
