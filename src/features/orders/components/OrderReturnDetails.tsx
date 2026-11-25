import { Link } from 'react-router-dom';

import { routePaths } from '@/constants/routes';
import { Button } from '@/shared/components/ui/Button';
import type { CommerceOrder } from '@/shared/types/commerce.types';
import { formatVnd } from '@/shared/utils/formatVnd';

import { useReturnDetail } from '../hooks/useOrderReturns';
import { exchangeStatusLabels, formatReturnDate, refundStatusLabels, returnStatusLabels } from '../lib/returnLabels';

export const OrderReturnDetails = ({ order, returnId }: { order: CommerceOrder; returnId: string }) => {
  const query = useReturnDetail(order.id, returnId);
  if (query.isPending) return <p className="text-sm text-text-secondary" role="status">Đang tải tiến độ…</p>;
  if (query.isError) {
    return (
      <div className="space-y-2">
        <p className="text-sm text-danger" role="alert">Chưa tải được tiến độ đổi/trả.</p>
        <Button onClick={() => void query.refetch()} variant="secondary">Tải lại tiến độ</Button>
      </div>
    );
  }

  const returnDetail = query.data;
  const itemName = (id: string) => order.items.find((item) => item.id === id)?.productName ?? id;
  const { exchanges, inspection, refund, request, timeline, tracking } = returnDetail;

  return (
    <div className="space-y-4 border-t border-border pt-4 text-sm">
      <p className="whitespace-pre-wrap break-words text-text-secondary">{request.note}</p>

      <section aria-label="Tiến độ đổi/trả">
        <h3 className="font-semibold">Tiến độ đổi/trả</h3>
        <ol className="mt-2 space-y-2">
          {timeline.map((event) => (
            <li className="flex flex-wrap justify-between gap-x-3 gap-y-1 border-b border-border py-2" key={event.status}>
              <span>{returnStatusLabels[event.status]}</span>
              <time className="text-text-secondary" dateTime={event.occurredAt}>{formatReturnDate(event.occurredAt)}</time>
            </li>
          ))}
        </ol>
      </section>

      {tracking ? (
        <section aria-label="Vận chuyển hàng trả" className="space-y-1">
          <h3 className="font-semibold">Vận chuyển hàng trả</h3>
          <p className="break-words">{[tracking.carrier, tracking.trackingNumber].filter(Boolean).join(' · ')}</p>
          {tracking.trackingAt ? <time dateTime={tracking.trackingAt}>{formatReturnDate(tracking.trackingAt)}</time> : null}
        </section>
      ) : null}

      {inspection.length > 0 ? (
        <section aria-label="Kết quả kiểm tra" className="space-y-1">
          <h3 className="font-semibold">Kết quả kiểm tra</h3>
          <ul className="space-y-2">
            {inspection.map((line) => (
              <li className="break-words" key={line.orderItemId}>
                {itemName(line.orderItemId)} · Đã kiểm tra {line.quantity}, nhập lại kho {line.restock}, hư hỏng {line.damaged}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {refund ? (
        <section aria-label="Hoàn tiền" className="space-y-1 rounded bg-surface-soft p-3">
          <h3 className="font-semibold">Hoàn tiền</h3>
          <p>{refundStatusLabels[refund.status]} · {formatVnd(refund.amount)}</p>
          {refund.status === 'COMPLETED' && refund.refundedAt
            ? <time dateTime={refund.refundedAt}>{formatReturnDate(refund.refundedAt)}</time>
            : null}
        </section>
      ) : null}

      {exchanges.length > 0 ? (
        <section aria-label="Đổi hàng" className="space-y-1">
          <h3 className="font-semibold">Đổi hàng</h3>
          <ul className="space-y-2">
            {exchanges.map((exchange) => (
              <li className="space-y-1 break-words" key={exchange.id}>
                <p>{itemName(exchange.orderItemId)} · SL {exchange.quantity} · {exchangeStatusLabels[exchange.status]}</p>
                {exchange.replacementOrderId ? (
                  <Link className="inline-flex min-h-11 items-center text-brand-primary underline" to={routePaths.orderDetail(exchange.replacementOrderId)}>
                    Xem đơn thay thế
                  </Link>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
};
