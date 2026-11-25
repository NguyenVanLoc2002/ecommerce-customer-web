import { SHIPMENT_STATUSES, type Shipment, type ShipmentAttention, type ShipmentEvent, type ShipmentStatus } from '@/shared/types/shipment.types';

export const shipmentStatusLabels: Record<ShipmentStatus, string> = {
  PENDING: 'Chờ lấy hàng',
  PICKING: 'Đang lấy hàng',
  IN_TRANSIT: 'Đang vận chuyển',
  OUT_FOR_DELIVERY: 'Đang giao hàng',
  DELIVERED: 'Đã giao hàng',
  FAILED: 'Giao hàng thất bại',
  RETURNED: 'Đã hoàn về người gửi',
};

export const shipmentAttentionLabels: Record<ShipmentAttention, string> = {
  DELIVERY_FAILED: shipmentStatusLabels.FAILED,
  CARRIER_CANCELLED: 'Đơn vị vận chuyển đã hủy vận đơn',
  RETURNED_HANDLING: shipmentStatusLabels.RETURNED,
};

export const getShipmentAttention = ({
  attention,
  status,
  providerStatus,
}: Pick<Shipment, 'attention' | 'status' | 'providerStatus'>): ShipmentAttention | null => {
  if (attention && Object.prototype.hasOwnProperty.call(shipmentAttentionLabels, attention)) return attention;
  if (status === SHIPMENT_STATUSES.RETURNED) return 'RETURNED_HANDLING';
  if (status === SHIPMENT_STATUSES.FAILED) {
    return providerStatus?.trim().toUpperCase() === 'CANCELLED' ? 'CARRIER_CANCELLED' : 'DELIVERY_FAILED';
  }
  return null;
};

export const getShipmentEventsNewestFirst = (events: ShipmentEvent[]) =>
  [...events].sort((left, right) => Date.parse(right.eventTime) - Date.parse(left.eventTime));

const shipmentTimestamp = new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short', timeStyle: 'short' });

export const formatShipmentTimestamp = (value: string) => shipmentTimestamp.format(new Date(value));

export const getCarrierTrackingUrl = (value?: string | null) => {
  if (!value?.trim()) return null;
  try {
    const url = new URL(value);
    return (url.protocol === 'https:' || url.protocol === 'http:') && !url.username && !url.password ? url.href : null;
  } catch {
    return null;
  }
};

export const hasShipmentErrorCode = (error: unknown, code: string) =>
  error instanceof Error && 'code' in error && error.code === code;
