import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/constants/queryKeys';
import { paymentLifecycleService } from '@/shared/services/paymentLifecycleService';

export const usePaymentLifecycle = (orderId: string) =>
  useQuery({
    queryKey: queryKeys.payments.byOrder(orderId),
    queryFn: () => paymentLifecycleService.getByOrderId(orderId),
    enabled: Boolean(orderId),
  });
