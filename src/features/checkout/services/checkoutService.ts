import { config } from '@/constants/config';
import { apiClient } from '@/shared/lib/axios';
import { mockCommerce } from '@/shared/lib/mockCommerce';
import type { CommerceOrder, CustomerAddress, PlaceOrderInput, VoucherPreview } from '@/shared/types/commerce.types';

export const checkoutService = {
  async getAddresses() {
    if (config.useMockData) {
      return mockCommerce.getAddresses();
    }

    const response = await apiClient.get<CustomerAddress[]>('/addresses');
    return response.data;
  },
  async validateVoucher(code: string) {
    if (config.useMockData) {
      return mockCommerce.validateVoucher(code);
    }

    const response = await apiClient.post<VoucherPreview>(`/vouchers/${code}/validate`, {});
    return response.data;
  },
  async placeOrder(payload: PlaceOrderInput) {
    if (config.useMockData) {
      return mockCommerce.placeOrder(payload);
    }

    const response = await apiClient.post<CommerceOrder>('/orders', payload);
    return response.data;
  },
};

