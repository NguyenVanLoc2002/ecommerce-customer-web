import { apiClient } from '@/shared/lib/axios';
import type { ApiResponse } from '@/shared/types/api.types';
import type { CapturePaymentRequest, InitiatePaymentRequest, PaymentResponse } from '@/shared/types/payment.types';

const normalizeRedirectUrl = (value: string | null | undefined) => {
  if (typeof value !== 'string') {
    return undefined;
  }

  const trimmedValue = value.trim();
  return trimmedValue.length > 0 ? trimmedValue : undefined;
};

export const getPaymentRedirectUrl = (payment: Pick<PaymentResponse, 'paymentUrl' | 'approvalUrl' | 'payUrl' | 'redirectUrl'>) =>
  normalizeRedirectUrl(payment.paymentUrl) ??
  normalizeRedirectUrl(payment.approvalUrl) ??
  normalizeRedirectUrl(payment.payUrl) ??
  normalizeRedirectUrl(payment.redirectUrl);

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
  async capture(orderId: string, payload: CapturePaymentRequest) {
    return apiClient.post<ApiResponse<PaymentResponse>, PaymentResponse>(`/payments/order/${orderId}/capture`, payload);
  },
};
