import { apiClient } from '@/shared/lib/axios';
import { toCommerceCart, toProductDetail } from '@/shared/lib/apiMappers';
import { catalogLookupService } from '@/shared/services/catalogLookupService';
import type { ApiResponse } from '@/shared/types/api.types';
import type { CartResponse } from '@/shared/types/commerce.types';

const enrichCart = async (cart: CartResponse) => {
  const entries = await Promise.all(
    cart.items.map(async (item) => {
      const product = await catalogLookupService.getProductDetailBySlug(item.productSlug);
      const mappedProduct = product ? toProductDetail(product) : null;
      const variant = mappedProduct?.variants.find((candidate) => candidate.id === item.variantId) ?? null;

      return [
        item.variantId,
        {
          productId: mappedProduct?.id,
          productSlug: mappedProduct?.slug ?? item.productSlug,
          brandName: mappedProduct?.brandName,
          primaryImage: variant?.image ?? mappedProduct?.primaryImage,
          variant,
        },
      ] as const;
    }),
  );

  return toCommerceCart(cart, Object.fromEntries(entries));
};

export const cartService = {
  async getCart() {
    const response = await apiClient.get<ApiResponse<CartResponse>, CartResponse>('/cart');
    return enrichCart(response);
  },
  async updateQuantity(itemId: string, quantity: number) {
    const response = await apiClient.patch<ApiResponse<CartResponse>, CartResponse>(`/cart/items/${itemId}`, { quantity });
    return enrichCart(response);
  },
  async removeItem(itemId: string) {
    const response = await apiClient.delete<ApiResponse<CartResponse>, CartResponse>(`/cart/items/${itemId}`);
    return enrichCart(response);
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
    return enrichCart(response);
  },
};
