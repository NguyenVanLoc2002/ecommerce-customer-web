import { apiClient } from '@/shared/lib/axios';
import { toInvoice } from '@/shared/lib/apiMappers';
import type { ApiResponse } from '@/shared/types/api.types';
import type { InvoiceResponse } from '@/shared/types/invoice.types';

export const invoiceService = {
  async getByOrderId(orderId: string) {
    const response = await apiClient.get<ApiResponse<InvoiceResponse>, InvoiceResponse>(`/invoices/order/${orderId}`);
    return toInvoice(response);
  },
};
