import type { ApiResponse } from '../types/api.types';

export const unwrapApiResponseData = <T>(payload: ApiResponse<T> | T) => {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return payload.data;
  }

  return payload;
};
