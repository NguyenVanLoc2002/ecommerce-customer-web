import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/constants/queryKeys';
import { hasShipmentErrorCode } from '@/shared/lib/shipmentTracking';
import { shipmentService } from '@/shared/services/shipmentService';
import { useAuthStore } from '@/shared/stores/authStore';

export const useShipmentByOrderId = (orderId: string, enabled = true) => {
  const customerUserId = useAuthStore((state) => state.user?.id);

  return useQuery({
    queryKey: [...queryKeys.shipments.byOrder(orderId), customerUserId],
    queryFn: () => shipmentService.getByOrderId(orderId),
    enabled: enabled && Boolean(orderId) && Boolean(customerUserId),
    retry: (failureCount, error) => failureCount < 1 && !hasShipmentErrorCode(error, 'ORDER_NOT_FOUND'),
  });
};
