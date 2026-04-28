import { useMemo } from 'react';
import { CheckCircle2, LoaderCircle, XCircle } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';

import { routePaths, routes } from '@/constants/routes';
import { useInitiatePayment, usePaymentResultPolling } from '@/features/payment/hooks/usePayment';
import { EmptyState } from '@/shared/components/feedback/EmptyState';
import { ErrorCard } from '@/shared/components/feedback/ErrorCard';
import { LoadingOverlay } from '@/shared/components/feedback/LoadingOverlay';
import { Container } from '@/shared/components/layout/Container';
import { PageSEO } from '@/shared/components/seo/PageSEO';
import { Button } from '@/shared/components/ui/Button';
import { buttonStyles } from '@/shared/components/ui/buttonStyles';
import { useUiStore } from '@/shared/stores/uiStore';
import { PAYMENT_STATUSES } from '@/shared/types/payment.types';
import { formatDate } from '@/shared/utils/formatDate';
import { formatVnd } from '@/shared/utils/formatVnd';

const codeButtonClassName =
  'inline-flex items-center border border-border px-4 py-2 font-mono text-sm text-text-primary transition-colors hover:border-text-primary';

const statusToneClasses: Record<string, string> = {
  [PAYMENT_STATUSES.PAID]: 'border-success/20 bg-success/10 text-success',
  [PAYMENT_STATUSES.INITIATED]: 'border-info/20 bg-info/10 text-info',
  [PAYMENT_STATUSES.PENDING]: 'border-warning/20 bg-warning/10 text-warning',
  [PAYMENT_STATUSES.FAILED]: 'border-danger/20 bg-danger/10 text-danger',
  [PAYMENT_STATUSES.REFUNDED]: 'border-border bg-surface-muted text-text-primary',
  [PAYMENT_STATUSES.PARTIALLY_REFUNDED]: 'border-border bg-surface-muted text-text-primary',
};

export const PaymentResultPage = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId') ?? '';
  const addToast = useUiStore((state) => state.addToast);
  const paymentQuery = usePaymentResultPolling(orderId);
  const initiatePayment = useInitiatePayment();

  const payment = paymentQuery.data;
  const notFoundCode = useMemo(
    () => (paymentQuery.error instanceof Error && 'code' in paymentQuery.error ? String((paymentQuery.error as { code?: string }).code) : ''),
    [paymentQuery.error],
  );

  const copyCode = async (value: string, label: string) => {
    await navigator.clipboard.writeText(value);
    addToast({
      tone: 'success',
      title: 'Copied',
      description: `${label} copied to clipboard.`,
    });
  };

  const initiate = () =>
    initiatePayment.mutate({
      orderId,
      payload: {
        returnUrl: typeof window !== 'undefined' ? `${window.location.origin}${routePaths.paymentResult(orderId)}` : undefined,
      },
    });

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

  const isNotFound = notFoundCode === 'PAYMENT_NOT_FOUND';
  const isOrderMissing = notFoundCode === 'ORDER_NOT_FOUND';

  return (
    <>
      <PageSEO description="Review the latest payment status for your order." noIndex path={routes.paymentResult} title="Payment Result" />
      <Container className="space-y-8 pb-16 pt-28 md:space-y-10 md:pb-20 md:pt-32">
        {paymentQuery.isLoading ? <LoadingOverlay className="min-h-[320px] border-border bg-surface" inline label="Loading payment result..." /> : null}
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
                <Button disabled={initiatePayment.isPending} onClick={initiate}>
                  {initiatePayment.isPending ? 'Initiating payment...' : 'Start payment'}
                </Button>
                <Link className={buttonStyles({ variant: 'ghost' })} to={routePaths.orderDetail(orderId)}>
                  Back to order
                </Link>
              </div>
            }
            className="border-border bg-surface px-6 py-16"
            description="No payment record exists for this order yet. Start payment to create the first transaction."
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
                  </div>
                  <div className={`inline-flex items-center gap-2 border px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] ${statusToneClasses[payment.status]}`}>
                    {payment.status === PAYMENT_STATUSES.PAID ? <CheckCircle2 className="h-4 w-4" /> : null}
                    {payment.status === PAYMENT_STATUSES.FAILED ? <XCircle className="h-4 w-4" /> : null}
                    {payment.status === PAYMENT_STATUSES.INITIATED || payment.status === PAYMENT_STATUSES.PENDING ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
                    {payment.status.replace(/_/g, ' ')}
                  </div>
                </div>

                <p className="mt-5 max-w-2xl text-sm leading-7 text-text-secondary">
                  {payment.status === PAYMENT_STATUSES.PAID
                    ? 'Your payment has been confirmed. The order archive is updated and ready for the next fulfillment step.'
                    : payment.status === PAYMENT_STATUSES.FAILED
                      ? 'The gateway reported a failed transaction. You can retry payment from this page without creating a duplicate record.'
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
                  {(payment.status === PAYMENT_STATUSES.INITIATED || payment.status === PAYMENT_STATUSES.PENDING) && !paymentQuery.maxAttemptsReached ? (
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-outline">
                      Poll {paymentQuery.attemptCount} / 8
                    </p>
                  ) : null}
                </div>
                <div className="mt-6 space-y-4">
                  {payment.transactions.map((transaction) => (
                    <article className="grid gap-4 border-b border-border pb-4 last:border-b-0 last:pb-0 md:grid-cols-[minmax(0,1fr)_180px]" key={transaction.id}>
                      <div>
                        <p className="font-mono text-sm text-text-primary">{transaction.transactionCode}</p>
                        <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.18em] text-outline">
                          {transaction.status.replace(/_/g, ' ')} / {transaction.provider ?? 'Storefront'}
                        </p>
                        <p className="mt-3 text-sm leading-7 text-text-secondary">{transaction.note ?? 'No transaction note provided.'}</p>
                      </div>
                      <div className="text-left md:text-right">
                        <p className="text-sm text-text-primary">{formatVnd(transaction.amount)}</p>
                        <p className="mt-2 text-sm text-text-secondary">{formatDate(transaction.createdAt, { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            </section>

            <aside className="space-y-4">
              <section className="border border-border bg-surface px-5 py-5 md:px-6">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-outline">Amount</p>
                <p className="mt-3 font-display text-[2.8rem] leading-none text-text-primary">{formatVnd(payment.amount)}</p>
                <p className="mt-4 text-sm leading-7 text-text-secondary">
                  Created {formatDate(payment.createdAt)}{payment.paidAt ? `, paid ${formatDate(payment.paidAt)}` : '.'}
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
                  {payment.status === PAYMENT_STATUSES.FAILED ? (
                    <Button disabled={initiatePayment.isPending} fullWidth onClick={initiate} variant="secondary">
                      {initiatePayment.isPending ? 'Retrying payment...' : 'Retry payment'}
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
