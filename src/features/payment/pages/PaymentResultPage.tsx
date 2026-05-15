import { useCallback, useEffect, useMemo, useState } from 'react';
import { CheckCircle2, LoaderCircle, XCircle } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';

import { routePaths, routes } from '@/constants/routes';
import { useInitiatePayment, usePaymentResultPolling } from '@/features/payment/hooks/usePayment';
import { readPendingPaypalPayment, writePendingPaypalPayment } from '@/features/payment/lib/pendingPaypalPayment';
import { getPaymentRedirectUrl } from '@/features/payment/services/paymentService';
import { EmptyState } from '@/shared/components/feedback/EmptyState';
import { ErrorCard } from '@/shared/components/feedback/ErrorCard';
import { LoadingOverlay } from '@/shared/components/feedback/LoadingOverlay';
import { Container } from '@/shared/components/layout/Container';
import { PageSEO } from '@/shared/components/seo/PageSEO';
import { Button } from '@/shared/components/ui/Button';
import { buttonStyles } from '@/shared/components/ui/buttonStyles';
import { getPaymentProviderLabel, getPaymentStatusLabel } from '@/shared/lib/commerceLabels';
import {
  isMutationProcessingError,
  isPaymentAlreadyProcessedError,
  isUncertainMutationFailure,
  shouldReuseIdempotencyKey,
} from '@/shared/lib/idempotentMutation';
import { useUiStore } from '@/shared/stores/uiStore';
import { PAYMENT_PROVIDERS, PAYMENT_STATUSES, normalizePaymentProvider, type PaymentProvider } from '@/shared/types/payment.types';
import { createIdempotencyKey } from '@/shared/utils/createIdempotencyKey';
import { formatDate } from '@/shared/utils/formatDate';
import { formatMoney } from '@/shared/utils/formatMoney';

const codeButtonClassName =
  'inline-flex items-center border border-border px-4 py-2 font-mono text-sm text-text-primary transition-colors hover:border-text-primary';
const PAYMENT_STATUS_UNKNOWN_MESSAGE =
  'Thanh toán có thể vẫn đang được xử lý. Vui lòng kiểm tra lại trạng thái đơn hàng hoặc thử lại sau.';

const statusToneClasses: Record<string, string> = {
  [PAYMENT_STATUSES.PAID]: 'border-success/20 bg-success/10 text-success',
  [PAYMENT_STATUSES.INITIATED]: 'border-info/20 bg-info/10 text-info',
  [PAYMENT_STATUSES.PENDING]: 'border-warning/20 bg-warning/10 text-warning',
  [PAYMENT_STATUSES.PROCESSING]: 'border-warning/20 bg-warning/10 text-warning',
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
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId') ?? '';
  const requestedProvider = normalizePaymentProvider(searchParams.get('provider'));
  const addToast = useUiStore((state) => state.addToast);
  const paymentQuery = usePaymentResultPolling(orderId);
  const initiatePayment = useInitiatePayment();
  const [pendingAttempt, setPendingAttempt] = useState<PendingPaymentAttempt | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [hasAttemptedAutoInitiate, setHasAttemptedAutoInitiate] = useState(false);

  const payment = paymentQuery.data;
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
    if (!orderId || initiatePayment.isPending) {
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
  ]);

  const isNotFound = notFoundCode === 'PAYMENT_NOT_FOUND';
  const isOrderMissing = notFoundCode === 'ORDER_NOT_FOUND';
  const paymentRedirectUrl = payment ? getPaymentRedirectUrl(payment) : undefined;
  const canResumePayment =
    payment &&
    payment.status !== PAYMENT_STATUSES.PAID &&
    payment.status !== PAYMENT_STATUSES.REFUNDED &&
    payment.status !== PAYMENT_STATUSES.PARTIALLY_REFUNDED &&
    Boolean(paymentRedirectUrl);
  const canReinitiatePayment =
    Boolean(paymentProvider && payment) &&
    (payment?.status ?? null) !== PAYMENT_STATUSES.PAID &&
    (payment?.status ?? null) !== PAYMENT_STATUSES.REFUNDED &&
    (payment?.status ?? null) !== PAYMENT_STATUSES.PARTIALLY_REFUNDED &&
    !paymentRedirectUrl;
  const canChooseProviderForExistingPayment =
    Boolean(payment) &&
    !paymentProvider &&
    (payment?.status ?? null) !== PAYMENT_STATUSES.PAID &&
    (payment?.status ?? null) !== PAYMENT_STATUSES.REFUNDED &&
    (payment?.status ?? null) !== PAYMENT_STATUSES.PARTIALLY_REFUNDED &&
    !paymentRedirectUrl;

  useEffect(() => {
    if (!isNotFound || !orderId || initiatePayment.isPending || hasAttemptedAutoInitiate) {
      return;
    }

    if (requestedProvider !== PAYMENT_PROVIDERS.PAYPAL) {
      return;
    }

    setHasAttemptedAutoInitiate(true);
    initiate();
  }, [hasAttemptedAutoInitiate, initiate, initiatePayment.isPending, isNotFound, orderId, requestedProvider]);

  if (!orderId) {
    return (
      <>
        <PageSEO description="Review the latest payment status for your order." noIndex path={routes.paymentResult} title="Payment Result" />
        <Container className="py-12">
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
        </Container>
      </>
    );
  }

  return (
    <>
      <PageSEO description="Review the latest payment status for your order." noIndex path={routes.paymentResult} title="Payment Result" />
      <Container className="space-y-8 pb-16 pt-28 md:space-y-10 md:pb-20 md:pt-32">
        {paymentQuery.isLoading ? <LoadingOverlay className="min-h-[320px] border-border bg-surface" inline label="Loading payment result..." /> : null}
        {isRedirecting ? <LoadingOverlay label={`Đang chuyển hướng sang ${paymentProviderLabel}...`} /> : null}
        {paymentQuery.isError && !isNotFound && !isOrderMissing ? (
          <ErrorCard
            action={<Button onClick={() => void paymentQuery.refetch()}>Retry</Button>}
            className="border-border bg-surface"
            description="The payment record could not be loaded from the current service."
            title="Payment lookup failed"
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
        {paymentQuery.isError && isNotFound ? (
          <EmptyState
            action={
              <div className="flex flex-wrap justify-center gap-3">
                {paymentProvider ? (
                  <Button disabled={initiatePayment.isPending} onClick={() => initiate()}>
                    {initiatePayment.isPending ? 'Initiating payment...' : `Start ${paymentProviderLabel} payment`}
                  </Button>
                ) : (
                  <>
                    <Button disabled={initiatePayment.isPending} onClick={() => initiate(PAYMENT_PROVIDERS.PAYPAL)}>
                      {initiatePayment.isPending ? 'Initiating payment...' : 'Start PayPal payment'}
                    </Button>
                    <Button disabled={initiatePayment.isPending} onClick={() => initiate(PAYMENT_PROVIDERS.MOMO)} variant="secondary">
                      {initiatePayment.isPending ? 'Initiating payment...' : 'Start MoMo payment'}
                    </Button>
                  </>
                )}
                <Link className={buttonStyles({ variant: 'ghost' })} to={routePaths.orderDetail(orderId)}>
                  Back to order
                </Link>
              </div>
            }
            className="border-border bg-surface px-6 py-16"
            description={
              paymentProvider
                ? 'No payment record exists for this order yet. Start payment to create the first transaction.'
                : 'No payment record exists for this order yet. Choose MoMo or PayPal to create the first transaction.'
            }
            title="Payment not found."
          />
        ) : null}
        {payment ? (
          <div className="grid gap-10 xl:grid-cols-[minmax(0,1fr)_380px]">
            <section className="space-y-6">
              <div className="border border-border bg-surface px-6 py-8 md:px-8 md:py-10">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-outline">Payment result</p>
                    <h1 className="mt-4 font-display text-[3.5rem] leading-none text-text-primary md:text-[4.5rem]">
                      {payment.status === PAYMENT_STATUSES.PAID
                        ? 'Payment Completed.'
                        : payment.status === PAYMENT_STATUSES.FAILED
                          ? 'Payment Failed.'
                          : 'Payment Processing.'}
                    </h1>
                    <p className="mt-4 text-sm uppercase tracking-[0.08em] text-text-secondary">{getPaymentProviderLabel(payment.provider ?? payment.transactions[0]?.provider ?? paymentProvider)}</p>
                  </div>
                  <div className={`inline-flex items-center gap-2 border px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] ${statusToneClasses[payment.status]}`}>
                    {payment.status === PAYMENT_STATUSES.PAID ? <CheckCircle2 className="h-4 w-4" /> : null}
                    {payment.status === PAYMENT_STATUSES.FAILED ? <XCircle className="h-4 w-4" /> : null}
                    {isProcessingStatus(payment.status) ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
                    {getPaymentStatusLabel(payment.status)}
                  </div>
                </div>

                <p className="mt-5 max-w-2xl text-sm leading-7 text-text-secondary">
                  {payment.status === PAYMENT_STATUSES.PAID
                    ? 'Your payment has been confirmed. The order archive is updated and ready for the next fulfillment step.'
                    : payment.status === PAYMENT_STATUSES.FAILED
                      ? `The gateway reported a failed ${paymentProviderLabel} transaction. You can retry payment from this page without creating a duplicate record.`
                      : paymentQuery.maxAttemptsReached
                        ? 'The payment is still processing. Automatic polling has paused, but you can check again manually at any time.'
                        : 'We are polling the latest payment status and will stop automatically when the gateway settles it.'}
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  <button className={codeButtonClassName} onClick={() => void copyCode(payment.paymentCode, 'Payment code')} type="button">
                    {payment.paymentCode}
                  </button>
                  <button className={codeButtonClassName} onClick={() => void copyCode(payment.orderCode, 'Order code')} type="button">
                    {payment.orderCode}
                  </button>
                </div>
              </div>

              <section className="border border-border bg-surface px-5 py-5 md:px-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-outline">Transactions</p>
                    <h2 className="mt-3 font-display text-[2rem] leading-none text-text-primary">Activity</h2>
                  </div>
                  {isProcessingStatus(payment.status) && !paymentQuery.maxAttemptsReached ? (
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-outline">Poll {paymentQuery.attemptCount} / 8</p>
                  ) : null}
                </div>
                <div className="mt-6 space-y-4">
                  {payment.transactions.map((transaction) => (
                    <article className="grid gap-4 border-b border-border pb-4 last:border-b-0 last:pb-0 md:grid-cols-[minmax(0,1fr)_180px]" key={transaction.id}>
                      <div>
                        <p className="font-mono text-sm text-text-primary">{transaction.transactionCode}</p>
                        <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.18em] text-outline">
                          {getPaymentStatusLabel(transaction.status)} / {getPaymentProviderLabel(transaction.provider)}
                        </p>
                        <p className="mt-3 text-sm leading-7 text-text-secondary">{transaction.note ?? 'No transaction note provided.'}</p>
                      </div>
                      <div className="text-left md:text-right">
                        <p className="text-sm text-text-primary">{formatMoney(transaction.amount)}</p>
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
            </section>

            <aside className="space-y-4">
              <section className="border border-border bg-surface px-5 py-5 md:px-6">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-outline">Amount</p>
                <p className="mt-3 font-display text-[2.8rem] leading-none text-text-primary">{formatMoney(payment.amount)}</p>
                <p className="mt-4 text-sm leading-7 text-text-secondary">
                  Created {formatDate(payment.createdAt)}
                  {payment.paidAt ? `, paid ${formatDate(payment.paidAt)}` : '.'}
                </p>
              </section>

              <section className="border border-border bg-surface px-5 py-5 md:px-6">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-outline">Next actions</p>
                <div className="mt-6 space-y-3">
                  <Link className={buttonStyles({ fullWidth: true })} to={routePaths.orderDetail(payment.orderId)}>
                    View order
                  </Link>
                  <Link className={buttonStyles({ fullWidth: true, variant: 'ghost' })} to={routes.products}>
                    Continue shopping
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
                      Continue to {getPaymentProviderLabel(payment.provider ?? payment.transactions[0]?.provider ?? paymentProvider)}
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
                  {paymentQuery.maxAttemptsReached ? (
                    <Button fullWidth onClick={() => void paymentQuery.refetch()} variant="secondary">
                      Check again
                    </Button>
                  ) : null}
                </div>
              </section>
            </aside>
          </div>
        ) : null}
      </Container>
    </>
  );
};

export default PaymentResultPage;
