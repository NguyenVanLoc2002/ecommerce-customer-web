import { apiClient } from '@/shared/lib/axios';
import { toCommerceCart } from '@/shared/lib/apiMappers';
import type { ApiResponse } from '@/shared/types/api.types';
import type { CartResponse } from '@/shared/types/commerce.types';

export const cartService = {
  async getCart() {
    const response = await apiClient.get<ApiResponse<CartResponse>, CartResponse>('/cart');
    return toCommerceCart(response);
  },
  async updateQuantity(itemId: string, quantity: number) {
    const response = await apiClient.patch<ApiResponse<CartResponse>, CartResponse>(`/cart/items/${itemId}`, { quantity });
    return toCommerceCart(response);
  },
  async removeItem(itemId: string) {
    const response = await apiClient.delete<ApiResponse<CartResponse>, CartResponse>(`/cart/items/${itemId}`);
    return toCommerceCart(response);
  },
  async clearCart() {
    await apiClient.delete<ApiResponse<null>, null>('/cart');

    return {
      id: '',
      items: [],
      totalItems: 0,
      subTotal: 0,
      shippingFee: 0,
      discountTotal: 0,
      grandTotal: 0,
      updatedAt: new Date().toISOString(),
      staleItemCount: 0,
    };
  },
  async addItem(variantId: string, quantity: number) {
    const response = await apiClient.post<ApiResponse<CartResponse>, CartResponse>('/cart/items', { variantId, quantity });
    return toCommerceCart(response);
  },
};
