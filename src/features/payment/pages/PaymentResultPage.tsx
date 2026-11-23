import { useCallback, useEffect, useMemo, useState } from 'react';
import { CheckCircle2, LoaderCircle, XCircle } from 'lucide-react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';

import { routePaths, routes } from '@/constants/routes';
import { config } from '@/constants/config';
import { useInitiatePayment, usePaymentResultPolling } from '@/features/payment/hooks/usePayment';
import { readPendingPaypalPayment, writePendingPaypalPayment } from '@/features/payment/lib/pendingPaypalPayment';
import { getPaymentRedirectUrl } from '@/features/payment/services/paymentService';
import { EmptyState } from '@/shared/components/feedback/EmptyState';
import { ErrorCard } from '@/shared/components/feedback/ErrorCard';
import { LoadingOverlay } from '@/shared/components/feedback/LoadingOverlay';
import { PaymentPageLayout } from '@/features/payment/components/PaymentPageLayout';
import { PaymentOrderSummary } from '@/features/payment/components/PaymentOrderSummary';
import { Button } from '@/shared/components/ui/Button';
import { buttonStyles } from '@/shared/components/ui/buttonStyles';
import { isAuthenticationError } from '@/shared/lib/authErrors';
import { getPaymentProviderLabel, getPaymentStatusLabel } from '@/shared/lib/commerceLabels';
import {
  isMutationProcessingError,
  isPaymentAlreadyProcessedError,
  isUncertainMutationFailure,
  shouldReuseIdempotencyKey,
} from '@/shared/lib/idempotentMutation';
import { useUiStore } from '@/shared/stores/uiStore';
import { useOrderLifecycle } from '@/shared/hooks/useOrderLifecycle';
import { canStartOrRetryOnlinePayment, getCancelledPaidMessage, isCancelledOrderWithPaidPayment } from '@/shared/lib/orderPaymentLifecycle';
import { PAYMENT_PROVIDERS, PAYMENT_STATUSES, normalizePaymentProvider, type PaymentProvider } from '@/shared/types/payment.types';
import { createIdempotencyKey } from '@/shared/utils/createIdempotencyKey';
import { formatDate } from '@/shared/utils/formatDate';
import { formatVnd } from '@/shared/utils/formatVnd';

const codeButtonClassName =
  'min-h-11 max-w-full break-all text-left font-mono text-sm text-text-primary underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2';
const PAYMENT_STATUS_UNKNOWN_MESSAGE =
  'Thanh toán có thể vẫn đang được xử lý. Vui lòng kiểm tra lại trạng thái đơn hàng hoặc thử lại sau.';

const statusToneClasses: Record<string, string> = {
  [PAYMENT_STATUSES.PAID]: 'border-success/20 bg-success/10 text-brand-primary',
  [PAYMENT_STATUSES.INITIATED]: 'border-info/20 bg-info/10 text-info',
  [PAYMENT_STATUSES.PENDING]: 'border-warning/20 bg-warning/10 text-brand-primary',
  [PAYMENT_STATUSES.PROCESSING]: 'border-warning/20 bg-warning/10 text-brand-primary',
  [PAYMENT_STATUSES.FAILED]: 'border-danger/20 bg-danger/10 text-danger',
  [PAYMENT_STATUSES.CANCELLED]: 'border-danger/20 bg-danger/10 text-danger',
  [PAYMENT_STATUSES.EXPIRED]: 'border-danger/20 bg-danger/10 text-danger',
  [PAYMENT_STATUSES.REFUNDED]: 'border-border bg-surface-muted text-text-primary',
  [PAYMENT_STATUSES.PARTIALLY_REFUNDED]: 'border-border bg-surface-muted text-text-primary',
};

type PendingPaymentAttempt = {
  idempotencyKey: string;
  payloadSignature: string;
};

const createInitiatePayload = (orderId: string, provider: PaymentProvider) => {
  if (provider === PAYMENT_PROVIDERS.MOCK) {
    return { provider };
  }

  if (typeof window === 'undefined') {
    return {
      provider,
    };
  }

  return {
    provider,
    returnUrl:
      provider === PAYMENT_PROVIDERS.PAYPAL
        ? `${window.location.origin}${routePaths.paymentPaypalReturn(orderId)}`
        : `${window.location.origin}${routePaths.paymentMomoReturn(orderId)}`,
    cancelUrl:
      provider === PAYMENT_PROVIDERS.PAYPAL
        ? `${window.location.origin}${routePaths.paymentPaypalCancel(orderId)}`
        : undefined,
  };
};

const isProcessingStatus = (status: string | undefined) =>
  status === PAYMENT_STATUSES.INITIATED || status === PAYMENT_STATUSES.PENDING || status === PAYMENT_STATUSES.PROCESSING;

export const PaymentResultPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId') ?? '';
  const requestedProvider = normalizePaymentProvider(searchParams.get('provider'));
  const addToast = useUiStore((state) => state.addToast);
  const paymentQuery = usePaymentResultPolling(orderId);
  const orderQuery = useOrderLifecycle(orderId);
  const initiatePayment = useInitiatePayment();
  const [pendingAttempt, setPendingAttempt] = useState<PendingPaymentAttempt | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [hasAttemptedAutoInitiate, setHasAttemptedAutoInitiate] = useState(false);

  const payment = paymentQuery.data;
  const orderLifecycle = orderQuery.data;
  const lifecycle = orderLifecycle
    ? {
        orderStatus: orderLifecycle.status,
        paymentMethod: orderLifecycle.paymentMethod,
        orderPaymentStatus: orderLifecycle.paymentStatus,
        paymentStatus: payment?.status,
      }
    : null;
  const canManagePayment = lifecycle ? canStartOrRetryOnlinePayment(lifecycle) : false;
  const isOrderCancelled = orderLifecycle?.status === 'CANCELLED';
  const isLatePaid = lifecycle ? isCancelledOrderWithPaidPayment(lifecycle) : false;
  const isPaymentEnded = payment?.status === PAYMENT_STATUSES.CANCELLED || payment?.status === PAYMENT_STATUSES.EXPIRED;
  const cancelledPaidMessage = lifecycle ? getCancelledPaidMessage(lifecycle) : null;
  const pendingPaypalPayment = readPendingPaypalPayment();
  const notFoundCode = useMemo(
    () => (paymentQuery.error instanceof Error && 'code' in paymentQuery.error ? String((paymentQuery.error as { code?: string }).code) : ''),
    [paymentQuery.error],
  );
  const paymentProvider =
    normalizePaymentProvider(payment?.provider ?? payment?.transactions[0]?.provider ?? null) ??
    requestedProvider ??
    (pendingPaypalPayment?.orderId === orderId ? pendingPaypalPayment.provider : null);
  const paymentProviderLabel = getPaymentProviderLabel(paymentProvider);
  const initiatePayload = useMemo(() => {
    if (!paymentProvider) {
      return undefined;
    }

    return createInitiatePayload(orderId, paymentProvider);
  }, [orderId, paymentProvider]);
  const initiatePayloadSignature = useMemo(
    () =>
      JSON.stringify({
        orderId,
        payload: initiatePayload,
      }),
    [initiatePayload, orderId],
  );

  useEffect(() => {
    if (!pendingAttempt || initiatePayment.isPending || pendingAttempt.payloadSignature === initiatePayloadSignature) {
      return;
    }

    setPendingAttempt(null);
  }, [initiatePayloadSignature, initiatePayment.isPending, pendingAttempt]);

  useEffect(() => {
    if (orderId !== pendingPaypalPayment?.orderId) {
      setHasAttemptedAutoInitiate(false);
    }
  }, [orderId, pendingPaypalPayment?.orderId]);

  const copyCode = async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value);
      addToast({
        tone: 'success',
        title: 'Copied',
        description: `${label} copied to clipboard.`,
      });
    } catch {
      addToast({
        tone: 'danger',
        title: 'Copy failed',
        description: 'Clipboard access is unavailable in this browser context.',
      });
    }
  };

  const initiate = useCallback((providerOverride?: PaymentProvider) => {
    if (!orderId || initiatePayment.isPending || !canManagePayment) {
      return;
    }

    const effectiveProvider = providerOverride ?? paymentProvider;
    if (!effectiveProvider) {
      addToast({
        tone: 'info',
        title: 'Choose a payment provider',
        description: 'Select MoMo or PayPal before starting the online payment flow.',
      });
      return;
    }

    const payload = createInitiatePayload(orderId, effectiveProvider);
    const payloadSignature = JSON.stringify({
      orderId,
      payload,
    });
    const idempotencyKey =
      pendingAttempt?.payloadSignature === payloadSignature ? pendingAttempt.idempotencyKey : createIdempotencyKey('payment');

    setPendingAttempt({
      idempotencyKey,
      payloadSignature: payloadSignature,
    });

    initiatePayment.mutate(
      {
        orderId,
        payload,
        idempotencyKey,
      },
      {
        onSuccess: (response) => {
          setPendingAttempt(null);
          const redirectUrl = getPaymentRedirectUrl(response);

          if (!redirectUrl) {
            addToast({
              tone: 'danger',
              title: `Không thể khởi tạo thanh toán ${paymentProviderLabel}`,
              description: `Không thể khởi tạo thanh toán ${paymentProviderLabel}. Vui lòng thử lại.`,
            });
            void paymentQuery.refetch();
            return;
          }

          if (effectiveProvider === PAYMENT_PROVIDERS.PAYPAL) {
            writePendingPaypalPayment({
              orderId: response.orderId,
              orderCode: response.orderCode,
              paymentId: response.paymentId ?? response.id,
              provider: PAYMENT_PROVIDERS.PAYPAL,
              createdAt: new Date().toISOString(),
            });
          }

          setIsRedirecting(true);
          window.location.href = redirectUrl;
        },
        onError: (error) => {
          if (!shouldReuseIdempotencyKey(error)) {
            setPendingAttempt(null);
          }

          if (isAuthenticationError(error)) {
            addToast({
              tone: 'info',
              title: 'Please sign in to continue',
              description: 'Sign in again to continue this payment flow.',
            });
            navigate(routePaths.loginRedirect(location.pathname + location.search));
            return;
          }

          if (isPaymentAlreadyProcessedError(error)) {
            addToast({
              tone: 'info',
              title: 'Thanh toán đã được ghi nhận',
              description: error instanceof Error ? error.message : 'Thanh toán đã được ghi nhận trước đó.',
            });
            void paymentQuery.refetch();
            return;
          }

          if (isMutationProcessingError(error)) {
            addToast({
              tone: 'info',
              title: `Thanh toán ${paymentProviderLabel} đang được xử lý`,
              description: error instanceof Error ? error.message : PAYMENT_STATUS_UNKNOWN_MESSAGE,
            });
            void paymentQuery.refetch();
            return;
          }

          if (isUncertainMutationFailure(error)) {
            addToast({
              tone: 'info',
              title: 'Kiểm tra lại trạng thái thanh toán',
              description: PAYMENT_STATUS_UNKNOWN_MESSAGE,
            });
            void paymentQuery.refetch();
            return;
          }

          addToast({
            tone: 'danger',
            title: `Khởi tạo thanh toán ${paymentProviderLabel} thất bại`,
            description: error instanceof Error ? error.message : 'Vui lòng thử lại.',
          });
        },
      },
    );
  }, [
    addToast,
    initiatePayment,
    orderId,
    paymentProvider,
    paymentProviderLabel,
    paymentQuery,
    pendingAttempt,
    location.pathname,
    location.search,
    navigate,
    canManagePayment,
  ]);

  const isNotFound = notFoundCode === 'PAYMENT_NOT_FOUND';
  const isOrderMissing = notFoundCode === 'ORDER_NOT_FOUND';
  const paymentRedirectUrl = payment ? getPaymentRedirectUrl(payment) : undefined;
  const canResumePayment =
    payment &&
    canManagePayment &&
    isProcessingStatus(payment.status) &&
    Boolean(paymentRedirectUrl);
  const canReinitiatePayment =
    Boolean(paymentProvider && payment && canManagePayment) &&
    payment?.status === PAYMENT_STATUSES.FAILED &&
    !paymentRedirectUrl;
  const canChooseProviderForExistingPayment =
    Boolean(payment && isProcessingStatus(payment.status)) &&
    canManagePayment &&
    !paymentProvider &&
    !paymentRedirectUrl;

  useEffect(() => {
    if (!isNotFound || !orderId || !canManagePayment || initiatePayment.isPending || hasAttemptedAutoInitiate) {
      return;
    }

    const canAutoInitiate =
      requestedProvider === PAYMENT_PROVIDERS.PAYPAL ||
      (requestedProvider === PAYMENT_PROVIDERS.MOCK && config.e2eMode);

    if (!canAutoInitiate) {
      return;
    }

    setHasAttemptedAutoInitiate(true);
    initiate();
  }, [canManagePayment, hasAttemptedAutoInitiate, initiate, initiatePayment.isPending, isNotFound, orderId, requestedProvider]);

  if (!orderId) {
    return (
      <PaymentPageLayout path={routes.paymentResult} title="Kết quả xử lý giao dịch đơn hàng">
        <EmptyState
          action={
            <Link className={buttonStyles({})} to={routes.orders}>
              View orders
            </Link>
          }
          className="border-border bg-surface px-6 py-16"
          description="Open this page from an order detail payment action so the correct order reference is available."
          title="Payment reference missing."
        />
      </PaymentPageLayout>
    );
  }

  return (
    <PaymentPageLayout breadcrumbTitle="Kết quả" compactMobileHeading={Boolean(payment)} path={routes.paymentResult} title="Kết quả xử lý giao dịch đơn hàng" orderCode={payment?.orderCode ?? orderLifecycle?.orderCode}>
      {paymentQuery.isLoading || orderQuery.isLoading ? <LoadingOverlay className="min-h-24 rounded-lg border-border bg-surface" inline label="Loading order and payment status..." /> : null}
      {isRedirecting ? <LoadingOverlay label={`Đang chuyển hướng sang ${paymentProviderLabel}...`} /> : null}
      {paymentQuery.isError && !isNotFound && !isOrderMissing ? (
        <ErrorCard
          action={<Button onClick={() => void paymentQuery.refetch()}>Retry</Button>}
          className="border-border bg-surface"
          description="The payment record could not be loaded from the current service."
          title="Payment lookup failed"
        />
      ) : null}
      {orderQuery.isError && !isOrderMissing ? (
        <ErrorCard
          action={<Button onClick={() => void orderQuery.refetch()}>Check order status again</Button>}
          className="border-border bg-surface"
          description="Payment actions are paused until the current order status can be verified."
          title="Order status unavailable"
        />
      ) : null}
      {paymentQuery.isError && isOrderMissing ? (
        <EmptyState
          action={
            <Link className={buttonStyles({})} to={routes.orders}>
              Return to archive
            </Link>
          }
          className="border-border bg-surface px-6 py-16"
          description="This order reference could not be matched to your customer archive."
          title="Order not found."
        />
      ) : null}
      {paymentQuery.isError && isNotFound && orderLifecycle && !orderQuery.isError ? (
        <EmptyState
          action={
            <div className="flex flex-wrap justify-center gap-3">
              {canManagePayment && paymentProvider ? (
                <Button disabled={initiatePayment.isPending} onClick={() => initiate()}>
                  {initiatePayment.isPending ? 'Initiating payment...' : `Start ${paymentProviderLabel} payment`}
                </Button>
              ) : canManagePayment ? (
                <>
                  <Button disabled={initiatePayment.isPending} onClick={() => initiate(PAYMENT_PROVIDERS.PAYPAL)}>
                    {initiatePayment.isPending ? 'Initiating payment...' : 'Start PayPal payment'}
                  </Button>
                  <Button disabled={initiatePayment.isPending} onClick={() => initiate(PAYMENT_PROVIDERS.MOMO)} variant="secondary">
                    {initiatePayment.isPending ? 'Initiating payment...' : 'Start MoMo payment'}
                  </Button>
                </>
              ) : null}
              <Link className={buttonStyles({ variant: 'ghost' })} to={routePaths.orderDetail(orderId)}>
                Back to order
              </Link>
            </div>
          }
          className="border-border bg-surface px-6 py-16"
          description={cancelledPaidMessage ?? (canManagePayment
            ? paymentProvider
              ? 'No payment record exists yet. Start the selected online payment to create the first transaction.'
              : 'No payment record exists yet. Choose MoMo or PayPal to create the first transaction.'
            : 'This order is no longer awaiting online payment. Review its current status in the order details.')}
          title={cancelledPaidMessage ? 'Đã nhận tiền, đơn hàng đã hủy.' : canManagePayment ? 'Payment not found.' : 'Payment cannot be started for this order.'}
        />
      ) : null}
      {payment ? (
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)] lg:gap-12">
          <section className="min-w-0 space-y-5">
            <div className="rounded-lg border border-border bg-surface p-5 md:p-8 lg:p-10">
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-5" role="status">
                <div>
                  <p className="mb-1 text-xs font-medium uppercase tracking-wide text-text-secondary">Trạng thái máy chủ</p>
                  <h2 className="text-lg font-semibold leading-tight text-text-primary md:text-xl">
                    {isLatePaid
                      ? 'Đã nhận tiền, đơn hàng đã hủy.'
                      : isOrderCancelled
                        ? 'Đơn hàng đã hủy, không thể tiếp tục thanh toán.'
                      : payment.status === PAYMENT_STATUSES.PAID
                        ? orderQuery.isError
                          ? 'Đã nhận tiền, chưa xác minh được trạng thái đơn.'
                          : 'Thanh toán thành công.'
                      : payment.status === PAYMENT_STATUSES.FAILED
                        ? 'Thanh toán thất bại.'
                        : isPaymentEnded
                          ? 'Phiên thanh toán đã kết thúc.'
                          : 'Đang xử lý giao dịch đơn hàng'}
                  </h2>
                </div>
                <div className={`inline-flex items-center gap-2 border px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] ${statusToneClasses[payment.status]}`}>
                  {payment.status === PAYMENT_STATUSES.PAID ? <CheckCircle2 className="h-4 w-4" /> : null}
                  {payment.status === PAYMENT_STATUSES.FAILED ? <XCircle className="h-4 w-4" /> : null}
                  {isProcessingStatus(payment.status) ? <LoaderCircle aria-hidden="true" className="h-4 w-4 motion-safe:animate-spin" /> : null}
                  {getPaymentStatusLabel(payment.status)}
                </div>
              </div>

              <p className="mt-6 rounded border border-border bg-surface-muted p-4 text-sm leading-7 text-text-primary md:p-5">
                {isLatePaid
                  ? cancelledPaidMessage
                  : isOrderCancelled
                    ? 'Đơn đã hủy. Bạn có thể kiểm tra kết quả cuối cùng trong chi tiết đơn hàng.'
                  : payment.status === PAYMENT_STATUSES.PAID
                    ? orderQuery.isError
                      ? 'Hệ thống đã ghi nhận thanh toán. Vui lòng kiểm tra lại trạng thái đơn hàng.'
                      : 'Hệ thống đã xác nhận thanh toán. Xem chi tiết đơn để theo dõi tình trạng xử lý.'
                  : payment.status === PAYMENT_STATUSES.FAILED
                    ? `Giao dịch qua ${paymentProviderLabel} thất bại. Bạn có thể thử lại khi đơn còn chờ thanh toán.`
                    : isPaymentEnded
                      ? 'Phiên thanh toán đã kết thúc. Bạn có thể thử lại khi đơn còn chờ thanh toán.'
                    : paymentQuery.maxAttemptsReached
                      ? 'Giao dịch vẫn đang xử lý. Bạn có thể làm mới để kiểm tra trạng thái mới nhất.'
                      : 'Fashion Shop đang kiểm tra trạng thái giao dịch từ máy chủ. Việc quay lại từ cổng thanh toán chưa xác nhận giao dịch.'}
              </p>

              <h3 className="mt-7 text-xs font-semibold uppercase tracking-wide">Thông tin giao dịch</h3>
              <dl className="mt-3 grid gap-x-6 text-sm sm:grid-cols-2 sm:gap-y-4">
                <div className="flex min-h-11 min-w-0 items-center justify-between gap-3 border-b border-border sm:block sm:pb-3">
                  <dt className="text-text-secondary">Mã đơn hàng</dt>
                  <dd className="min-w-0 text-right sm:mt-1 sm:text-left">
                    <button aria-label={`Sao chép mã đơn hàng ${payment.orderCode}`} className={codeButtonClassName} onClick={() => void copyCode(payment.orderCode, 'Mã đơn hàng')} type="button">{payment.orderCode}</button>
                  </dd>
                </div>
                <div className="flex min-h-11 min-w-0 items-center justify-between gap-3 border-b border-border sm:block sm:pb-3">
                  <dt className="text-text-secondary">Mã tham chiếu giao dịch</dt>
                  <dd className="min-w-0 text-right sm:mt-1 sm:text-left">
                    <button aria-label={`Sao chép mã thanh toán ${payment.paymentCode}`} className={codeButtonClassName} onClick={() => void copyCode(payment.paymentCode, 'Mã thanh toán')} type="button">{payment.paymentCode}</button>
                  </dd>
                </div>
                <div className="flex min-h-11 min-w-0 items-center justify-between gap-3 border-b border-border sm:block sm:pb-3">
                  <dt className="text-text-secondary">Phương thức thanh toán</dt>
                  <dd className="min-w-0 text-right font-medium sm:mt-1 sm:text-left">{getPaymentProviderLabel(payment.provider ?? payment.transactions[0]?.provider ?? paymentProvider)}</dd>
                </div>
                <div className="flex min-h-11 min-w-0 items-center justify-between gap-3 border-b border-border sm:block sm:pb-3">
                  <dt className="text-text-secondary">Thời gian khởi tạo</dt>
                  <dd className="min-w-0 text-right font-medium sm:mt-1 sm:text-left">{formatDate(payment.createdAt)}</dd>
                </div>
              </dl>
              <div className="mt-5 flex flex-wrap items-baseline justify-between gap-3">
                <span className="text-sm text-text-secondary">Tổng thanh toán</span>
                <strong className="text-xl">{formatVnd(payment.amount)}</strong>
              </div>
              <div className="mt-7 grid gap-3 border-t border-border pt-6 sm:grid-cols-2">
                {isProcessingStatus(payment.status) ? (
                  <Button disabled={paymentQuery.isFetching} fullWidth className="!border-text-primary !bg-text-primary hover:!opacity-90" onClick={() => void paymentQuery.refetch()}>
                    Làm mới trạng thái
                  </Button>
                ) : null}
                <Link className={buttonStyles({ fullWidth: true, variant: isProcessingStatus(payment.status) ? 'secondary' : 'primary' })} to={routePaths.orderDetail(payment.orderId)}>
                  Xem chi tiết đơn hàng
                </Link>
                {canResumePayment ? (
                  <Button
                    fullWidth
                    onClick={() => {
                      setIsRedirecting(true);
                      window.location.href = paymentRedirectUrl!;
                    }}
                    variant="secondary"
                  >
                    Tiếp tục qua {getPaymentProviderLabel(payment.provider ?? payment.transactions[0]?.provider ?? paymentProvider)}
                  </Button>
                ) : null}
                {canChooseProviderForExistingPayment ? (
                  <>
                    <Button disabled={initiatePayment.isPending} fullWidth onClick={() => initiate(PAYMENT_PROVIDERS.PAYPAL)} variant="secondary">
                      {initiatePayment.isPending ? 'Retrying payment...' : 'Create PayPal payment link'}
                    </Button>
                    <Button disabled={initiatePayment.isPending} fullWidth onClick={() => initiate(PAYMENT_PROVIDERS.MOMO)} variant="secondary">
                      {initiatePayment.isPending ? 'Retrying payment...' : 'Create MoMo payment link'}
                    </Button>
                  </>
                ) : null}
                {canReinitiatePayment ? (
                  <Button disabled={initiatePayment.isPending} fullWidth onClick={() => initiate()} variant="secondary">
                    {initiatePayment.isPending
                      ? 'Retrying payment...'
                      : payment.status === PAYMENT_STATUSES.FAILED
                        ? `Retry ${paymentProviderLabel} payment`
                        : `Create ${paymentProviderLabel} payment link`}
                  </Button>
                ) : null}
              </div>
              <Link className="mt-5 inline-flex min-h-11 items-center text-sm underline underline-offset-4" to={routes.home}>Quay về trang chủ</Link>
            </div>

            {payment.transactions.length > 0 ? (
              <section className="min-w-0 rounded-lg border border-border bg-surface p-5 md:p-8">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="mt-3 font-display text-[2rem] leading-none text-text-primary">Lịch sử giao dịch</h2>
                </div>
                {isProcessingStatus(payment.status) && !paymentQuery.maxAttemptsReached ? (
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-outline">Lần kiểm tra {paymentQuery.attemptCount} / 8</p>
                ) : null}
              </div>
              <div className="mt-6 space-y-4">
                {payment.transactions.map((transaction) => (
                  <article className="grid gap-4 border-b border-border pb-4 last:border-b-0 last:pb-0 md:grid-cols-[minmax(0,1fr)_180px]" key={transaction.id}>
                    <div>
                      <p className="break-all font-mono text-sm text-text-primary">{transaction.transactionCode}</p>
                      <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.18em] text-outline">
                        {getPaymentStatusLabel(transaction.status)} / {getPaymentProviderLabel(transaction.provider)}
                      </p>
                      {transaction.note ? <p className="mt-3 text-sm leading-7 text-text-secondary">{transaction.note}</p> : null}
                    </div>
                    <div className="text-left md:text-right">
                      <p className="text-sm text-text-primary">{formatVnd(transaction.amount)}</p>
                      <p className="mt-2 text-sm text-text-secondary">
                        {formatDate(transaction.createdAt, {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            </section>
            ) : null}

          </section>

          <aside className="min-w-0 space-y-4">
              {!orderQuery.isError && orderLifecycle ? <PaymentOrderSummary order={orderLifecycle} showDelivery title="Kiện hàng" /> : null}
          </aside>
        </div>
      ) : null}
    </PaymentPageLayout>
  );
};

export default PaymentResultPage;
