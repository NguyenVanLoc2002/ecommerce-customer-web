import { useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import { routePaths, routes } from '@/constants/routes';
import { usePaymentByOrderId } from '@/features/payment/hooks/usePayment';
import { useOrderLifecycle } from '@/shared/hooks/useOrderLifecycle';
import { clearPendingPaypalPayment } from '@/features/payment/lib/pendingPaypalPayment';
import { EmptyState } from '@/shared/components/feedback/EmptyState';
import { ErrorCard } from '@/shared/components/feedback/ErrorCard';
import { LoadingOverlay } from '@/shared/components/feedback/LoadingOverlay';
import { Container } from '@/shared/components/layout/Container';
import { PageSEO } from '@/shared/components/seo/PageSEO';
import { Button } from '@/shared/components/ui/Button';
import { buttonStyles } from '@/shared/components/ui/buttonStyles';
import { getPaymentProviderLabel, getPaymentStatusLabel } from '@/shared/lib/commerceLabels';
import { canStartOrRetryOnlinePayment, getCancelledPaidMessage, isCancelledOrderWithPaidPayment } from '@/shared/lib/orderPaymentLifecycle';
import { PAYMENT_PROVIDERS } from '@/shared/types/payment.types';
import { formatMoney } from '@/shared/utils/formatMoney';

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
  const canRetryPayment = lifecycle ? canStartOrRetryOnlinePayment(lifecycle) : false;
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
      <>
        <PageSEO description="Review the PayPal cancellation state for your order." noIndex path={routes.paymentPaypalCancel} title="PayPal Payment Cancelled" />
        <Container className="py-12">
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
        </Container>
      </>
    );
  }

  if (paymentQuery.isError && paymentErrorCode !== 'PAYMENT_NOT_FOUND' && paymentErrorCode !== 'ORDER_NOT_FOUND') {
    return (
      <>
        <PageSEO description="Review the PayPal cancellation state for your order." noIndex path={routes.paymentPaypalCancel} title="PayPal Payment Cancelled" />
        <Container className="py-12">
          <ErrorCard
            action={<Button onClick={() => void paymentQuery.refetch()}>Kiểm tra lại</Button>}
            className="border-border bg-surface"
            description="Không thể tải trạng thái thanh toán từ hệ thống hiện tại."
            title="Không thể kiểm tra thanh toán"
          />
        </Container>
      </>
    );
  }

  return (
    <>
      <PageSEO description="Review the PayPal cancellation state for your order." noIndex path={routes.paymentPaypalCancel} title="PayPal Payment Cancelled" />
      <Container className="space-y-8 pb-16 pt-28 md:space-y-10 md:pb-20 md:pt-32">
        {paymentQuery.isLoading || orderQuery.isLoading ? <LoadingOverlay className="min-h-[320px] border-border bg-surface" inline label="Đang kiểm tra trạng thái đơn và thanh toán..." /> : null}
        {orderQuery.isError ? (
          <ErrorCard action={<Button onClick={() => void orderQuery.refetch()}>Kiểm tra trạng thái đơn</Button>} className="border-border bg-surface" description="Chưa thể xác nhận đơn còn hiệu lực. Không thể tiếp tục thanh toán cho đến khi trạng thái được tải." title="Không tải được trạng thái đơn" />
        ) : null}
        <div className="grid gap-10 xl:grid-cols-[minmax(0,1fr)_380px]">
          <section className="space-y-6">
            <div className="border border-border bg-surface px-6 py-8 md:px-8 md:py-10">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-outline">PayPal cancel</p>
              <h1 className="mt-4 font-sans text-[2rem] font-semibold leading-tight text-text-primary md:text-4xl">{isLatePaid ? 'Đã nhận tiền, đơn hàng đã hủy.' : 'Bạn đã rời PayPal.'}</h1>
              <p className="mt-5 max-w-2xl text-sm leading-7 text-text-secondary">
                {isLatePaid
                  ? cancelledPaidMessage
                  : canRetryPayment
                    ? 'Bạn đã rời PayPal trước khi hoàn tất. Đơn vẫn đang chờ thanh toán online, có thời hạn giữ hàng tối đa 30 phút. Kiểm tra trạng thái hiện tại trước khi thử lại.'
                    : 'Việc rời PayPal không xác nhận thanh toán. Đơn hàng không còn chờ thanh toán hoặc trạng thái chưa được xác minh; hãy xem chi tiết đơn trước khi tiếp tục.'}
              </p>
            </div>

            {payment ? (
              <section className="border border-border bg-surface px-5 py-5 md:px-6">
                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-outline">Provider</p>
                    <p className="mt-3 text-sm text-text-primary">{getPaymentProviderLabel(payment.provider ?? payment.transactions[0]?.provider ?? PAYMENT_PROVIDERS.PAYPAL)}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-outline">Payment status</p>
                    <p className="mt-3 text-sm text-text-primary">{getPaymentStatusLabel(payment.status)}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-outline">Order code</p>
                    <p className="mt-3 font-mono text-sm text-text-primary">{payment.orderCode}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-outline">Amount</p>
                    <p className="mt-3 text-sm text-text-primary">{formatMoney(payment.amount)}</p>
                  </div>
                </div>
              </section>
            ) : null}
          </section>

          <aside className="space-y-4">
            <section className="border border-border bg-surface px-5 py-5 md:px-6">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-outline">Next actions</p>
              <div className="mt-6 space-y-3">
                <Link className={buttonStyles({ fullWidth: true })} to={routePaths.orderDetail(orderId)}>
                  Xem đơn hàng
                </Link>
                {canRetryPayment ? (
                  <Link className={buttonStyles({ fullWidth: true, variant: 'secondary' })} to={routePaths.paymentResult(orderId, PAYMENT_PROVIDERS.PAYPAL)}>
                    Thử lại thanh toán
                  </Link>
                ) : null}
                <Link className={buttonStyles({ fullWidth: true, variant: 'ghost' })} to={routes.products}>
                  Tiếp tục mua sắm
                </Link>
              </div>
            </section>
          </aside>
        </div>
      </Container>
    </>
  );
};

export default PaypalCancelPage;
