import { apiClient } from '@/shared/lib/axios';
import type { ApiResponse } from '@/shared/types/api.types';
import type { ShipmentResponse } from '@/shared/types/shipment.types';

export const shipmentService = {
  async getByOrderId(orderId: string) {
    return apiClient.get<ApiResponse<ShipmentResponse>, ShipmentResponse>(`/shipments/order/${orderId}`);
  },
};
