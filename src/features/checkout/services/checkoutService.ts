import { apiClient } from '@/shared/lib/axios';
import { toAddress, toCheckoutCarrierOption, toCommerceOrder, toOrderPreview, toVoucherPreview } from '@/shared/lib/apiMappers';
import type { AddressResponse } from '@/shared/types/address.types';
import type { ApiResponse } from '@/shared/types/api.types';
import type {
  CheckoutCarrierOptionResponse,
  OrderPreviewInput,
  OrderPreviewResponse,
  OrderResponse,
  PlaceOrderInput,
  ValidateVoucherResponse,
} from '@/shared/types/commerce.types';

export const checkoutService = {
  async getAddresses() {
    const response = await apiClient.get<ApiResponse<AddressResponse[]>, AddressResponse[]>('/addresses');
    return response.map(toAddress);
  },
  async getCheckoutCarrierOptions() {
    const response = await apiClient.get<ApiResponse<CheckoutCarrierOptionResponse[]>, CheckoutCarrierOptionResponse[]>(
      '/carriers/checkout-options',
    );
    return response.map(toCheckoutCarrierOption);
  },
  async previewOrder(payload: OrderPreviewInput) {
    const response = await apiClient.post<ApiResponse<OrderPreviewResponse>, OrderPreviewResponse>('/orders/preview', payload);
    return toOrderPreview(response);
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
  async placeOrder(payload: PlaceOrderInput, idempotencyKey: string) {
    const response = await apiClient.post<ApiResponse<OrderResponse>, OrderResponse>('/orders', payload, {
      headers: {
        'Idempotency-Key': idempotencyKey,
      },
    });
    return toCommerceOrder(response);
  },
};
