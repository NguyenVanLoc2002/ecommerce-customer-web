import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/constants/queryKeys';
import { shipmentService } from '@/features/shipment/services/shipmentService';

export const useShipmentByOrderId = (orderId: string) =>
  useQuery({
    queryKey: queryKeys.shipments.byOrder(orderId),
    queryFn: () => shipmentService.getByOrderId(orderId),
    enabled: Boolean(orderId),
  });
