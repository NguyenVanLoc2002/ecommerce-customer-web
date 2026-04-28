export const SHIPMENT_STATUSES = {
  PENDING: 'PENDING',
  IN_TRANSIT: 'IN_TRANSIT',
  OUT_FOR_DELIVERY: 'OUT_FOR_DELIVERY',
  DELIVERED: 'DELIVERED',
  FAILED: 'FAILED',
  RETURNED: 'RETURNED',
} as const;

export type ShipmentStatus = (typeof SHIPMENT_STATUSES)[keyof typeof SHIPMENT_STATUSES];

export type ShipmentEvent = {
  id: string;
  status: ShipmentStatus;
  location: string;
  description: string;
  eventTime: string;
};

export type Shipment = {
  id: string;
  orderId: string;
  orderCode: string;
  shipmentCode: string;
  carrier: string;
  trackingNumber: string;
  status: ShipmentStatus;
  estimatedDeliveryDate: string | null;
  deliveredAt: string | null;
  shippingFee: number;
  note: string | null;
  events: ShipmentEvent[];
  createdAt: string;
  updatedAt: string;
};
