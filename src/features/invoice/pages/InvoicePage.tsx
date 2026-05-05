import { ArrowLeft, Copy, Printer } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

import { routePaths } from '@/constants/routes';
import { useInvoiceByOrderId } from '@/features/invoice/hooks/useInvoice';
import { EmptyState } from '@/shared/components/feedback/EmptyState';
import { ErrorCard } from '@/shared/components/feedback/ErrorCard';
import { LoadingOverlay } from '@/shared/components/feedback/LoadingOverlay';
import { Container } from '@/shared/components/layout/Container';
import { PageSEO } from '@/shared/components/seo/PageSEO';
import { Button } from '@/shared/components/ui/Button';
import { buttonStyles } from '@/shared/components/ui/buttonStyles';
import { getPaymentMethodLabel } from '@/shared/lib/commerceLabels';
import { useUiStore } from '@/shared/stores/uiStore';
import { formatAddress } from '@/shared/utils/formatAddress';
import { formatDate } from '@/shared/utils/formatDate';
import { formatMoney } from '@/shared/utils/formatMoney';

const paymentStatusToneClasses: Record<string, string> = {
  PAID: 'border-success/20 bg-success/10 text-success',
  INITIATED: 'border-info/20 bg-info/10 text-info',
  PENDING: 'border-warning/20 bg-warning/10 text-warning',
  FAILED: 'border-danger/20 bg-danger/10 text-danger',
  REFUNDED: 'border-border bg-surface-muted text-text-primary',
  PARTIALLY_REFUNDED: 'border-border bg-surface-muted text-text-primary',
};

export const InvoicePage = () => {
  const { orderId = '' } = useParams();
  const addToast = useUiStore((state) => state.addToast);
  const invoiceQuery = useInvoiceByOrderId(orderId);
  const invoice = invoiceQuery.data;
  const errorCode =
    invoiceQuery.error instanceof Error && 'code' in invoiceQuery.error ? String((invoiceQuery.error as { code?: string }).code) : '';

  const copyInvoiceCode = async () => {
    if (!invoice) {
      return;
    }

    try {
      await navigator.clipboard.writeText(invoice.invoiceCode);
      addToast({
        tone: 'success',
        title: 'Copied',
        description: 'Invoice code copied to clipboard.',
      });
    } catch {
      addToast({
        tone: 'danger',
        title: 'Copy failed',
        description: 'Clipboard access is unavailable in this browser context.',
      });
    }
  };

  return (
    <>
      <PageSEO description="Review and print the customer invoice for this order." noIndex path={routePaths.orderInvoice(orderId || 'order')} title="Invoice" />
      <Container className="space-y-8 pb-16 pt-28 print:space-y-6 print:py-6 md:space-y-10 md:pb-20 md:pt-32">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-8 print:hidden">
          <div>
            <Link className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-text-primary" to={routePaths.orderDetail(orderId)}>
              <ArrowLeft className="h-4 w-4" />
              Back to order
            </Link>
            <p className="mt-6 text-[11px] font-bold uppercase tracking-[0.18em] text-outline">Invoice</p>
            <h1 className="mt-3 font-display text-[3.5rem] leading-none text-text-primary md:text-[4.5rem]">Printable Invoice</h1>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => void copyInvoiceCode()} variant="ghost">
              <Copy className="h-4 w-4" />
              Copy code
            </Button>
            <Button onClick={() => window.print()} variant="secondary">
              <Printer className="h-4 w-4" />
              Print invoice
            </Button>
          </div>
        </div>

        {invoiceQuery.isLoading ? <LoadingOverlay className="min-h-[320px] border-border bg-surface" inline label="Loading invoice..." /> : null}
        {invoiceQuery.isError && errorCode !== 'ORDER_NOT_FOUND' ? (
          <ErrorCard
            action={<Button onClick={() => void invoiceQuery.refetch()}>Retry</Button>}
            className="border-border bg-surface"
            description="The invoice record could not be assembled from the current order source."
            title="Invoice unavailable"
          />
        ) : null}
        {invoiceQuery.isError && errorCode === 'ORDER_NOT_FOUND' ? (
          <EmptyState
            action={
              <Link className={buttonStyles({})} to={routePaths.orderDetail(orderId)}>
                Return to order
              </Link>
            }
            className="border-border bg-surface px-6 py-16"
            description="This order reference could not be matched to your customer archive."
            title="Order not found."
          />
        ) : null}

        {invoice ? (
          <div className="grid gap-10 xl:grid-cols-[minmax(0,1fr)_360px]">
            <section className="space-y-6 border border-border bg-surface px-6 py-8 print:border-0 print:px-0 print:py-0 md:px-8 md:py-10">
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-6">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-outline">AURA Editorial</p>
                  <h2 className="mt-3 font-display text-[2.4rem] leading-none text-text-primary">Invoice {invoice.invoiceCode}</h2>
                  <p className="mt-4 max-w-xl text-sm leading-7 text-text-secondary">
                    Issued {formatDate(invoice.issuedAt)} for order {invoice.orderCode}. Use this document for customer billing and fulfillment reference.
                  </p>
                </div>
                <div className={`inline-flex items-center border px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] ${paymentStatusToneClasses[invoice.paymentStatus] ?? 'border-border bg-surface text-text-primary'}`}>
                  {invoice.paymentStatus.replace(/_/g, ' ')}
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <section>
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-outline">Bill to</p>
                  <h3 className="mt-3 font-display text-[2rem] leading-none text-text-primary">{invoice.shippingAddress.receiverName}</h3>
                  <p className="mt-4 text-sm uppercase tracking-[0.08em] text-text-secondary">{invoice.shippingAddress.phoneNumber}</p>
                  <p className="mt-3 text-sm leading-7 text-text-secondary">{formatAddress(invoice.shippingAddress)}</p>
                </section>
                <section>
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-outline">Payment</p>
                  <h3 className="mt-3 font-display text-[2rem] leading-none text-text-primary">{getPaymentMethodLabel(invoice.paymentMethod)}</h3>
                  <p className="mt-2 text-sm leading-7 text-text-secondary">
                    {invoice.paidAt ? `Paid ${formatDate(invoice.paidAt)}` : 'Payment has not settled yet.'}
                  </p>
                </section>
              </div>

              <section className="border-t border-border pt-6">
                <div className="grid grid-cols-[minmax(0,1.5fr)_auto_auto] gap-4 border-b border-border pb-4 text-[11px] font-bold uppercase tracking-[0.18em] text-outline">
                  <span>Item</span>
                  <span>Qty</span>
                  <span className="text-right">Amount</span>
                </div>
                <div className="space-y-4 pt-4">
                  {invoice.items.map((item) => (
                    <article className="grid grid-cols-[minmax(0,1.5fr)_auto_auto] gap-4 border-b border-border pb-4 last:border-b-0 last:pb-0" key={item.id}>
                      <div>
                        <p className="font-display text-[1.4rem] leading-none text-text-primary">{item.productName}</p>
                        <p className="mt-2 text-sm uppercase tracking-[0.08em] text-text-secondary">
                          {item.color ?? item.variantName ?? 'Default'} / {item.size ?? 'One Size'}
                        </p>
                        <p className="mt-2 text-xs uppercase tracking-[0.16em] text-outline">{item.sku}</p>
                      </div>
                      <span className="text-sm text-text-primary">{item.quantity}</span>
                      <span className="text-right text-sm text-text-primary">{formatMoney(item.lineTotal ?? (item.effectivePrice ?? item.unitPrice) * item.quantity)}</span>
                    </article>
                  ))}
                </div>
              </section>

              <section className="border-t border-border pt-6">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-outline">Invoice note</p>
                <p className="mt-4 text-sm leading-7 text-text-secondary">
                  {invoice.notes.trim().length > 0 ? invoice.notes : 'No invoice note was attached to this order.'}
                </p>
              </section>
            </section>

            <aside className="space-y-4 print:hidden">
              <section className="border border-border bg-surface px-5 py-5 md:px-6">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-outline">Summary</p>
                <div className="mt-6 space-y-4 text-sm text-text-secondary">
                  <div className="flex items-center justify-between gap-4">
                    <span>Subtotal</span>
                    <span className="text-text-primary">{formatMoney(invoice.subTotal)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span>Shipping</span>
                    <span className="text-text-primary">{invoice.shippingFee === 0 ? 'Included' : formatMoney(invoice.shippingFee)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span>Discount</span>
                    <span className="text-text-primary">{invoice.discountTotal === 0 ? '$0' : `-${formatMoney(invoice.discountTotal)}`}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4 border-t border-border pt-4 text-[11px] font-bold uppercase tracking-[0.18em] text-text-primary">
                    <span>Total</span>
                    <span>{formatMoney(invoice.grandTotal)}</span>
                  </div>
                </div>
              </section>

              <section className="border border-border bg-surface px-5 py-5 md:px-6">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-outline">References</p>
                <div className="mt-4 space-y-3 text-sm text-text-secondary">
                  <p>Order code {invoice.orderCode}</p>
                  <p>Invoice code {invoice.invoiceCode}</p>
                  <p>Voucher {invoice.voucherCode ?? 'Not applied'}</p>
                </div>
              </section>

              <Link className={buttonStyles({ fullWidth: true, variant: 'ghost' })} to={routePaths.orderDetail(orderId)}>
                Back to order detail
              </Link>
            </aside>
          </div>
        ) : null}
      </Container>
    </>
  );
};

export default InvoicePage;
