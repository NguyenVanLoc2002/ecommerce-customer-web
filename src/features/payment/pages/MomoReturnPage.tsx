import { CheckCircle2, LoaderCircle, XCircle } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';

import { routePaths, routes } from '@/constants/routes';
import { useMomoReturnPolling } from '@/features/payment/hooks/usePayment';
import { useOrderLifecycle } from '@/shared/hooks/useOrderLifecycle';
import { getCancelledPaidMessage, isCancelledOrderWithPaidPayment } from '@/shared/lib/orderPaymentLifecycle';
import { EmptyState } from '@/shared/components/feedback/EmptyState';
import { ErrorCard } from '@/shared/components/feedback/ErrorCard';
import { LoadingOverlay } from '@/shared/components/feedback/LoadingOverlay';
import { PaymentPageLayout } from '@/features/payment/components/PaymentPageLayout';
import { OrderStatusBadge } from '@/shared/components/commerce/OrderStatusBadge';
import { Button } from '@/shared/components/ui/Button';
import { buttonStyles } from '@/shared/components/ui/buttonStyles';
import { getPaymentStatusLabel } from '@/shared/lib/commerceLabels';
import { PAYMENT_STATUSES } from '@/shared/types/payment.types';
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

export const MomoReturnPage = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId') ?? '';
  const paymentQuery = useMomoReturnPolling(orderId);
  const orderQuery = useOrderLifecycle(orderId);
  const payment = paymentQuery.data;
  const order = orderQuery.data;
  const lifecycle = order
    ? { orderStatus: order.status, paymentMethod: order.paymentMethod, orderPaymentStatus: order.paymentStatus, paymentStatus: payment?.status }
    : null;
  const isLatePaid = lifecycle ? isCancelledOrderWithPaidPayment(lifecycle) : false;
  const cancelledPaidMessage = lifecycle ? getCancelledPaidMessage(lifecycle) : null;
  const errorCode =
    paymentQuery.error instanceof Error && 'code' in paymentQuery.error ? String((paymentQuery.error as { code?: string }).code) : '';

  if (!orderId) {
    return (
      <PaymentPageLayout path={routes.paymentMomoReturn} title="Kết quả thanh toán MoMo">
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

  if (paymentQuery.isError && errorCode !== 'PAYMENT_NOT_FOUND' && errorCode !== 'ORDER_NOT_FOUND') {
    return (
      <PaymentPageLayout path={routes.paymentMomoReturn} title="Kết quả thanh toán MoMo">
        <ErrorCard
          action={<Button onClick={() => void paymentQuery.refetch()}>Kiểm tra lại</Button>}
          className="border-border bg-surface"
          description="Không thể tải trạng thái thanh toán từ hệ thống hiện tại."
          title="Không thể kiểm tra thanh toán"
        />
      </PaymentPageLayout>
    );
  }

  if (paymentQuery.isError && errorCode === 'ORDER_NOT_FOUND') {
    return (
      <PaymentPageLayout path={routes.paymentMomoReturn} title="Kết quả thanh toán MoMo">
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

  if (paymentQuery.isError && errorCode === 'PAYMENT_NOT_FOUND') {
    return (
      <PaymentPageLayout path={routes.paymentMomoReturn} title="Kết quả thanh toán MoMo">
        <ErrorCard
          action={<Button onClick={() => void paymentQuery.refetch()}>Kiểm tra lại</Button>}
          className="border-border bg-surface"
          description="Bản ghi thanh toán cho đơn hàng này chưa sẵn sàng. Vui lòng thử lại sau ít phút."
          title="Chưa có trạng thái thanh toán"
        />
      </PaymentPageLayout>
    );
  }

  const status = payment?.status;
  const isSuccess = status === PAYMENT_STATUSES.PAID;
  const isOrderCancelled = order?.status === 'CANCELLED';
  const isProcessing = isProcessingStatus(status) || (!payment && (paymentQuery.isLoading || paymentQuery.isFetching));
  const isFailed = isFailedStatus(status);
  const isPendingAfterTimeout = !isSuccess && !isFailed && paymentQuery.maxAttemptsReached;
  const title = isLatePaid
    ? 'Đã nhận tiền, đơn hàng đã hủy.'
    : isOrderCancelled
      ? 'Đơn hàng đã hủy.'
    : isSuccess
      ? 'Thanh toán MoMo đã được ghi nhận'
    : isFailed
      ? 'Thanh toán chưa hoàn tất hoặc đã bị hủy.'
      : isPendingAfterTimeout
        ? 'Thanh toán MoMo đang được xử lý'
        : 'Đang kiểm tra giao dịch MoMo';
  const description = isLatePaid
    ? cancelledPaidMessage
    : isOrderCancelled
      ? 'Đơn hàng đã hết hạn và bị hủy. Không tiếp tục thanh toán hoặc giả định đơn sẽ được giao. Hãy xem chi tiết đơn để kiểm tra trạng thái cuối cùng.'
    : isSuccess
      ? orderQuery.isError
        ? 'Backend ghi nhận thanh toán PAID nhưng chưa thể xác minh trạng thái đơn. Vui lòng kiểm tra chi tiết đơn trước khi giả định xử lý giao hàng đã bắt đầu.'
        : 'Backend đã xác nhận thanh toán. Xem trạng thái đơn hiện tại để biết tiến trình xử lý.'
    : isFailed
      ? 'Backend chưa xác nhận thanh toán thành công cho đơn hàng này.'
      : isPendingAfterTimeout
        ? 'Thanh toán MoMo đang được xử lý. Vui lòng kiểm tra lại đơn hàng sau ít phút.'
        : 'Fashion Shop đang kiểm tra trạng thái MoMo từ máy chủ. Việc quay lại từ MoMo chưa xác nhận giao dịch.';

  return (
    <PaymentPageLayout path={routes.paymentMomoReturn} title="Đang đồng bộ giao dịch với cổng MoMo" description="Kiểm tra trạng thái giao dịch MoMo do máy chủ Fashion Shop xác nhận.">
      {paymentQuery.isLoading && !payment || orderQuery.isLoading ? <LoadingOverlay className="min-h-24 rounded-lg border-border bg-surface" inline label="Đang kiểm tra trạng thái đơn và thanh toán..." /> : null}
      {orderQuery.isError ? (
        <ErrorCard action={<Button onClick={() => void orderQuery.refetch()}>Kiểm tra trạng thái đơn</Button>} className="border-border bg-surface" description="Chưa xác minh được đơn có còn hiệu lực hay không. Dữ liệu thanh toán vẫn có thể xem bên dưới." title="Không tải được trạng thái đơn" />
      ) : null}
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.43fr)_minmax(0,1fr)] lg:gap-8">
        <section className="min-w-0 space-y-5">
          <div className="rounded-lg border border-border bg-surface p-5 md:p-8 lg:p-10">
            <div className="flex flex-wrap items-start justify-between gap-4" role="status">
              <div>
                <h2 className="text-xl font-semibold leading-tight text-text-primary md:text-2xl">{title}</h2>
              </div>
              {status ? (
                <div className={`inline-flex items-center gap-2 border px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] ${statusToneClasses[status] ?? 'border-border bg-surface-muted text-text-primary'}`}>
                  {isSuccess ? <CheckCircle2 className="h-4 w-4" /> : null}
                  {isFailed ? <XCircle className="h-4 w-4" /> : null}
                  {isProcessing ? <LoaderCircle aria-hidden="true" className="h-4 w-4 motion-safe:animate-spin" /> : null}
                  {getPaymentStatusLabel(status)}
                </div>
              ) : null}
            </div>

            {isProcessing && !paymentQuery.maxAttemptsReached ? (
              <div className="mt-5">
                <p className="mb-2 text-xs text-text-secondary">Lần kiểm tra {paymentQuery.attemptCount} / 15</p>
                <progress aria-label="Số lần kiểm tra giao dịch MoMo" className="block h-1.5 w-full overflow-hidden rounded [&::-webkit-progress-bar]:bg-surface-soft [&::-webkit-progress-value]:bg-brand-primary [&::-moz-progress-bar]:bg-brand-primary" max={15} value={paymentQuery.attemptCount} />
              </div>
            ) : null}
            <p className="mt-7 rounded bg-surface-muted p-4 text-sm leading-7 text-text-secondary md:p-5">{description}</p>            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {isProcessing || isPendingAfterTimeout ? (
                <Button disabled={paymentQuery.isFetching} fullWidth className="!border-text-primary !bg-text-primary hover:!opacity-90" onClick={() => void paymentQuery.refetch()}>
                  Làm mới trạng thái
                </Button>
              ) : null}
              <Link className={buttonStyles({ fullWidth: true, className: '!border-text-primary !bg-text-primary hover:!opacity-90' })} to={routePaths.orderDetail(orderId)}>
                Xem đơn hàng
              </Link>
              <Link className={buttonStyles({ fullWidth: true, variant: 'ghost' })} to={routes.products}>
                Tiếp tục mua sắm
              </Link>
            </div>

          </div>

        </section>

        <aside className="min-w-0 rounded-lg bg-surface-muted p-5 md:p-8">
            <section aria-label="Trạng thái đơn hàng" className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4" role="status">
              <h2 className="text-sm font-semibold text-text-primary">Trạng thái đơn hàng</h2>
              {!orderQuery.isError && order ? <OrderStatusBadge status={order.status} /> : <span className="text-sm text-text-secondary">Chưa xác minh</span>}
            </section>
          {payment ? (
            <section className="mt-5 min-w-0">
              <h2 className="mb-5 text-sm font-semibold uppercase tracking-wide">Thông tin giao dịch xác minh</h2>
              <div className="grid gap-5 [&>div]:flex [&>div]:items-baseline [&>div]:justify-between [&>div]:gap-4 [&>div>p:last-child]:mt-0 [&>div>p:last-child]:text-right">
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
        </aside>
      </div>
    </PaymentPageLayout>
  );
};

export default MomoReturnPage;
