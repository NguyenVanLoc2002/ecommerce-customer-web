import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { routePaths } from '@/constants/routes';
import { useCancelOrder, useOrderDetail } from '@/features/orders/hooks/useOrders';
import { OrderSummaryPanel } from '@/shared/components/commerce/OrderSummaryPanel';
import { OrderStatusBadge } from '@/shared/components/commerce/OrderStatusBadge';
import { OrderStatusStepper } from '@/shared/components/commerce/OrderStatusStepper';
import { EmptyState } from '@/shared/components/feedback/EmptyState';
import { ErrorCard } from '@/shared/components/feedback/ErrorCard';
import { LoadingOverlay } from '@/shared/components/feedback/LoadingOverlay';
import { Container } from '@/shared/components/layout/Container';
import { ConfirmDialog } from '@/shared/components/overlays/ConfirmDialog';
import { PageSEO } from '@/shared/components/seo/PageSEO';
import { Button } from '@/shared/components/ui/Button';
import { buttonStyles } from '@/shared/components/ui/buttonStyles';
import { getPaymentMethodLabel, getPaymentMethodNote } from '@/shared/lib/commerceLabels';
import { useUiStore } from '@/shared/stores/uiStore';
import { formatAddress } from '@/shared/utils/formatAddress';
import { formatDate } from '@/shared/utils/formatDate';
import { formatMoney } from '@/shared/utils/formatMoney';
import { ORDER_STATUSES, PAYMENT_METHODS } from '@/shared/types/enums';

const actionLinkClassName =
  'text-[11px] font-bold uppercase tracking-[0.18em] text-text-primary underline decoration-border underline-offset-4 transition-colors hover:decoration-text-primary';

export const OrderDetailPage = () => {
  const { orderId = '' } = useParams();
  const addToast = useUiStore((state) => state.addToast);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const orderQuery = useOrderDetail(orderId);
  const cancelOrder = useCancelOrder();
  const order = orderQuery.data;
  const paymentActionVisible =
    order?.paymentMethod === PAYMENT_METHODS.ONLINE && order.status === ORDER_STATUSES.AWAITING_PAYMENT;
  const shipmentActionVisible =
    order?.status === ORDER_STATUSES.PROCESSING ||
    order?.status === ORDER_STATUSES.SHIPPED ||
    order?.status === ORDER_STATUSES.DELIVERED ||
    order?.status === ORDER_STATUSES.COMPLETED;
  const reviewActionVisible =
    order?.status === ORDER_STATUSES.DELIVERED || order?.status === ORDER_STATUSES.COMPLETED;

  return (
    <>
      <PageSEO
        description="Review line items, totals, status progression, and cancel eligibility for this order."
        noIndex
        path={routePaths.orderDetail(orderId || 'order')}
        title="Order Detail"
      />
      <Container className="space-y-8 pb-16 pt-28 md:space-y-10 md:pb-20 md:pt-32">
        {orderQuery.isLoading ? <LoadingOverlay className="min-h-[320px] border-border bg-surface" inline label="Loading order detail..." /> : null}
        {orderQuery.isError ? (
          <ErrorCard
            action={<Button onClick={() => void orderQuery.refetch()}>Retry</Button>}
            className="border-border bg-surface"
            description="The order detail could not be loaded from the mock commerce source."
            title="Order detail unavailable"
          />
        ) : null}
        {!orderQuery.isLoading && !order ? (
          <EmptyState
            className="border-border bg-surface px-6 py-16"
            description="The requested order could not be found in the current customer order set."
            title="Order not found."
          />
        ) : null}
        {order ? (
          <>
            <div className="flex flex-col gap-5 border-b border-border pb-8 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <OrderStatusBadge status={order.status} />
                  <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-outline">{formatDate(order.createdAt)}</span>
                </div>
                <h1 className="mt-4 font-display text-[3.5rem] leading-none text-text-primary md:text-[4.5rem]">Order #{order.code}</h1>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-text-secondary">
                  Updated {formatDate(order.updatedAt)}. Review the shipment rhythm, download the invoice, or track the fulfillment handoff.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                {shipmentActionVisible ? (
                  <Link className={buttonStyles({ variant: 'ghost' })} to={routePaths.orderTracking(order.id)}>
                    Track shipment
                  </Link>
                ) : null}
                {reviewActionVisible ? (
                  <Link className={buttonStyles({ variant: 'ghost' })} to={routePaths.orderReview(order.id)}>
                    Write review
                  </Link>
                ) : null}
                {paymentActionVisible ? (
                  <Link className={buttonStyles({ variant: 'ghost' })} to={routePaths.paymentResult(order.id)}>
                    Pay now
                  </Link>
                ) : null}
                <Link className={buttonStyles({ variant: 'ghost' })} to={routePaths.orderInvoice(order.id)}>
                  Download invoice
                </Link>
                {order.canCancel ? (
                  <Button onClick={() => setConfirmOpen(true)} variant="secondary">
                    Cancel order
                  </Button>
                ) : null}
              </div>
            </div>

            <OrderStatusStepper status={order.status} />

            <div className="grid gap-10 xl:grid-cols-[minmax(0,1fr)_380px]">
              <section className="space-y-4">
                <section className="border border-border bg-surface px-5 py-5 md:px-6">
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-outline">Items</p>
                  <div className="mt-6 space-y-5">
                    {order.items.map((item) => (
                      <article className="grid gap-4 border-b border-border pb-5 last:border-b-0 last:pb-0 md:grid-cols-[104px_minmax(0,1fr)_auto]" key={item.id}>
                        <img
                          alt={item.primaryImage.alt}
                          className="aspect-[4/5] w-full bg-surface-soft object-cover"
                          height={item.primaryImage.height}
                          loading="lazy"
                          src={item.primaryImage.src}
                          width={item.primaryImage.width}
                        />
                        <div>
                          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-outline">{item.brandName}</p>
                          <h2 className="mt-3 font-display text-[1.5rem] leading-none text-text-primary">{item.productName}</h2>
                          <p className="mt-3 text-sm uppercase tracking-[0.08em] text-text-secondary">
                            {item.color} / {item.size} / Qty {item.quantity}
                          </p>
                          <p className="mt-2 text-xs uppercase tracking-[0.16em] text-outline">{item.sku}</p>
                        </div>
                        <div className="text-left md:text-right">
                          <p className="text-sm text-text-primary">{formatMoney(item.subtotal)}</p>
                          <p className="mt-2 text-sm text-text-secondary">{formatMoney(item.unitPrice)} each</p>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>

                <div className="grid gap-4 lg:grid-cols-2">
                  <section className="border border-border bg-surface px-5 py-5 md:px-6">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-outline">Shipping address</p>
                      <Link className={actionLinkClassName} to={routePaths.orderTracking(order.id)}>
                        View shipment
                      </Link>
                    </div>
                    <h2 className="mt-3 font-display text-[2rem] leading-none text-text-primary">{order.shippingAddress.receiverName}</h2>
                    <p className="mt-4 text-sm uppercase tracking-[0.08em] text-text-secondary">{order.shippingAddress.phoneNumber}</p>
                    <p className="mt-3 text-sm leading-7 text-text-secondary">{formatAddress(order.shippingAddress)}</p>
                  </section>

                  <section className="border border-border bg-surface px-5 py-5 md:px-6">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-outline">Payment method</p>
                      <Link className={actionLinkClassName} to={routePaths.orderInvoice(order.id)}>
                        Download invoice
                      </Link>
                    </div>
                    <h2 className="mt-3 font-display text-[2rem] leading-none text-text-primary">{getPaymentMethodLabel(order.paymentMethod)}</h2>
                    <p className="mt-4 text-sm leading-7 text-text-secondary">{getPaymentMethodNote(order.paymentMethod)}</p>
                  </section>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  {reviewActionVisible ? (
                    <section className="border border-border bg-surface px-5 py-5 md:px-6">
                      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-outline">Review</p>
                      <h2 className="mt-3 font-display text-[2rem] leading-none text-text-primary">Share your notes</h2>
                      <p className="mt-4 text-sm leading-7 text-text-secondary">
                        Revisit the fit, finish, and material quality of this delivered order directly from the archive.
                      </p>
                      <Link className={`${actionLinkClassName} mt-5 inline-flex`} to={routePaths.orderReview(order.id)}>
                        Write review
                      </Link>
                    </section>
                  ) : null}

                  {paymentActionVisible ? (
                    <section className="border border-border bg-surface px-5 py-5 md:px-6">
                      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-outline">Payment</p>
                      <h2 className="mt-3 font-display text-[2rem] leading-none text-text-primary">Complete payment</h2>
                      <p className="mt-4 text-sm leading-7 text-text-secondary">
                        This online order is waiting for payment confirmation. Continue to the payment result flow to initiate or retry the transaction.
                      </p>
                      <Link className={`${actionLinkClassName} mt-5 inline-flex`} to={routePaths.paymentResult(order.id)}>
                        Pay now
                      </Link>
                    </section>
                  ) : null}

                  {shipmentActionVisible ? (
                    <section className="border border-border bg-surface px-5 py-5 md:px-6">
                      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-outline">Shipment</p>
                      <h2 className="mt-3 font-display text-[2rem] leading-none text-text-primary">Track the handoff</h2>
                      <p className="mt-4 text-sm leading-7 text-text-secondary">
                        Follow the shipment timeline, current carrier status, and the latest delivery milestones for this order.
                      </p>
                      <Link className={`${actionLinkClassName} mt-5 inline-flex`} to={routePaths.orderTracking(order.id)}>
                        Track shipment
                      </Link>
                    </section>
                  ) : null}

                  <section className="border border-border bg-surface px-5 py-5 md:px-6">
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-outline">Invoice</p>
                    <h2 className="mt-3 font-display text-[2rem] leading-none text-text-primary">Invoice actions</h2>
                    <p className="mt-4 text-sm leading-7 text-text-secondary">
                      Open the printable invoice view or return to the archive for broader transaction history.
                    </p>
                    <Link className={`${actionLinkClassName} mt-5 inline-flex`} to={routePaths.orderInvoice(order.id)}>
                      Download invoice
                    </Link>
                  </section>
                </div>

                <section className="border border-border bg-surface px-5 py-5 md:px-6">
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-outline">Customer note</p>
                  <p className="mt-4 text-sm leading-7 text-text-secondary">{order.customerNote.trim().length > 0 ? order.customerNote : 'No note provided for this order.'}</p>
                </section>
              </section>

              <OrderSummaryPanel
                supplementary={<p className="text-sm leading-7 text-text-secondary">Voucher code {order.voucherCode ?? 'not applied'}.</p>}
                totals={order}
              />
            </div>
          </>
        ) : null}
      </Container>
      {order ? (
        <ConfirmDialog
          cancelLabel="Keep order"
          confirmLabel={cancelOrder.isPending ? 'Cancelling...' : 'Cancel order'}
          description="This releases the pending order in the mock flow and updates its status to Cancelled."
          onClose={() => setConfirmOpen(false)}
          onConfirm={() =>
            cancelOrder.mutate(order.id, {
              onSuccess: () => {
                setConfirmOpen(false);
                addToast({
                  tone: 'success',
                  title: 'Order cancelled',
                  description: `${order.code} is now marked as cancelled.`,
                });
              },
              onError: (error) => {
                addToast({
                  tone: 'danger',
                  title: 'Cancellation failed',
                  description: error instanceof Error ? error.message : 'Try again.',
                });
              },
            })
          }
          open={confirmOpen}
          title="Cancel this order?"
        />
      ) : null}
    </>
  );
};

export default OrderDetailPage;
