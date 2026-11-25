import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/constants/queryKeys';
import { paymentLifecycleService } from '@/shared/services/paymentLifecycleService';

export const usePaymentLifecycle = (orderId: string, enabled = true) =>
  useQuery({
    queryKey: queryKeys.payments.byOrder(orderId),
    queryFn: () => paymentLifecycleService.getByOrderId(orderId),
    enabled: enabled && Boolean(orderId),
  });
