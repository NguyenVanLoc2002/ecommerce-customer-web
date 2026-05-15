import { CheckCircle2, LoaderCircle, XCircle } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';

import { routePaths, routes } from '@/constants/routes';
import { useMomoReturnPolling } from '@/features/payment/hooks/usePayment';
import { EmptyState } from '@/shared/components/feedback/EmptyState';
import { ErrorCard } from '@/shared/components/feedback/ErrorCard';
import { LoadingOverlay } from '@/shared/components/feedback/LoadingOverlay';
import { Container } from '@/shared/components/layout/Container';
import { PageSEO } from '@/shared/components/seo/PageSEO';
import { Button } from '@/shared/components/ui/Button';
import { buttonStyles } from '@/shared/components/ui/buttonStyles';
import { getPaymentProviderLabel, getPaymentStatusLabel } from '@/shared/lib/commerceLabels';
import { PAYMENT_STATUSES } from '@/shared/types/payment.types';
import { formatDate } from '@/shared/utils/formatDate';
import { formatMoney } from '@/shared/utils/formatMoney';

const statusToneClasses: Record<string, string> = {
  [PAYMENT_STATUSES.PAID]: 'border-success/20 bg-success/10 text-success',
  [PAYMENT_STATUSES.INITIATED]: 'border-warning/20 bg-warning/10 text-warning',
  [PAYMENT_STATUSES.PENDING]: 'border-warning/20 bg-warning/10 text-warning',
  [PAYMENT_STATUSES.PROCESSING]: 'border-warning/20 bg-warning/10 text-warning',
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
  const payment = paymentQuery.data;
  const errorCode =
    paymentQuery.error instanceof Error && 'code' in paymentQuery.error ? String((paymentQuery.error as { code?: string }).code) : '';

  if (!orderId) {
    return (
      <>
        <PageSEO description="Verify the latest MoMo payment status for your order." noIndex path={routes.paymentMomoReturn} title="MoMo Payment Return" />
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

  if (paymentQuery.isError && errorCode !== 'PAYMENT_NOT_FOUND' && errorCode !== 'ORDER_NOT_FOUND') {
    return (
      <>
        <PageSEO description="Verify the latest MoMo payment status for your order." noIndex path={routes.paymentMomoReturn} title="MoMo Payment Return" />
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

  if (paymentQuery.isError && errorCode === 'ORDER_NOT_FOUND') {
    return (
      <>
        <PageSEO description="Verify the latest MoMo payment status for your order." noIndex path={routes.paymentMomoReturn} title="MoMo Payment Return" />
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
            title="Đơn hàng không tồn tại"
          />
        </Container>
      </>
    );
  }

  if (paymentQuery.isError && errorCode === 'PAYMENT_NOT_FOUND') {
    return (
      <>
        <PageSEO description="Verify the latest MoMo payment status for your order." noIndex path={routes.paymentMomoReturn} title="MoMo Payment Return" />
        <Container className="py-12">
          <ErrorCard
            action={<Button onClick={() => void paymentQuery.refetch()}>Kiểm tra lại</Button>}
            className="border-border bg-surface"
            description="Bản ghi thanh toán cho đơn hàng này chưa sẵn sàng. Vui lòng thử lại sau ít phút."
            title="Chưa có trạng thái thanh toán"
          />
        </Container>
      </>
    );
  }

  const status = payment?.status;
  const providerLabel = getPaymentProviderLabel(payment?.provider ?? payment?.transactions[0]?.provider ?? 'MOMO');
  const isSuccess = status === PAYMENT_STATUSES.PAID;
  const isProcessing = isProcessingStatus(status) || (!payment && (paymentQuery.isLoading || paymentQuery.isFetching));
  const isFailed = isFailedStatus(status);
  const isPendingAfterTimeout = !isSuccess && !isFailed && paymentQuery.maxAttemptsReached;
  const title = isSuccess
    ? 'Thanh toán MoMo thành công'
    : isFailed
      ? 'Thanh toán chưa hoàn tất hoặc đã bị hủy.'
      : isPendingAfterTimeout
        ? 'Thanh toán MoMo đang được xử lý'
        : 'Đang kiểm tra trạng thái thanh toán...';
  const description = isSuccess
    ? 'Hệ thống đã xác nhận thanh toán từ backend. Đơn hàng của bạn đã được cập nhật.'
    : isFailed
      ? 'Backend chưa xác nhận thanh toán thành công cho đơn hàng này.'
      : isPendingAfterTimeout
        ? 'Thanh toán MoMo đang được xử lý. Vui lòng kiểm tra lại đơn hàng sau ít phút.'
        : 'Đang kiểm tra trạng thái thanh toán...';

  return (
    <>
      <PageSEO description="Verify the latest MoMo payment status for your order." noIndex path={routes.paymentMomoReturn} title="MoMo Payment Return" />
      <Container className="space-y-8 pb-16 pt-28 md:space-y-10 md:pb-20 md:pt-32">
        {paymentQuery.isLoading && !payment ? <LoadingOverlay className="min-h-[320px] border-border bg-surface" inline label="Đang kiểm tra trạng thái thanh toán..." /> : null}
        <div className="grid gap-10 xl:grid-cols-[minmax(0,1fr)_380px]">
          <section className="space-y-6">
            <div className="border border-border bg-surface px-6 py-8 md:px-8 md:py-10">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-outline">MoMo return</p>
                  <h1 className="mt-4 font-display text-[3.5rem] leading-none text-text-primary md:text-[4.5rem]">{title}</h1>
                  <p className="mt-4 text-sm uppercase tracking-[0.08em] text-text-secondary">{providerLabel}</p>
                </div>
                {status ? (
                  <div className={`inline-flex items-center gap-2 border px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] ${statusToneClasses[status] ?? 'border-border bg-surface-muted text-text-primary'}`}>
                    {isSuccess ? <CheckCircle2 className="h-4 w-4" /> : null}
                    {isFailed ? <XCircle className="h-4 w-4" /> : null}
                    {isProcessing ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
                    {getPaymentStatusLabel(status)}
                  </div>
                ) : null}
              </div>

              <p className="mt-5 max-w-2xl text-sm leading-7 text-text-secondary">{description}</p>

              {isProcessing ? (
                <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.18em] text-outline">
                  Poll {paymentQuery.attemptCount} / 15
                </p>
              ) : null}
            </div>

            {payment ? (
              <section className="border border-border bg-surface px-5 py-5 md:px-6">
                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-outline">Order code</p>
                    <p className="mt-3 font-mono text-sm text-text-primary">{payment.orderCode}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-outline">Payment code</p>
                    <p className="mt-3 font-mono text-sm text-text-primary">{payment.paymentCode}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-outline">Amount</p>
                    <p className="mt-3 text-sm text-text-primary">{formatMoney(payment.amount)}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-outline">Updated from backend</p>
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
          </section>

          <aside className="space-y-4">
            <section className="border border-border bg-surface px-5 py-5 md:px-6">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-outline">Next actions</p>
              <div className="mt-6 space-y-3">
                <Link className={buttonStyles({ fullWidth: true })} to={routePaths.orderDetail(orderId)}>
                  Xem đơn hàng
                </Link>
                <Link className={buttonStyles({ fullWidth: true, variant: 'ghost' })} to={routes.products}>
                  Tiếp tục mua sắm
                </Link>
                {isPendingAfterTimeout ? (
                  <Button fullWidth onClick={() => void paymentQuery.refetch()} variant="secondary">
                    Kiểm tra lại
                  </Button>
                ) : null}
              </div>
            </section>
          </aside>
        </div>
      </Container>
    </>
  );
};

export default MomoReturnPage;
