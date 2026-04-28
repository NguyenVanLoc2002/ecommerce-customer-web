import { config } from '@/constants/config';
import { apiClient } from '@/shared/lib/axios';
import { mockCommerce } from '@/shared/lib/mockCommerce';
import { normalizeApiError } from '@/shared/lib/normalizeApiError';
import type { Shipment } from '@/shared/types/shipment.types';

export const shipmentService = {
  async getByOrderId(orderId: string) {
    try {
      if (config.useMockData) {
        return await mockCommerce.getShipmentByOrderId(orderId);
      }

      const response = await apiClient.get<Shipment>(`/shipments/order/${orderId}`);
      return response.data;
    } catch (error) {
      throw normalizeApiError(error);
    }
  },
};
