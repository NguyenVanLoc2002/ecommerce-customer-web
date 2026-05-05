import { apiClient } from '@/shared/lib/axios';
import { toCommerceOrder, toProductDetail } from '@/shared/lib/apiMappers';
import { catalogLookupService } from '@/shared/services/catalogLookupService';
import type { ApiResponse, PagedResponse } from '@/shared/types/api.types';
import type { OrderResponse, OrderListItemResponse } from '@/shared/types/commerce.types';

const enrichOrder = async (order: OrderResponse) => {
  const entries = await Promise.all(
    order.items.map(async (item) => {
      if (!item.productId) {
        return [item.id, {}] as const;
      }

      const product = await catalogLookupService.getProductDetailById(item.productId);
      const mappedProduct = toProductDetail(product);
      const variant = mappedProduct.variants.find((candidate) => candidate.id === item.variantId) ?? null;

      return [
        item.id,
        {
          productId: mappedProduct.id,
          productSlug: mappedProduct.slug,
          brandName: mappedProduct.brandName,
          primaryImage: variant?.image ?? mappedProduct.primaryImage,
          variant,
        },
      ] as const;
    }),
  );

  return toCommerceOrder(order, Object.fromEntries(entries));
};

const getOrderResponse = (orderId: string) =>
  apiClient.get<ApiResponse<OrderResponse>, OrderResponse>(`/orders/${orderId}`);

export const ordersService = {
  async getOrders() {
    const response = await apiClient.get<ApiResponse<PagedResponse<OrderListItemResponse>>, PagedResponse<OrderListItemResponse>>('/orders');
    const items = await Promise.all(response.items.map((item) => getOrderResponse(item.id).then(enrichOrder)));

    return {
      ...response,
      items,
    };
  },
  async getOrderById(orderId: string) {
    const response = await getOrderResponse(orderId);
    return enrichOrder(response);
  },
  async cancelOrder(orderId: string) {
    const response = await apiClient.post<ApiResponse<OrderResponse>, OrderResponse>(`/orders/my/${orderId}/cancel`);
    return enrichOrder(response);
  },
};
