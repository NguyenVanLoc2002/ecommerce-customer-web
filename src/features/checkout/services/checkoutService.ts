import { apiClient } from '@/shared/lib/axios';
import { toAddress, toCommerceOrder, toProductDetail, toVoucherPreview } from '@/shared/lib/apiMappers';
import { catalogLookupService } from '@/shared/services/catalogLookupService';
import type { AddressResponse } from '@/shared/types/address.types';
import type { ApiResponse } from '@/shared/types/api.types';
import type { OrderResponse, PlaceOrderInput, ValidateVoucherResponse } from '@/shared/types/commerce.types';

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

export const checkoutService = {
  async getAddresses() {
    const response = await apiClient.get<ApiResponse<AddressResponse[]>, AddressResponse[]>('/addresses');
    return response.map(toAddress);
  },
  async validateVoucher(code: string, orderAmount: number) {
    const response = await apiClient.post<ApiResponse<ValidateVoucherResponse>, ValidateVoucherResponse>(
      `/vouchers/${code}/validate`,
      {
        orderAmount,
      },
    );
    return toVoucherPreview(code, response);
  },
  async placeOrder(payload: PlaceOrderInput) {
    const response = await apiClient.post<ApiResponse<OrderResponse>, OrderResponse>('/orders', payload);
    return enrichOrder(response);
  },
};
