import { useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';

import { routePaths, routes } from '@/constants/routes';
import { useCancelOrder, useOrderDetail } from '@/features/orders/hooks/useOrders';
import { usePaymentLifecycle } from '@/shared/hooks/usePaymentLifecycle';
import { OrderStatusBadge } from '@/shared/components/commerce/OrderStatusBadge';
import { OrderStatusStepper } from '@/shared/components/commerce/OrderStatusStepper';
import { EmptyState } from '@/shared/components/feedback/EmptyState';
import { ErrorCard } from '@/shared/components/feedback/ErrorCard';
import { LoadingOverlay } from '@/shared/components/feedback/LoadingOverlay';
import { BreadcrumbNav } from '@/shared/components/layout/BreadcrumbNav';
import { Container } from '@/shared/components/layout/Container';
import { ConfirmDialog } from '@/shared/components/overlays/ConfirmDialog';
import { PageSEO } from '@/shared/components/seo/PageSEO';
import { Button } from '@/shared/components/ui/Button';
import { buttonStyles } from '@/shared/components/ui/buttonStyles';
import { isAuthenticationError } from '@/shared/lib/authErrors';
import { getPaymentMethodLabel, getPaymentStatusLabel } from '@/shared/lib/commerceLabels';
import { getCancelledPaidMessage, getCheckoutHoldMessage } from '@/shared/lib/orderPaymentLifecycle';
import { useUiStore } from '@/shared/stores/uiStore';
import { formatAddress } from '@/shared/utils/formatAddress';
import { formatDate } from '@/shared/utils/formatDate';
import { formatVnd } from '@/shared/utils/formatVnd';
import { ORDER_STATUSES, PAYMENT_METHODS } from '@/shared/types/enums';
import { PAYMENT_STATUSES } from '@/shared/types/payment.types';

export const OrderDetailPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { orderId = '' } = useParams();
  const addToast = useUiStore((state) => state.addToast);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const orderQuery = useOrderDetail(orderId);
  const paymentQuery = usePaymentLifecycle(orderId);
  const cancelOrder = useCancelOrder();
  const order = orderQuery.data;
  const onlinePaymentPending =
    order?.paymentMethod === PAYMENT_METHODS.ONLINE &&
    order.status === ORDER_STATUSES.AWAITING_PAYMENT &&
    paymentQuery.data?.status !== PAYMENT_STATUSES.PAID &&
    (order.paymentStatus === PAYMENT_STATUSES.PENDING ||
      order.paymentStatus === PAYMENT_STATUSES.PROCESSING ||
      order.paymentStatus === PAYMENT_STATUSES.INITIATED);
  const lifecycle = order
    ? {
        orderStatus: order.status,
        paymentMethod: order.paymentMethod,
        orderPaymentStatus: order.paymentStatus,
        paymentStatus: paymentQuery.data?.status,
      }
    : null;
  const checkoutHoldMessage = lifecycle ? getCheckoutHoldMessage(lifecycle) : null;
  const cancelledPaidMessage = lifecycle ? getCancelledPaidMessage(lifecycle) : null;
  const paymentActionVisible =
    order?.paymentMethod === PAYMENT_METHODS.ONLINE &&
    order.status === ORDER_STATUSES.AWAITING_PAYMENT &&
    order.paymentStatus !== PAYMENT_STATUSES.PAID &&
    paymentQuery.data?.status !== PAYMENT_STATUSES.PAID &&
    !onlinePaymentPending;
  const shipmentActionVisible =
    order?.status === ORDER_STATUSES.PROCESSING ||
    order?.status === ORDER_STATUSES.SHIPPED ||
    order?.status === ORDER_STATUSES.DELIVERED ||
    order?.status === ORDER_STATUSES.COMPLETED;
  const reviewActionVisible = order?.status === ORDER_STATUSES.COMPLETED;

  return (
    <>
      <PageSEO
        description="Review line items, totals, status progression, and cancel eligibility for this order."
        noIndex
        path={routePaths.orderDetail(orderId || 'order')}
        title="Order Detail"
      />
      <Container className="space-y-8 pb-16 pt-28 md:space-y-10 md:pb-20 md:pt-32">
        <BreadcrumbNav items={[
          { label: 'Trang chủ', href: routes.home },
          { label: 'Tài khoản', href: routes.profile },
          { label: 'Đơn hàng', href: routes.orders },
          { label: order ? '#' + order.code : 'Chi tiết đơn hàng' },
        ]} />
        {!order ? <h1 className="text-2xl font-bold">Chi tiết đơn hàng</h1> : null}
        {orderQuery.isLoading ? <LoadingOverlay className="min-h-[320px] border-border bg-surface" inline label="Loading order detail..." /> : null}
        {orderQuery.isError ? (
          <ErrorCard
            action={<Button onClick={() => void orderQuery.refetch()}>Retry</Button>}
            className="border-border bg-surface"
            description="The order detail could not be loaded from the current commerce source."
            title="Order detail unavailable"
          />
        ) : null}
        {!orderQuery.isLoading && !orderQuery.isError && !order ? (
          <EmptyState
            className="border-border bg-surface px-6 py-16"
            description="The requested order could not be found in the current customer order set."
            title="Order not found."
          />
        ) : null}
        {order ? (
          <>
            <div className="flex flex-col gap-5 rounded-md border border-border bg-surface p-5 md:p-8 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h1 className="mb-3 break-words text-xl font-bold tracking-tight md:text-2xl">Đơn hàng #{order.code}</h1>
                <div className="flex flex-wrap items-center gap-3">
                  <OrderStatusBadge status={order.status} />
                  <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-outline">{formatDate(order.createdAt)}</span>
                </div>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-text-secondary">
                  Cập nhật {formatDate(order.updatedAt)}. Xem trạng thái vận chuyển, hóa đơn hoặc chi tiết đơn hàng.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                {shipmentActionVisible ? (
                  <Link className={buttonStyles({ variant: 'ghost' })} to={routePaths.orderTracking(order.id)}>
                    Theo dõi vận chuyển
                  </Link>
                ) : null}
                {reviewActionVisible ? (
                  <Link className={buttonStyles({ variant: 'ghost' })} to={routePaths.orderReview(order.id)}>
                    Viết đánh giá
                  </Link>
                ) : null}
                {paymentActionVisible ? (
                  <Link className={buttonStyles({ variant: 'ghost' })} to={routePaths.paymentResult(order.id)}>
                    Thanh toán
                  </Link>
                ) : null}
                <Link className={buttonStyles({ variant: 'primary' })} to={routePaths.orderInvoice(order.id)}>
                  Hóa đơn
                </Link>
                {order.canCancel ? (
                  <Button onClick={() => setConfirmOpen(true)} variant="secondary">
                    Hủy đơn hàng
                  </Button>
                ) : null}
              </div>
            </div>

            {cancelledPaidMessage || checkoutHoldMessage ? (
              <div aria-live="polite" className={`border px-5 py-4 text-sm leading-7 ${cancelledPaidMessage ? 'border-danger/20 bg-danger/5 text-text-primary' : 'border-warning/20 bg-warning/5 text-text-primary'}`} role="status">
                {cancelledPaidMessage ?? checkoutHoldMessage}
              </div>
            ) : null}

            <div className="grid items-start gap-8 lg:grid-cols-12">
              <div className="min-w-0 space-y-6 lg:col-span-7">
                <section className="rounded bg-surface p-5 shadow-sm md:p-8">
                  <div className="flex items-center gap-2"><h2 className="text-sm font-bold uppercase tracking-wide">Sản phẩm trong đơn</h2><span className="text-sm text-text-secondary">({order.items.length})</span></div>
                  <ul className="mt-5 divide-y divide-border">
                    {order.items.map((item) => (
                      <li className="grid grid-cols-[72px_minmax(0,1fr)] items-start gap-x-4 gap-y-2 py-5 md:grid-cols-[112px_minmax(0,1fr)_auto] md:gap-x-6 md:py-7" key={item.id}>
                        <img alt={item.primaryImage.alt} className="row-span-2 aspect-[4/5] w-full rounded bg-surface-soft object-cover md:row-span-1" height={item.primaryImage.height} loading="lazy" src={item.primaryImage.src} width={item.primaryImage.width} />
                        <div className="min-w-0 break-words">
                          <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary">{item.brandName}</p>
                          <h3 className="mt-1 font-semibold">{item.productName}</h3>
                          <p className="mt-2 text-sm text-text-secondary">Màu {item.color} · Cỡ {item.size}</p>
                          <p className="mt-1 font-mono text-xs text-text-secondary">{item.sku} · SL {item.quantity}</p>
                        </div>
                        <p className="col-start-2 text-sm font-bold md:col-start-auto md:text-right">{formatVnd(item.subtotal)}</p>
                      </li>
                    ))}
                  </ul>
                </section>
                <OrderStatusStepper status={order.status} />
                {order.customerNote.trim() ? (
                  <section className="rounded bg-surface-soft p-5">
                    <h2 className="text-sm font-semibold">Ghi chú của khách hàng</h2>
                    <p className="mt-2 whitespace-pre-wrap break-words text-sm text-text-secondary">{order.customerNote}</p>
                  </section>
                ) : null}
              </div>

              <div className="min-w-0 space-y-6 lg:col-span-5">
                <section className="rounded bg-surface p-5 shadow-sm md:p-8">
                  <h2 className="text-sm font-bold uppercase tracking-wide">Chi tiết thanh toán</h2>
                  <dl className="mt-5 space-y-4 text-sm">
                    <div className="flex justify-between gap-3"><dt>Tạm tính</dt><dd>{formatVnd(order.subTotal)}</dd></div>
                    <div className="flex justify-between gap-3"><dt>Ưu đãi {order.voucherCode}</dt><dd>{formatVnd(order.discountTotal ? -order.discountTotal : 0)}</dd></div>
                    <div className="flex justify-between gap-3"><dt>Phí vận chuyển</dt><dd>{formatVnd(order.shippingFee)}</dd></div>
                    <div className="flex justify-between gap-3 border-t border-border pt-4 font-bold"><dt>Tổng thanh toán</dt><dd className="text-lg">{formatVnd(order.grandTotal)}</dd></div>
                  </dl>
                  <div className="mt-5 flex flex-wrap justify-between gap-2 rounded bg-surface-soft p-3 text-sm">
                    <span className="text-text-secondary">Phương thức thanh toán</span>
                    <span className="font-semibold">{getPaymentMethodLabel(order.paymentMethod)}</span>
                  </div>
                </section>
                <section className="space-y-4 rounded bg-surface p-5 shadow-sm md:p-8">
                  <h2 className="text-sm font-bold uppercase tracking-wide">Thông tin nhận hàng</h2>
                  <div>
                    <p className="font-semibold">{order.shippingAddress.receiverName}</p>
                    <p className="mt-1 text-sm text-text-secondary">{order.shippingAddress.phoneNumber}</p>
                  </div>
                  <p className="break-words text-sm text-text-secondary">{formatAddress(order.shippingAddress)}</p>
                  {order.carrierName ? <p className="text-sm font-medium">{order.carrierName}</p> : null}
                </section>
                <section className="space-y-3 rounded bg-surface p-5 shadow-sm md:p-8">
                  <h2 className="text-sm font-bold uppercase tracking-wide">Trạng thái thanh toán</h2>
                  {order.paymentStatus ? <p className="text-sm">Order payment status: {getPaymentStatusLabel(order.paymentStatus)}</p> : null}
                  {paymentQuery.data ? <p className="text-sm">Payment record: {getPaymentStatusLabel(paymentQuery.data.status)}</p> : null}
                  {paymentQuery.isLoading ? <p role="status" className="text-sm text-text-secondary">Đang tải giao dịch…</p> : null}
                  {paymentQuery.isError && !(paymentQuery.error instanceof Error && 'code' in paymentQuery.error && paymentQuery.error.code === 'PAYMENT_NOT_FOUND') ? (
                    <div className="space-y-2">
                      <p className="text-sm text-danger" role="status">Chưa tải được giao dịch.</p>
                      <Button onClick={() => void paymentQuery.refetch()} variant="secondary">Thử lại</Button>
                    </div>
                  ) : null}
                  {onlinePaymentPending ? (
                    <Link className={buttonStyles({ variant: 'secondary' })} to={routePaths.paymentResult(order.id)}>Xem trạng thái thanh toán</Link>
                  ) : null}
                </section>
              </div>
            </div>
          </>
        ) : null}
      </Container>
      {order ? (
        <ConfirmDialog
          cancelLabel="Giữ đơn hàng"
          confirmLoading={cancelOrder.isPending}
          confirmLabel={cancelOrder.isPending ? 'Cancelling...' : 'Cancel order'}
          description="This releases the pending order in the current flow and updates its status to Cancelled."
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
                if (isAuthenticationError(error)) {
                  addToast({
                    tone: 'info',
                    title: 'Please sign in to continue',
                    description: 'Sign in again to manage this order.',
                  });
                  navigate(routePaths.loginRedirect(location.pathname + location.search));
                  return;
                }

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
