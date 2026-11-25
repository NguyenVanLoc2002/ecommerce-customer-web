import { apiClient } from '@/shared/lib/axios';
import { hasShipmentErrorCode } from '@/shared/lib/shipmentTracking';
import type { ApiResponse } from '@/shared/types/api.types';
import type { ShipmentResponse } from '@/shared/types/shipment.types';

export const shipmentService = {
  async getByOrderId(orderId: string) {
    try {
      return await apiClient.get<ApiResponse<ShipmentResponse>, ShipmentResponse>(`/shipments/order/${orderId}`);
    } catch (error) {
      if (hasShipmentErrorCode(error, 'SHIPMENT_NOT_FOUND')) {
        return null;
      }
      throw error;
    }
  },
};
