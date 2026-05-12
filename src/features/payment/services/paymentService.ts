import { apiClient } from '@/shared/lib/axios';
import type { ApiResponse } from '@/shared/types/api.types';
import type { InitiatePaymentRequest, PaymentResponse } from '@/shared/types/payment.types';

export const paymentService = {
  async getByOrderId(orderId: string) {
    return apiClient.get<ApiResponse<PaymentResponse>, PaymentResponse>(`/payments/order/${orderId}`);
  },
  async initiate(orderId: string, payload: InitiatePaymentRequest | undefined, idempotencyKey: string) {
    return apiClient.post<ApiResponse<PaymentResponse>, PaymentResponse>(
      `/payments/order/${orderId}/initiate`,
      payload ?? {},
      {
        headers: {
          'Idempotency-Key': idempotencyKey,
        },
      },
    );
  },
};
