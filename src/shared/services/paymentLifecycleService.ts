import { apiClient } from '@/shared/lib/axios';
import type { ApiResponse } from '@/shared/types/api.types';
import type { PaymentResponse } from '@/shared/types/payment.types';

export const paymentLifecycleService = {
  getByOrderId(orderId: string) {
    return apiClient.get<ApiResponse<PaymentResponse>, PaymentResponse>(`/payments/order/${orderId}`);
  },
};
