import { Link } from 'react-router-dom';

import { routePaths, routes } from '@/constants/routes';
import { OrderStatusBadge } from '@/shared/components/commerce/OrderStatusBadge';
import type { CommerceOrder } from '@/shared/types/commerce.types';
import { formatDate } from '@/shared/utils/formatDate';
import { formatMoney } from '@/shared/utils/formatMoney';

type OrderCardProps = {
  order: CommerceOrder;
};

export const OrderCard = ({ order }: OrderCardProps) => (
  <article className="border border-border bg-surface px-5 py-5 md:px-6">
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_280px] xl:items-start">
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <OrderStatusBadge status={order.status} />
          <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-outline">{order.code}</span>
        </div>
        <div className="space-y-3">
          <h2 className="font-display text-[2.15rem] leading-none text-text-primary">
            <Link to={routePaths.orderDetail(order.id)}>Order placed {formatDate(order.createdAt)}</Link>
          </h2>
          <p className="text-sm uppercase tracking-[0.1em] text-text-secondary">
            {order.totalItems} item{order.totalItems === 1 ? '' : 's'} / {order.paymentMethod === 'COD' ? 'Cash on delivery' : 'Online payment'}
          </p>
          <p className="text-sm leading-7 text-text-secondary">
            Updated {formatDate(order.updatedAt)}. Review the archive, track fulfillment, or reopen the full order breakdown.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {order.items.slice(0, 4).map((item) => (
            <img
              alt={item.primaryImage.alt}
              className="aspect-[4/5] w-full bg-surface-soft object-cover"
              height={item.primaryImage.height}
              key={item.id}
              loading="lazy"
              src={item.primaryImage.src}
              width={item.primaryImage.width}
            />
          ))}
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-3 border-t border-border pt-4 text-[11px] font-bold uppercase tracking-[0.18em] text-text-primary">
          <Link className="underline decoration-border underline-offset-4 transition-colors hover:decoration-text-primary" to={routePaths.orderDetail(order.id)}>
            Order details
          </Link>
          <Link className="underline decoration-border underline-offset-4 transition-colors hover:decoration-text-primary" to={routePaths.orderTracking(order.id)}>
            Track package
          </Link>
          <Link className="underline decoration-border underline-offset-4 transition-colors hover:decoration-text-primary" to={routes.products}>
            Reorder
          </Link>
          <Link className="underline decoration-border underline-offset-4 transition-colors hover:decoration-text-primary" to={routes.products}>
            Support
          </Link>
        </div>
      </div>
      <div className="border-t border-border pt-5 xl:border-l xl:border-t-0 xl:pl-6 xl:pt-0">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-outline">Total value</p>
        <p className="mt-3 font-display text-[2.4rem] leading-none text-text-primary">{formatMoney(order.grandTotal)}</p>
        <div className="mt-5 space-y-4 text-sm text-text-secondary">
          <div className="flex items-center justify-between gap-4">
            <span>Items</span>
            <span className="text-text-primary">{order.totalItems}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span>Shipping</span>
            <span className="text-text-primary">{order.shippingFee === 0 ? 'Included' : formatMoney(order.shippingFee)}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span>Discount</span>
            <span className="text-text-primary">{order.discountTotal === 0 ? '$0' : `-${formatMoney(order.discountTotal)}`}</span>
          </div>
          <div className="flex items-center justify-between gap-4 border-t border-border pt-4 text-[11px] font-bold uppercase tracking-[0.18em] text-text-primary">
            <span>Payment</span>
            <span>{order.paymentMethod === 'COD' ? 'COD' : 'Online'}</span>
          </div>
        </div>
      </div>
    </div>
  </article>
);
