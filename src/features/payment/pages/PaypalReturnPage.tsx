import { useEffect, useMemo, useRef } from 'react';
import { CheckCircle2, LoaderCircle, XCircle } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';

import { routePaths, routes } from '@/constants/routes';
import { useCapturePayment, usePaypalReturnPolling } from '@/features/payment/hooks/usePayment';
import { clearPendingPaypalPayment } from '@/features/payment/lib/pendingPaypalPayment';
import { EmptyState } from '@/shared/components/feedback/EmptyState';
import { ErrorCard } from '@/shared/components/feedback/ErrorCard';
import { LoadingOverlay } from '@/shared/components/feedback/LoadingOverlay';
import { PaymentPageLayout } from '@/features/payment/components/PaymentPageLayout';
import { PaymentOrderSummary } from '@/features/payment/components/PaymentOrderSummary';
import { Button } from '@/shared/components/ui/Button';
import { buttonStyles } from '@/shared/components/ui/buttonStyles';
import { getPaymentProviderLabel, getPaymentStatusLabel } from '@/shared/lib/commerceLabels';
import { useOrderLifecycle } from '@/shared/hooks/useOrderLifecycle';
import { canStartOrRetryOnlinePayment, getCancelledPaidMessage, isCancelledOrderWithPaidPayment } from '@/shared/lib/orderPaymentLifecycle';
import { isMutationProcessingError, isPaymentAlreadyProcessedError, isUncertainMutationFailure } from '@/shared/lib/idempotentMutation';
import { PAYMENT_PROVIDERS, PAYMENT_STATUSES } from '@/shared/types/payment.types';
import { formatDate } from '@/shared/utils/formatDate';
import { formatVnd } from '@/shared/utils/formatVnd';

const statusToneClasses: Record<string, string> = {
  [PAYMENT_STATUSES.PAID]: 'border-success/20 bg-success/10 text-brand-primary',
  [PAYMENT_STATUSES.INITIATED]: 'border-warning/20 bg-warning/10 text-brand-primary',
  [PAYMENT_STATUSES.PENDING]: 'border-warning/20 bg-warning/10 text-brand-primary',
  [PAYMENT_STATUSES.PROCESSING]: 'border-warning/20 bg-warning/10 text-brand-primary',
  [PAYMENT_STATUSES.FAILED]: 'border-danger/20 bg-danger/10 text-danger',
  [PAYMENT_STATUSES.CANCELLED]: 'border-danger/20 bg-danger/10 text-danger',
  [PAYMENT_STATUSES.EXPIRED]: 'border-danger/20 bg-danger/10 text-danger',
};

const isProcessingStatus = (status: string | undefined) =>
  status === PAYMENT_STATUSES.INITIATED ||
  status === PAYMENT_STATUSES.PENDING ||
  status === PAYMENT_STATUSES.PROCESSING;

const isFailedStatus = (status: string | undefined) =>
  status === PAYMENT_STATUSES.FAILED ||
  status === PAYMENT_STATUSES.CANCELLED ||
  status === PAYMENT_STATUSES.EXPIRED;

export const PaypalReturnPage = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId') ?? '';
  const providerToken = searchParams.get('token') ?? '';
  const capturePayment = useCapturePayment();
  const paymentQuery = usePaypalReturnPolling(orderId);
  const orderQuery = useOrderLifecycle(orderId);
  const hasTriggeredCapture = useRef(false);

  const payment = paymentQuery.data;
  const order = orderQuery.data;
  const lifecycle = order
    ? { orderStatus: order.status, paymentMethod: order.paymentMethod, orderPaymentStatus: order.paymentStatus, paymentStatus: payment?.status }
    : null;
  const canCapture = lifecycle ? canStartOrRetryOnlinePayment(lifecycle) : false;
  const isLatePaid = lifecycle ? isCancelledOrderWithPaidPayment(lifecycle) : false;
  const cancelledPaidMessage = lifecycle ? getCancelledPaidMessage(lifecycle) : null;
  const paymentErrorCode = useMemo(
    () => (paymentQuery.error instanceof Error && 'code' in paymentQuery.error ? String((paymentQuery.error as { code?: string }).code) : ''),
    [paymentQuery.error],
  );
  const captureError = capturePayment.error;
  const hasRecoverableCaptureError =
    isPaymentAlreadyProcessedError(captureError) || isMutationProcessingError(captureError) || isUncertainMutationFailure(captureError);
  const hasBlockingCaptureError = Boolean(captureError && !hasRecoverableCaptureError);

  useEffect(() => {
    clearPendingPaypalPayment(orderId || undefined);
  }, [orderId]);

  useEffect(() => {
    if (!orderId || !providerToken || hasTriggeredCapture.current || orderQuery.isLoading || orderQuery.isError || !order || !canCapture) {
      return;
    }

    hasTriggeredCapture.current = true;
    capturePayment.mutate(
      {
        orderId,
        payload: {
          provider: PAYMENT_PROVIDERS.PAYPAL,
          providerToken,
        },
      },
      {
        onSettled: () => {
          void paymentQuery.refetch();
        },
      },
    );
  }, [canCapture, capturePayment, order, orderId, orderQuery.isError, orderQuery.isLoading, paymentQuery, providerToken]);

  if (!orderId) {
    return (
      <PaymentPageLayout path={routes.paymentPaypalReturn} title="Xác thực thanh toán PayPal">
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

  if (!providerToken) {
    return (
      <PaymentPageLayout path={routes.paymentPaypalReturn} title="Xác thực thanh toán PayPal">
        <EmptyState
          action={
            <div className="flex flex-wrap justify-center gap-3">
              <Link className={buttonStyles({})} to={routePaths.orderDetail(orderId)}>
                Xem đơn hàng
              </Link>
              <Link className={buttonStyles({ variant: 'ghost' })} to={routes.products}>
                Tiếp tục mua sắm
              </Link>
            </div>
          }
          className="border-border bg-surface px-6 py-16"
          description="Không tìm thấy mã xác nhận PayPal."
          title="Thiếu token PayPal"
        />
      </PaymentPageLayout>
    );
  }

  if (paymentQuery.isError && paymentErrorCode === 'ORDER_NOT_FOUND') {
    return (
      <PaymentPageLayout path={routes.paymentPaypalReturn} title="Xác thực thanh toán PayPal">
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
          title="Đơn hàng không tồn tại"
        />
      </PaymentPageLayout>
    );
  }

  if (paymentQuery.isError && paymentErrorCode !== 'PAYMENT_NOT_FOUND' && paymentErrorCode !== 'ORDER_NOT_FOUND') {
    return (
      <PaymentPageLayout path={routes.paymentPaypalReturn} title="Xác thực thanh toán PayPal">
        <ErrorCard
          action={<Button onClick={() => void paymentQuery.refetch()}>Kiểm tra lại</Button>}
          className="border-border bg-surface"
          description="Không thể tải trạng thái thanh toán từ hệ thống hiện tại."
          title="Không thể kiểm tra thanh toán"
        />
      </PaymentPageLayout>
    );
  }

  const status = payment?.status;
  const providerLabel = getPaymentProviderLabel(payment?.provider ?? payment?.transactions[0]?.provider ?? PAYMENT_PROVIDERS.PAYPAL);
  const isSuccess = status === PAYMENT_STATUSES.PAID;
  const isOrderCancelled = order?.status === 'CANCELLED';
  const isFailed = isFailedStatus(status);
  const isCapturing = capturePayment.isPending;
  const isChecking = !isCapturing && (isProcessingStatus(status) || paymentQuery.isPolling || (!payment && (paymentQuery.isLoading || paymentQuery.isFetching)));
  const isPendingAfterTimeout = !isSuccess && !isFailed && paymentQuery.maxAttemptsReached;
  const title = isLatePaid
    ? 'Đã nhận tiền, đơn hàng đã hủy.'
    : isOrderCancelled && !isSuccess
      ? 'Đơn hàng đã hủy, không tiếp tục thanh toán.'
      : isSuccess
        ? 'Thanh toán PayPal đã được ghi nhận'
    : isFailed
      ? 'Thanh toán PayPal chưa hoàn tất hoặc đã bị hủy.'
      : hasBlockingCaptureError
        ? 'Không thể hoàn tất thanh toán PayPal'
        : isCapturing
          ? 'Đang hoàn tất thanh toán PayPal...'
          : isPendingAfterTimeout
            ? 'Thanh toán PayPal đang được xử lý'
            : 'Fashion Shop đang xác minh kết quả PayPal qua máy chủ trước khi ghi nhận thanh toán.';
  const description = isLatePaid
    ? cancelledPaidMessage
    : isOrderCancelled && !isSuccess
      ? 'Đơn hàng đã hết hạn và bị hủy. Capture đã được dừng; không tiếp tục thanh toán hoặc giả định đơn sẽ được giao.'
    : isSuccess
      ? orderQuery.isError
        ? 'Backend ghi nhận thanh toán PAID nhưng chưa thể xác minh trạng thái đơn. Vui lòng kiểm tra chi tiết đơn trước khi giả định xử lý giao hàng đã bắt đầu.'
        : 'Backend đã xác nhận thanh toán. Xem trạng thái đơn hiện tại để biết tiến trình xử lý.'
    : isFailed
      ? 'Backend chưa xác nhận thanh toán thành công cho đơn hàng này.'
      : hasBlockingCaptureError
        ? captureError instanceof Error
          ? captureError.message
          : 'Không thể hoàn tất thanh toán PayPal. Vui lòng kiểm tra lại trạng thái đơn hàng.'
        : isPendingAfterTimeout
          ? 'Thanh toán PayPal đang được xử lý. Vui lòng kiểm tra lại đơn hàng sau ít phút.'
          : isCapturing
            ? 'Đang hoàn tất thanh toán PayPal...'
            : 'Đang xác nhận thanh toán PayPal...';

  return (
    <PaymentPageLayout path={routes.paymentPaypalReturn} title="Xác thực thanh toán PayPal" orderCode={payment?.orderCode ?? order?.orderCode}>
      {paymentQuery.isLoading && !payment || orderQuery.isLoading ? <LoadingOverlay className="min-h-24 rounded-lg border-border bg-surface" inline label="Đang xác minh đơn và thanh toán PayPal..." /> : null}
      {orderQuery.isError ? (
        <ErrorCard action={<Button onClick={() => void orderQuery.refetch()}>Kiểm tra trạng thái đơn</Button>} className="border-border bg-surface" description="Đã dừng capture cho đến khi trạng thái đơn được xác minh. Vui lòng kiểm tra lại trước khi tiếp tục." title="Không tải được trạng thái đơn" />
      ) : null}
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)] lg:gap-8">
        <section className="min-w-0 space-y-5">
          <div className="rounded-lg border border-border bg-surface p-5 md:p-8 lg:p-10">
            <div className="flex flex-wrap items-start justify-between gap-4" role="status">
              <div>
                <h2 className="text-xl font-semibold leading-tight text-text-primary md:text-2xl">{title}</h2>
                <p className="mt-4 text-sm uppercase tracking-[0.08em] text-text-secondary">{providerLabel}</p>
              </div>
              {status ? (
                <div className={`inline-flex items-center gap-2 border px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] ${statusToneClasses[status] ?? 'border-border bg-surface-muted text-text-primary'}`}>
                  {isSuccess ? <CheckCircle2 className="h-4 w-4" /> : null}
                  {isFailed ? <XCircle className="h-4 w-4" /> : null}
                  {isCapturing || isChecking ? <LoaderCircle aria-hidden="true" className="h-4 w-4 motion-safe:animate-spin" /> : null}
                  {getPaymentStatusLabel(status)}
                </div>
              ) : null}
            </div>

            <p className="mt-5 rounded bg-surface-muted p-4 text-sm leading-7 text-text-secondary md:p-5">{description}</p>

            {isCapturing ? (
              <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.18em] text-outline">Đang hoàn tất thanh toán PayPal...</p>
            ) : null}
            {isChecking ? (
              <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.18em] text-outline">Lần kiểm tra {paymentQuery.attemptCount} / 15</p>
            ) : null}
          </div>

          {payment ? (
            <section className="min-w-0 rounded-lg border border-border bg-surface p-5 md:p-8">
              <h2 className="mb-5 text-sm font-semibold uppercase tracking-wide">Thông tin giao dịch</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-outline">Mã đơn hàng</p>
                  <p className="mt-3 break-all font-mono text-sm text-text-primary">{payment.orderCode}</p>
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-outline">Mã thanh toán</p>
                  <p className="mt-3 break-all font-mono text-sm text-text-primary">{payment.paymentCode}</p>
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-outline">Tổng thanh toán</p>
                  <p className="mt-3 text-sm text-text-primary">{formatVnd(payment.amount)}</p>
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-outline">Thời gian giao dịch</p>
                  <p className="mt-3 text-sm text-text-primary">
                    {formatDate(payment.paidAt ?? payment.createdAt, {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            </section>
          ) : null}
          <section className="min-w-0 rounded-lg border border-border bg-surface p-5 md:p-8">
            <h2 className="text-[11px] font-bold uppercase tracking-[0.18em] text-outline">Thao tác tiếp theo</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {hasBlockingCaptureError || isChecking || isPendingAfterTimeout ? (
                <Button disabled={paymentQuery.isFetching || isCapturing} fullWidth onClick={() => void paymentQuery.refetch()}>
                  Kiểm tra lại
                </Button>
              ) : null}
              <Link className={buttonStyles({ fullWidth: true })} to={routePaths.orderDetail(orderId)}>
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
        </aside>
      </div>
    </PaymentPageLayout>
  );
};

export default PaypalReturnPage;
