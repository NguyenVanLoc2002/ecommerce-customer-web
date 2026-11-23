import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/constants/queryKeys';
import { orderLifecycleService } from '@/shared/services/orderLifecycleService';

export const useOrderLifecycle = (orderId: string) =>
  useQuery({
    queryKey: queryKeys.orders.lifecycle(orderId),
    queryFn: () => orderLifecycleService.getById(orderId),
    enabled: Boolean(orderId),
  });
