import { Link } from 'react-router-dom';

import { routePaths } from '@/constants/routes';
import { OrderStatusBadge } from '@/shared/components/commerce/OrderStatusBadge';
import { buttonStyles } from '@/shared/components/ui/buttonStyles';
import { getPaymentMethodLabel } from '@/shared/lib/commerceLabels';
import type { CommerceOrder } from '@/shared/types/commerce.types';
import { formatDate } from '@/shared/utils/formatDate';
import { formatVnd } from '@/shared/utils/formatVnd';

type OrderCardProps = {
  order: CommerceOrder;
};

export const OrderCard = ({ order }: OrderCardProps) => (
  <article className="overflow-hidden rounded-md border border-border bg-surface">
    <header className="flex flex-wrap items-center gap-x-8 gap-y-3 bg-surface-soft px-4 py-4 md:px-6">
      <div>
        <p className="text-xs text-text-secondary">Mã đơn hàng</p>
        <h2 className="break-all font-semibold"><Link to={routePaths.orderDetail(order.id)}>#{order.code}</Link></h2>
      </div>
      <div>
        <p className="text-xs text-text-secondary">Ngày đặt</p>
        <p className="text-sm">{formatDate(order.createdAt)}</p>
      </div>
      <div>
        <p className="text-xs text-text-secondary">Thanh toán</p>
        <p className="text-sm">{getPaymentMethodLabel(order.paymentMethod)}</p>
      </div>
      <div className="md:ml-auto"><OrderStatusBadge status={order.status} /></div>
    </header>
    <p className="px-4 pt-4 text-sm text-text-secondary md:px-6">{order.totalItems} sản phẩm</p>
    <footer className="flex flex-wrap items-center justify-between gap-4 border-t border-border px-4 py-4 md:px-6">
      <p className="text-sm text-text-secondary">Tổng giá trị <strong className="ml-2 text-lg text-text-primary">{formatVnd(order.grandTotal)}</strong></p>
      <div className="flex flex-wrap gap-2">
        <Link className={buttonStyles({ variant: 'secondary' })} to={routePaths.orderTracking(order.id)}>Theo dõi vận đơn</Link>
        <Link className={buttonStyles({})} to={routePaths.orderDetail(order.id)}>Xem chi tiết</Link>
      </div>
    </footer>
  </article>
);
