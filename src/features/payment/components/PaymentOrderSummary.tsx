import { MapPin } from 'lucide-react';

import { OrderStatusBadge } from '@/shared/components/commerce/OrderStatusBadge';
import type { OrderResponse } from '@/shared/types/commerce.types';
import { formatVnd } from '@/shared/utils/formatVnd';

type PaymentOrderSummaryProps = {
  order: OrderResponse;
  title?: string;
  showDelivery?: boolean;
};

export const PaymentOrderSummary = ({ order, title = 'Tóm tắt đơn hàng', showDelivery = false }: PaymentOrderSummaryProps) => (
  <section aria-label="Tóm tắt đơn hàng" className="min-w-0 rounded-lg border border-border bg-surface p-5 md:p-8">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide">{title}</h2>
      <OrderStatusBadge status={order.status} />
    </div>
    <p className="mt-2 break-all text-lg font-semibold">{order.orderCode}</p>
    <ul className="mt-5 divide-y divide-border border-y border-border">
      {order.items.map((item) => (
        <li className="flex gap-4 py-4" key={item.id}>
          {item.productImageUrl ? (
            <img alt={item.productName} className="aspect-[5/6] w-16 shrink-0 rounded object-cover sm:w-20" height={96} src={item.productImageUrl} width={80} />
          ) : null}
          <div className="flex min-w-0 flex-1 flex-col break-words text-sm">
            {item.brandName ? <p className="mb-1 text-xs uppercase tracking-wide text-text-secondary">{item.brandName}</p> : null}
            <p className="font-semibold">{item.productName}</p>
            <p className="mt-1 text-text-secondary">{item.variantName}</p>
            <div className="mt-2 flex flex-wrap justify-between gap-x-4 gap-y-1">
              <span className="text-text-secondary">Số lượng {item.quantity}</span>
              <span>{formatVnd(item.lineTotal)}</span>
            </div>
          </div>
        </li>
      ))}
    </ul>
    <dl className="mt-5 space-y-2 text-sm">
      <div className="flex justify-between gap-3"><dt>Tạm tính</dt><dd>{formatVnd(order.subTotal)}</dd></div>
      {order.discountAmount > 0 ? <div className="flex justify-between gap-3"><dt>Giảm giá</dt><dd>{formatVnd(-order.discountAmount)}</dd></div> : null}
      <div className="flex justify-between gap-3"><dt>Phí giao hàng</dt><dd>{formatVnd(order.shippingFee)}</dd></div>
      <div className="flex justify-between gap-3 border-t border-border pt-3 font-semibold"><dt>Tổng đơn hàng</dt><dd>{formatVnd(order.totalAmount)}</dd></div>
    </dl>
    {showDelivery && order.shippingStreetAddress ? (
      <div className="mt-6 border-t border-border pt-5">
        <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide">
          <MapPin aria-hidden="true" className="size-4" />
          Địa chỉ nhận hàng
        </h3>
        <p className="mt-3 text-sm font-semibold">{order.shippingReceiverName}</p>
        <p className="mt-1 break-words text-sm leading-relaxed text-text-secondary">
          {[order.shippingStreetAddress, order.shippingWard, order.shippingDistrict, order.shippingCity].filter(Boolean).join(', ')}
        </p>
        {order.carrierName ? <p className="mt-2 text-sm text-text-secondary">{order.carrierName}</p> : null}
      </div>
    ) : null}
  </section>
);
