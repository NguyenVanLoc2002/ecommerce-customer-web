import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/constants/queryKeys';
import { invoiceService } from '@/features/invoice/services/invoiceService';

export const useInvoiceByOrderId = (orderId: string) =>
  useQuery({
    queryKey: queryKeys.invoices.byOrder(orderId),
    queryFn: () => invoiceService.getByOrderId(orderId),
    enabled: Boolean(orderId),
  });
