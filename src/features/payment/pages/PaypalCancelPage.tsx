import { Info } from 'lucide-react';
import { useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import { routePaths, routes } from '@/constants/routes';
import { usePaymentByOrderId } from '@/features/payment/hooks/usePayment';
import { useOrderLifecycle } from '@/shared/hooks/useOrderLifecycle';
import { clearPendingPaypalPayment } from '@/features/payment/lib/pendingPaypalPayment';
import { EmptyState } from '@/shared/components/feedback/EmptyState';
import { ErrorCard } from '@/shared/components/feedback/ErrorCard';
import { LoadingOverlay } from '@/shared/components/feedback/LoadingOverlay';
import { PaymentPageLayout } from '@/features/payment/components/PaymentPageLayout';
import { PaymentOrderSummary } from '@/features/payment/components/PaymentOrderSummary';
import { Button } from '@/shared/components/ui/Button';
import { buttonStyles } from '@/shared/components/ui/buttonStyles';
import { getPaymentProviderLabel, getPaymentStatusLabel } from '@/shared/lib/commerceLabels';
import { canStartOrRetryOnlinePayment, getCancelledPaidMessage, isCancelledOrderWithPaidPayment } from '@/shared/lib/orderPaymentLifecycle';
import { PAYMENT_PROVIDERS } from '@/shared/types/payment.types';
import { formatVnd } from '@/shared/utils/formatVnd';

export const PaypalCancelPage = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId') ?? '';
  const paymentQuery = usePaymentByOrderId(orderId);
  const orderQuery = useOrderLifecycle(orderId);
  const payment = paymentQuery.data;
  const order = orderQuery.data;
  const lifecycle = order
    ? { orderStatus: order.status, paymentMethod: order.paymentMethod, orderPaymentStatus: order.paymentStatus, paymentStatus: payment?.status }
    : null;
  const canRetryPayment = lifecycle && !orderQuery.isError && !paymentQuery.isLoading
    ? canStartOrRetryOnlinePayment(lifecycle)
    : false;
  const isLatePaid = lifecycle ? isCancelledOrderWithPaidPayment(lifecycle) : false;
  const cancelledPaidMessage = lifecycle ? getCancelledPaidMessage(lifecycle) : null;
  const paymentErrorCode = useMemo(
    () => (paymentQuery.error instanceof Error && 'code' in paymentQuery.error ? String((paymentQuery.error as { code?: string }).code) : ''),
    [paymentQuery.error],
  );

  useEffect(() => {
    clearPendingPaypalPayment(orderId || undefined);
  }, [orderId]);

  if (!orderId) {
    return (
      <PaymentPageLayout path={routes.paymentPaypalCancel} title="Hủy phiên thanh toán PayPal">
        <EmptyState
          action={
            <div className="flex flex-wrap justify-center gap-3">
              <Link className={buttonStyles({})} to={routes.orders}>
                Xem đơn hàng
              </Link>
              <Link className={buttonStyles({ variant: 'ghost' })} to={routes.products}>
                Tiếp tục mua sắm
              </Link>
            </div>
          }
          className="border-border bg-surface px-6 py-16"
          description="Không tìm thấy thông tin đơn hàng để kiểm tra thanh toán."
          title="Thiếu mã đơn hàng"
        />
      </PaymentPageLayout>
    );
  }

  if (paymentQuery.isError && paymentErrorCode !== 'PAYMENT_NOT_FOUND' && paymentErrorCode !== 'ORDER_NOT_FOUND') {
    return (
      <PaymentPageLayout path={routes.paymentPaypalCancel} title="Hủy phiên thanh toán PayPal">
        <ErrorCard
          action={<Button onClick={() => void paymentQuery.refetch()}>Kiểm tra lại</Button>}
          className="border-border bg-surface"
          description="Không thể tải trạng thái thanh toán từ hệ thống hiện tại."
          title="Không thể kiểm tra thanh toán"
        />
      </PaymentPageLayout>
    );
  }

  return (
    <PaymentPageLayout path={routes.paymentPaypalCancel} headingInContent title="Hủy phiên thanh toán PayPal">
      {paymentQuery.isLoading || orderQuery.isLoading ? <LoadingOverlay className="min-h-24 rounded-lg border-border bg-surface" inline label="Đang kiểm tra trạng thái đơn và thanh toán..." /> : null}
      {orderQuery.isError ? (
        <ErrorCard action={<Button onClick={() => void orderQuery.refetch()}>Kiểm tra trạng thái đơn</Button>} className="border-border bg-surface" description="Chưa thể xác nhận đơn còn hiệu lực. Không thể tiếp tục thanh toán cho đến khi trạng thái được tải." title="Không tải được trạng thái đơn" />
      ) : null}
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)] lg:gap-12">
        <section className="min-w-0 space-y-5">
          <div className="flex items-start gap-4 rounded-lg border border-border bg-surface p-5 md:gap-5 md:p-8 lg:p-10">
            <Info aria-hidden="true" className="size-10 shrink-0 rounded-full bg-surface-soft p-2.5 text-brand-primary md:size-12" />
            <div className="min-w-0" role="status">
            <h1 className="text-2xl font-semibold leading-tight text-text-primary lg:text-[2rem]">{isLatePaid ? 'Đã nhận tiền, đơn hàng đã hủy.' : payment?.status === 'PAID' ? 'Thanh toán PayPal đã được ghi nhận' : 'Bạn vừa dừng giao dịch trên cổng PayPal'}</h1>
            <p className="mt-3 text-sm leading-7 text-text-secondary md:text-base">
              {isLatePaid
                ? cancelledPaidMessage
                : payment?.status === 'PAID'
                  ? 'Hệ thống đã ghi nhận thanh toán. Xem chi tiết đơn để kiểm tra trạng thái hiện tại.'
                  : canRetryPayment
                  ? 'Bạn đã rời PayPal trước khi hoàn tất. Đơn vẫn đang chờ thanh toán online, có thời hạn giữ hàng tối đa 30 phút. Kiểm tra trạng thái hiện tại trước khi thử lại.'
                  : 'Việc rời PayPal không xác nhận thanh toán. Đơn hàng không còn chờ thanh toán hoặc trạng thái chưa được xác minh; hãy xem chi tiết đơn trước khi tiếp tục.'}
            </p>
            </div>
          </div>

          <section className="min-w-0 rounded-lg border border-border bg-surface p-5 md:p-8">
            <h2 className="text-base font-semibold uppercase tracking-wide">Thao tác tiếp theo</h2>
            <div className="mt-5 grid gap-3">
              {canRetryPayment ? (
                <Link className={buttonStyles({ fullWidth: true, className: '!border-text-primary !bg-text-primary hover:!opacity-90' })} to={routePaths.paymentResult(orderId, PAYMENT_PROVIDERS.PAYPAL)}>
                  Thử lại thanh toán{payment ? ` · ${formatVnd(payment.amount)}` : null}
                </Link>
              ) : null}
              <Link className={buttonStyles({ fullWidth: true, variant: canRetryPayment ? 'secondary' : 'primary' })} to={routePaths.orderDetail(orderId)}>
                Xem đơn hàng
              </Link>
              <Link className={buttonStyles({ fullWidth: true, variant: 'ghost' })} to={routes.products}>
                Tiếp tục mua sắm
              </Link>
            </div>
          </section>
        </section>

        <aside className="min-w-0 space-y-4">
          {!orderQuery.isError && order ? <PaymentOrderSummary order={order} /> : null}
          {payment ? (
            <section className="min-w-0 rounded-lg border border-border bg-surface p-5 md:p-8">
              <h2 className="mb-5 text-sm font-semibold uppercase tracking-wide">Thông tin giao dịch</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-outline">Phương thức</p>
                  <p className="mt-3 text-sm text-text-primary">{getPaymentProviderLabel(payment.provider ?? payment.transactions[0]?.provider ?? PAYMENT_PROVIDERS.PAYPAL)}</p>
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-outline">Trạng thái thanh toán</p>
                  <p className="mt-3 text-sm text-text-primary">{getPaymentStatusLabel(payment.status)}</p>
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-outline">Mã đơn hàng</p>
                  <p className="mt-3 break-all font-mono text-sm text-text-primary">{payment.orderCode}</p>
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-outline">Tổng thanh toán</p>
                  <p className="mt-3 text-sm text-text-primary">{formatVnd(payment.amount)}</p>
                </div>
              </div>
            </section>
          ) : null}
        </aside>
      </div>
    </PaymentPageLayout>
  );
};

export default PaypalCancelPage;
