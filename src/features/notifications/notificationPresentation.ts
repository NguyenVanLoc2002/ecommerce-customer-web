import { Bell, Package, Shield, Sparkles, Truck, Wallet } from 'lucide-react';

import { routePaths } from '@/constants/routes';
import type { Notification } from '@/shared/types/notification.types';

export const categories = {
  order: { label: 'Đơn hàng', Icon: Package },
  payment: { label: 'Thanh toán', Icon: Wallet },
  shipping: { label: 'Vận chuyển', Icon: Truck },
  promo: { label: 'Khuyến mãi', Icon: Sparkles },
  security: { label: 'Bảo mật', Icon: Shield },
} as const;

export type Category = keyof typeof categories;
export const generalCategory = { label: 'Cập nhật', Icon: Bell };

export const getCategory = (type: string): Category | undefined => {
  if (['SHIPMENT', 'ORDER_SHIPPED'].includes(type)) return 'shipping';
  if (['ORDER', 'ORDER_PLACED', 'ORDER_CONFIRMED', 'ORDER_CANCELLED', 'ORDER_DELIVERED', 'ORDER_COMPLETED', 'RETURN_UPDATED'].includes(type)) return 'order';
  if (['PAYMENT', 'PAYMENT_RECEIVED', 'PAYMENT_FAILED'].includes(type)) return 'payment';
  if (['PROMOTION', 'VOUCHER_RECEIVED'].includes(type)) return 'promo';
  if (type === 'SECURITY') return 'security';
  return undefined;
};

export const getNotificationAction = ({ referenceType, referenceId, type }: Notification) => {
  if (referenceType !== 'ORDER' || !referenceId || !/^[a-z0-9_-]+$/i.test(referenceId)) return undefined;

  const category = getCategory(type);
  if (category === 'shipping') return { to: routePaths.orderTracking(referenceId), label: 'Theo dõi đơn hàng' };
  if (category === 'payment') return { to: routePaths.paymentResult(referenceId), label: 'Xem thanh toán' };
  return { to: routePaths.orderDetail(referenceId), label: 'Xem đơn hàng' };
};

const dateFormat = new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short', timeStyle: 'short' });

export const formatNotificationDate = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : dateFormat.format(date);
};

export const groupNotifications = (notifications: Notification[]) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - (today.getDay() + 6) % 7);
  const groups: { label: string; items: Notification[] }[] = [
    { label: 'Hôm nay', items: [] },
    { label: 'Tuần này', items: [] },
    { label: 'Trước đó', items: [] },
  ];

  for (const notification of notifications) {
    const createdAt = new Date(notification.createdAt);
    const group = createdAt >= today ? groups[0] : createdAt >= weekStart ? groups[1] : groups[2];
    group.items.push(notification);
  }
  return groups.filter(({ items }) => items.length > 0);
};
