import { apiClient } from '@/shared/lib/axios';
import { toCommerceOrder, toCommerceOrderFromListItem } from '@/shared/lib/apiMappers';
import type { ApiResponse, PagedResponse } from '@/shared/types/api.types';
import type { OrderResponse, OrderListItemResponse } from '@/shared/types/commerce.types';

const getOrderResponse = (orderId: string) =>
  apiClient.get<ApiResponse<OrderResponse>, OrderResponse>(`/orders/${orderId}`);

export const ordersService = {
  async getOrders() {
    const response = await apiClient.get<ApiResponse<PagedResponse<OrderListItemResponse>>, PagedResponse<OrderListItemResponse>>('/orders');
    return {
      ...response,
      items: response.items.map(toCommerceOrderFromListItem),
    };
  },
  async getOrderById(orderId: string) {
    const response = await getOrderResponse(orderId);
    return toCommerceOrder(response);
  },
  async cancelOrder(orderId: string) {
    const response = await apiClient.post<ApiResponse<OrderResponse>, OrderResponse>(`/orders/my/${orderId}/cancel`);
    return toCommerceOrder(response);
  },
};
