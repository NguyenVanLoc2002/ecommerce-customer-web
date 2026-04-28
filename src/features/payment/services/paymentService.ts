import { config } from '@/constants/config';
import { apiClient } from '@/shared/lib/axios';
import { mockCommerce } from '@/shared/lib/mockCommerce';
import { normalizeApiError } from '@/shared/lib/normalizeApiError';
import type { InitiatePaymentRequest, Payment } from '@/shared/types/payment.types';

export const paymentService = {
  async getByOrderId(orderId: string) {
    try {
      if (config.useMockData) {
        return await mockCommerce.getPaymentByOrderId(orderId);
      }

      const response = await apiClient.get<Payment>(`/payments/order/${orderId}`);
      return response.data;
    } catch (error) {
      throw normalizeApiError(error);
    }
  },
  async initiate(orderId: string, payload?: InitiatePaymentRequest) {
    try {
      if (config.useMockData) {
        return await mockCommerce.initiatePayment(orderId);
      }

      const response = await apiClient.post<Payment>(`/payments/order/${orderId}/initiate`, payload ?? {});
      return response.data;
    } catch (error) {
      throw normalizeApiError(error);
    }
  },
};
