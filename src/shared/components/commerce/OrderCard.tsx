import { Truck } from 'lucide-react';
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
  <article className="overflow-hidden rounded bg-surface shadow-sm">
    <header className="flex flex-wrap items-center gap-x-6 gap-y-3 bg-surface-muted px-4 py-4 md:gap-x-8 md:px-6">
      <div>
        <p className="text-xs uppercase tracking-wide text-text-secondary">Mã đơn hàng</p>
        <h2 className="break-all font-semibold"><Link to={routePaths.orderDetail(order.id)}>#{order.code}</Link></h2>
      </div>
      <div>
        <p className="text-xs uppercase tracking-wide text-text-secondary">Ngày đặt</p>
        <p className="text-sm">{formatDate(order.createdAt)}</p>
      </div>
      <div>
        <p className="text-xs uppercase tracking-wide text-text-secondary">Thanh toán</p>
        <p className="text-sm">{getPaymentMethodLabel(order.paymentMethod)}</p>
      </div>
      <div className="md:ml-auto"><OrderStatusBadge status={order.status} /></div>
    </header>
    {order.items.length ? (
      <ul aria-label="Sản phẩm trong đơn" className="divide-y divide-border px-4 py-1 md:px-6 md:py-2">
        {order.items.map((item) => (
          <li className="grid grid-cols-[68px_minmax(0,1fr)] items-center gap-x-4 gap-y-2 py-4 sm:grid-cols-[80px_minmax(0,1fr)_auto] md:py-5" key={item.id}>
            <img alt={item.primaryImage.alt} className="row-span-2 aspect-[5/7] w-full rounded bg-surface-soft object-cover sm:row-span-1" height={item.primaryImage.height} loading="lazy" src={item.primaryImage.src} width={item.primaryImage.width} />
            <div className="min-w-0 break-words">
              <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary">{item.brandName}</p>
              <p className="mt-1 font-semibold">{item.productName}</p>
              {item.variantName ? <p className="mt-1 text-sm text-text-secondary">Phân loại: {item.variantName}</p> : null}
              <p className="mt-1 text-sm text-text-secondary">Số lượng: {item.quantity}</p>
            </div>
            <p className="col-start-2 text-sm font-semibold sm:col-start-auto sm:text-right">{formatVnd(item.subtotal)}</p>
          </li>
        ))}
      </ul>
    ) : (
      <p className="px-4 py-4 text-sm text-text-secondary md:px-6">{order.totalItems} sản phẩm</p>
    )}
    {(order.remainingItemLines ?? 0) > 0 ? (
      <Link className="inline-flex min-h-11 items-center px-4 text-sm font-medium text-brand-primary underline underline-offset-4 md:px-6" to={routePaths.orderDetail(order.id)}>
        Xem thêm {order.remainingItemLines} dòng sản phẩm
      </Link>
    ) : null}
    <footer className="flex flex-wrap items-center justify-between gap-4 border-t border-border px-4 py-4 md:px-6">
      <p className="text-sm text-text-secondary">Tổng giá trị <strong className="ml-2 text-lg text-text-primary">{formatVnd(order.grandTotal)}</strong></p>
      <div className="flex flex-wrap gap-2">
        <Link className={buttonStyles({ variant: 'secondary' })} to={routePaths.orderTracking(order.id)}><Truck aria-hidden="true" className="size-4" />Theo dõi vận đơn</Link>
        <Link className={buttonStyles({ className: 'border-text-primary bg-text-primary' })} to={routePaths.orderDetail(order.id)}>Xem chi tiết</Link>
      </div>
    </footer>
  </article>
);
