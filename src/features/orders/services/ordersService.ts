import { config } from '@/constants/config';
import { apiClient } from '@/shared/lib/axios';
import { mockCommerce } from '@/shared/lib/mockCommerce';
import type { CommerceOrder } from '@/shared/types/commerce.types';

export const ordersService = {
  async getOrders() {
    if (config.useMockData) {
      return mockCommerce.getOrders();
    }

    const response = await apiClient.get<CommerceOrder[]>('/orders');
    return response.data;
  },
  async getOrderById(orderId: string) {
    if (config.useMockData) {
      return mockCommerce.getOrderById(orderId);
    }

    const response = await apiClient.get<CommerceOrder>(`/orders/${orderId}`);
    return response.data;
  },
  async cancelOrder(orderId: string) {
    if (config.useMockData) {
      return mockCommerce.cancelOrder(orderId);
    }

    const response = await apiClient.post<CommerceOrder>(`/orders/my/${orderId}/cancel`);
    return response.data;
  },
};

