import { config } from '@/constants/config';
import { apiClient } from '@/shared/lib/axios';
import { mockCommerce } from '@/shared/lib/mockCommerce';
import type { CommerceCart } from '@/shared/types/commerce.types';

export const cartService = {
  async getCart() {
    if (config.useMockData) {
      return mockCommerce.getCart();
    }

    const response = await apiClient.get<CommerceCart>('/cart');
    return response.data;
  },
  async updateQuantity(itemId: string, quantity: number) {
    if (config.useMockData) {
      return mockCommerce.updateCartItemQuantity(itemId, quantity);
    }

    const response = await apiClient.patch<CommerceCart>(`/cart/items/${itemId}`, { quantity });
    return response.data;
  },
  async removeItem(itemId: string) {
    if (config.useMockData) {
      return mockCommerce.removeCartItem(itemId);
    }

    const response = await apiClient.delete<CommerceCart>(`/cart/items/${itemId}`);
    return response.data;
  },
  async clearCart() {
    if (config.useMockData) {
      return mockCommerce.clearCart();
    }

    const response = await apiClient.delete<CommerceCart>('/cart');
    return response.data;
  },
};

