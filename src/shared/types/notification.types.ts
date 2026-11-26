import type { ProductImage } from '@/shared/types/catalog.types';

export const NOTIFICATION_STATUSES = {
  UNREAD: 'UNREAD',
  READ: 'READ',
} as const;

export type NotificationStatus = (typeof NOTIFICATION_STATUSES)[keyof typeof NOTIFICATION_STATUSES];

export const NOTIFICATION_TYPES = {
  ORDER: 'ORDER',
  PAYMENT: 'PAYMENT',
  SHIPMENT: 'SHIPMENT',
  PROMOTION: 'PROMOTION',
  SECURITY: 'SECURITY',
} as const;

export interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  referenceId: string | null;
  referenceType: string | null;
  read: boolean;
  status: NotificationStatus;
  readAt: string | null;
  createdAt: string;
  previewImage?: ProductImage;
  actionLabel?: string;
}

export interface NotificationResponse {
  id: string;
  type: string;
  title: string;
  body: string;
  referenceId: string | null;
  referenceType: string | null;
  read: boolean;
  readAt: string | null;
  createdAt: string;
}

export interface UnreadCountResponse {
  count: number;
}
