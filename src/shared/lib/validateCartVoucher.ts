import { apiClient } from '@/shared/lib/axios';
import { toVoucherPreview } from '@/shared/lib/apiMappers';
import type { ApiResponse } from '@/shared/types/api.types';
import type { ValidateVoucherResponse } from '@/shared/types/commerce.types';

export const validateCartVoucher = async (code: string, orderAmount: number) => {
  const response = await apiClient.post<ApiResponse<ValidateVoucherResponse>, ValidateVoucherResponse>(
    `/vouchers/${encodeURIComponent(code)}/validate`,
    { orderAmount },
  );
  return toVoucherPreview(code, response);
};
