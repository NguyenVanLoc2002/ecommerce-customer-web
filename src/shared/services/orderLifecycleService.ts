import { apiClient } from '@/shared/lib/axios';
import type { ApiResponse } from '@/shared/types/api.types';
import type { OrderResponse } from '@/shared/types/commerce.types';

export type OrderLifecycleResponse = Pick<OrderResponse, 'id' | 'status' | 'paymentMethod' | 'paymentStatus'>;

export const orderLifecycleService = {
  async getById(orderId: string): Promise<OrderLifecycleResponse> {
    const order = await apiClient.get<ApiResponse<OrderResponse>, OrderResponse>(`/orders/${orderId}`);
    return {
      id: order.id,
      status: order.status,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
    };
  },
};
