import axios from 'axios';

import { createServiceError } from '@/shared/lib/serviceError';
import type { ApiErrorResponse } from '@/shared/types/api.types';

export const normalizeApiError = (error: unknown) => {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return error;
  }

  const payload = error.response?.data;
  if (!payload) {
    return createServiceError('REQUEST_FAILED', error.message);
  }

  const fieldErrors =
    payload.errors?.reduce<Record<string, string>>((accumulator, item) => {
      if (item.field && item.message) {
        accumulator[item.field] = item.message;
      }
      return accumulator;
    }, {}) ?? undefined;

  return createServiceError(payload.code ?? 'REQUEST_FAILED', payload.message ?? error.message, fieldErrors);
};
