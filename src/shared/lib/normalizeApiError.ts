import axios from 'axios';

import { createServiceError } from '@/shared/lib/serviceError';

type ApiErrorPayload = {
  code?: string;
  message?: string;
  errors?: Array<{
    field?: string;
    message?: string;
  }>;
};

export const normalizeApiError = (error: unknown) => {
  if (!axios.isAxiosError<ApiErrorPayload>(error)) {
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
