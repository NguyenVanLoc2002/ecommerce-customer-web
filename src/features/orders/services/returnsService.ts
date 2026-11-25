import { apiClient } from '@/shared/lib/axios';
import type { ApiResponse } from '@/shared/types/api.types';

import type { CreateReturnRequest, OrderReturns, ReturnDetail, ReturnSummary } from '../types/returns.types';

const returnsPath = (orderId: string) => `/orders/${orderId}/returns`;

export const returnsService = {
  getForOrder: (orderId: string, signal?: AbortSignal) =>
    apiClient.get<ApiResponse<OrderReturns>, OrderReturns>(returnsPath(orderId), { signal }),
  getDetail: (orderId: string, returnId: string, signal?: AbortSignal) =>
    apiClient.get<ApiResponse<ReturnDetail>, ReturnDetail>(`${returnsPath(orderId)}/${returnId}`, { signal }),
  create: (orderId: string, payload: CreateReturnRequest, key: string) =>
    apiClient.post<ApiResponse<ReturnSummary>, ReturnSummary>(returnsPath(orderId), payload, {
      headers: { 'Idempotency-Key': key },
    }),
};
