import { useId, useRef, useState } from 'react';

import { Button } from '@/shared/components/ui/Button';
import type { CommerceOrder } from '@/shared/types/commerce.types';

import { useOrderReturns } from '../hooks/useOrderReturns';
import { formatReturnDate, returnReasonLabels, returnStatusLabels } from '../lib/returnLabels';
import { OrderReturnDetails } from './OrderReturnDetails';
import { ReturnRequestForm } from './ReturnRequestForm';

export const OrderReturnsPanel = ({ order }: { order: CommerceOrder }) => {
  const titleId = useId();
  const heading = useRef<HTMLHeadingElement>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [created, setCreated] = useState(false);
  const [openRequests, setOpenRequests] = useState<string[]>([]);
  const query = useOrderReturns(order.id);
  const summary = query.data;

  return (
    <section aria-labelledby={titleId} className="scroll-mt-24 space-y-4 rounded bg-surface p-5 shadow-sm md:p-8">
      <h2 className="scroll-mt-24 text-sm font-bold uppercase tracking-wide" id={titleId} ref={heading} tabIndex={-1}>Đổi/trả hàng</h2>
      <p className="text-sm font-medium text-success" role="status">{created ? 'Đã gửi yêu cầu đổi/trả.' : null}</p>
      {query.isPending ? <p className="text-sm text-text-secondary" role="status">Đang tải yêu cầu đổi/trả…</p> : null}
      {query.isError ? (
        <div className="space-y-2">
          <p className="text-sm text-danger" role="alert">Chưa tải được yêu cầu đổi/trả.</p>
          <Button onClick={() => void query.refetch()} variant="secondary">Tải lại đổi/trả</Button>
        </div>
      ) : null}
      {summary ? (
        <>
          {summary.requests.length === 0 ? <p className="text-sm text-text-secondary">Chưa có yêu cầu đổi/trả.</p> : (
            <ul className="divide-y divide-border border-y border-border">
              {summary.requests.map((request) => (
                <li className="py-3" key={request.id}>
                  <details
                    className="space-y-3"
                    onToggle={({ currentTarget }) => {
                      const isOpen = currentTarget.open;
                      setOpenRequests((ids) => isOpen ? [...ids, request.id] : ids.filter((id) => id !== request.id));
                    }}
                  >
                    <summary className="min-h-11 cursor-pointer py-2 text-sm font-semibold">
                      {returnReasonLabels[request.reason]} · {returnStatusLabels[request.status]}
                      <span className="ml-2 whitespace-nowrap text-xs font-normal text-text-secondary">{formatReturnDate(request.createdAt)}</span>
                    </summary>
                    <ul className="space-y-1 text-sm">
                      {request.items.map((line) => (
                        <li className="break-words" key={line.orderItemId}>
                          {order.items.find((item) => item.id === line.orderItemId)?.productName ?? line.orderItemId} · SL {line.quantity}
                        </li>
                      ))}
                    </ul>
                    {openRequests.includes(request.id) ? <OrderReturnDetails order={order} returnId={request.id} /> : null}
                  </details>
                </li>
              ))}
            </ul>
          )}
          {formOpen ? (
            <ReturnRequestForm
              eligibleItems={summary.eligibleItems}
              onCreated={() => {
                setCreated(true);
                setFormOpen(false);
                heading.current?.focus({ preventScroll: true });
                heading.current?.scrollIntoView({ block: 'start' });
              }}
              onEligibilityChanged={() => void query.refetch()}
              order={order}
            />
          ) : summary.eligibleItems.length > 0 ? (
            <Button disabled={query.isError} onClick={() => { setCreated(false); setFormOpen(true); }} variant="secondary">
              Yêu cầu đổi/trả
            </Button>
          ) : (
            <p className="text-sm text-text-secondary">Hiện chưa có sản phẩm đủ điều kiện đổi/trả.</p>
          )}
        </>
      ) : null}
    </section>
  );
};
