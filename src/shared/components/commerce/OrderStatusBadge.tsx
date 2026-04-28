import { Badge } from '@/shared/components/ui/Badge';
import { ORDER_STATUSES, type OrderStatus } from '@/shared/types/enums';

type OrderStatusBadgeProps = {
  status: OrderStatus;
};

const labels: Record<OrderStatus, string> = {
  [ORDER_STATUSES.PENDING]: 'Pending',
  [ORDER_STATUSES.AWAITING_PAYMENT]: 'Awaiting Payment',
  [ORDER_STATUSES.CONFIRMED]: 'Confirmed',
  [ORDER_STATUSES.PROCESSING]: 'Processing',
  [ORDER_STATUSES.SHIPPED]: 'Shipped',
  [ORDER_STATUSES.DELIVERED]: 'Delivered',
  [ORDER_STATUSES.COMPLETED]: 'Completed',
  [ORDER_STATUSES.CANCELLED]: 'Cancelled',
};

const tones: Record<OrderStatus, 'brand' | 'sale' | 'neutral'> = {
  [ORDER_STATUSES.PENDING]: 'neutral',
  [ORDER_STATUSES.AWAITING_PAYMENT]: 'neutral',
  [ORDER_STATUSES.CONFIRMED]: 'brand',
  [ORDER_STATUSES.PROCESSING]: 'neutral',
  [ORDER_STATUSES.SHIPPED]: 'neutral',
  [ORDER_STATUSES.DELIVERED]: 'brand',
  [ORDER_STATUSES.COMPLETED]: 'brand',
  [ORDER_STATUSES.CANCELLED]: 'sale',
};

export const OrderStatusBadge = ({ status }: OrderStatusBadgeProps) => (
  <Badge
    className={status === ORDER_STATUSES.COMPLETED ? 'bg-text-primary text-surface ring-0' : undefined}
    tone={tones[status]}
  >
    {labels[status]}
  </Badge>
);
