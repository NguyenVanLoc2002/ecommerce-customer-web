import { Copy, Printer } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

import { routePaths, routes } from '@/constants/routes';
import { useInvoiceByOrderId } from '@/features/invoice/hooks/useInvoice';
import { EmptyState } from '@/shared/components/feedback/EmptyState';
import { ErrorCard } from '@/shared/components/feedback/ErrorCard';
import { LoadingOverlay } from '@/shared/components/feedback/LoadingOverlay';
import { BreadcrumbNav } from '@/shared/components/layout/BreadcrumbNav';
import { Container } from '@/shared/components/layout/Container';
import { PageSEO } from '@/shared/components/seo/PageSEO';
import { Button } from '@/shared/components/ui/Button';
import { buttonStyles } from '@/shared/components/ui/buttonStyles';
import { getPaymentMethodLabel } from '@/shared/lib/commerceLabels';
import { useUiStore } from '@/shared/stores/uiStore';
import { formatAddress } from '@/shared/utils/formatAddress';
import { formatDate } from '@/shared/utils/formatDate';
import { formatVnd } from '@/shared/utils/formatVnd';

export const InvoicePage = () => {
  const { orderId = formatVnd(0) } = useParams();
  const addToast = useUiStore((state) => state.addToast);
  const invoiceQuery = useInvoiceByOrderId(orderId);
  const invoice = invoiceQuery.data;
  const errorCode =
    invoiceQuery.error instanceof Error && 'code' in invoiceQuery.error ? String((invoiceQuery.error as { code?: string }).code) : formatVnd(0);

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
        <div className="print:hidden">
          <BreadcrumbNav items={[
            { label: 'Trang chủ', href: routes.home },
            { label: 'Đơn hàng', href: routes.orders },
            { label: invoice?.orderCode ?? 'Chi tiết đơn', href: routePaths.orderDetail(orderId) },
            { label: 'Hóa đơn' },
          ]} />
        </div>
        <header className="flex flex-wrap items-center justify-between gap-5 rounded-lg bg-surface p-5 shadow-sm print:hidden md:p-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Hóa đơn</h1>
            <p className="mt-2 text-sm text-text-secondary">Xem và in hóa đơn đã phát hành cho đơn hàng.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button disabled={!invoice} onClick={() => void copyInvoiceCode()} variant="ghost">
              <Copy className="h-4 w-4" />
              Sao chép mã
            </Button>
            <Button disabled={!invoice} onClick={() => window.print()} variant="secondary">
              <Printer className="h-4 w-4" />
              In hóa đơn
            </Button>
          </div>
        </header>

        {invoiceQuery.isLoading ? <LoadingOverlay className="min-h-[320px] border-border bg-surface" inline label="Loading invoice..." /> : null}
        {invoiceQuery.isError && errorCode === 'INVOICE_NOT_FOUND' ? (
          <EmptyState
            action={
              <Link className={buttonStyles({})} to={routePaths.orderDetail(orderId)}>
                Return to order
              </Link>
            }
            className="border-border bg-surface px-6 py-16"
            description="An invoice has not been issued for this order yet. Check again after payment has been collected."
            title="Invoice not issued yet"
          />
        ) : null}
        {invoiceQuery.isError && errorCode !== 'ORDER_NOT_FOUND' && errorCode !== 'INVOICE_NOT_FOUND' ? (
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
          <div className="grid items-start gap-8 lg:grid-cols-12 print:block">
            <article className="min-w-0 space-y-7 rounded-lg bg-surface p-5 shadow-sm md:p-8 lg:col-span-8 lg:p-12 print:p-0 print:shadow-none">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-5">
                <p className="text-base font-bold uppercase tracking-widest">Fashion Shop</p>
                <p className="rounded bg-surface-muted px-3 py-1 text-xs font-medium">{invoice.status.replace(/_/g, ' ')}</p>
              </div>
              <div className="space-y-2 py-4 text-center md:py-6">
                <h2 className="break-words text-xl font-bold uppercase tracking-wide">Hóa đơn {invoice.invoiceCode}</h2>
                <p className="text-sm text-text-secondary">Phát hành ngày {formatDate(invoice.issuedAt)}</p>
              </div>
              <dl className="grid gap-4 rounded bg-surface-soft p-4 text-sm sm:grid-cols-3">
                <div><dt className="text-text-secondary">Mã hóa đơn</dt><dd className="mt-1 break-words font-mono font-semibold">{invoice.invoiceCode}</dd></div>
                <div><dt className="text-text-secondary">Mã đơn hàng</dt><dd className="mt-1 break-words font-mono font-semibold">{invoice.orderCode}</dd></div>
                <div><dt className="text-text-secondary">Tiền tệ</dt><dd className="mt-1 font-semibold">Đồng Việt Nam (VND)</dd></div>
              </dl>
              <div className="grid gap-4 sm:grid-cols-2">
                <section className="rounded bg-surface-muted p-4 md:p-5">
                  <h3 className="text-xs font-bold uppercase tracking-wide text-text-secondary">Thông tin người mua</h3>
                  <p className="mt-2 font-semibold">{invoice.shippingAddress.receiverName}</p>
                  <p className="mt-2 text-sm text-text-secondary">{invoice.shippingAddress.phoneNumber}</p>
                  <p className="mt-2 break-words text-sm text-text-secondary">{formatAddress(invoice.shippingAddress)}</p>
                </section>
                <section className="rounded bg-surface-muted p-4 md:p-5">
                  <h3 className="text-xs font-bold uppercase tracking-wide text-text-secondary">Thanh toán</h3>
                  <p className="mt-2 font-semibold">{getPaymentMethodLabel(invoice.paymentMethod)}</p>
                  {invoice.paidAt ? <p className="mt-2 text-sm text-text-secondary">Thanh toán ngày {formatDate(invoice.paidAt)}</p> : null}
                </section>
              </div>
              <table className="w-full table-fixed text-left text-sm">
                <thead className="bg-surface-muted text-xs uppercase tracking-wide text-text-secondary">
                  <tr>
                    <th className="px-2 py-3 sm:px-3" scope="col">Sản phẩm</th>
                    <th className="w-10 py-3 text-center sm:w-14" scope="col">SL</th>
                    <th className="w-[34%] px-2 py-3 text-right sm:px-3" scope="col">Thành tiền</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {invoice.items.map((item) => (
                    <tr key={item.id}>
                      <td className="break-words px-2 py-3 sm:px-3">
                        <span className="block font-semibold">{item.productName}</span>
                        <span className="block text-xs text-text-secondary">{item.variantName} · {item.sku}</span>
                      </td>
                      <td className="text-center">{item.quantity}</td>
                      <td className="break-words px-2 text-right font-medium sm:px-3">{formatVnd(item.lineTotal ?? (item.effectivePrice ?? item.unitPrice) * item.quantity)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <dl className="ml-auto max-w-sm space-y-3 rounded bg-surface-muted p-4 text-sm md:p-5">
                <div className="flex justify-between gap-3"><dt>Tạm tính</dt><dd>{formatVnd(invoice.subTotal)}</dd></div>
                <div className="flex justify-between gap-3"><dt>Vận chuyển</dt><dd>{formatVnd(invoice.shippingFee)}</dd></div>
                <div className="flex justify-between gap-3"><dt>Giảm giá</dt><dd>{formatVnd(invoice.discountTotal ? -invoice.discountTotal : 0)}</dd></div>
                <div className="flex justify-between gap-3 border-t border-border pt-3 font-bold"><dt>Tổng thanh toán</dt><dd>{formatVnd(invoice.grandTotal)}</dd></div>
              </dl>
              {invoice.notes.trim() ? <p className="whitespace-pre-wrap break-words rounded bg-surface-soft p-4 text-sm">{invoice.notes}</p> : null}
            </article>
            <aside className="min-w-0 rounded-lg bg-surface p-5 shadow-sm md:p-6 lg:col-span-4 print:hidden">
              <h2 className="text-sm font-bold uppercase tracking-wide">Thông tin tham chiếu</h2>
              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between gap-3 rounded bg-surface-soft p-3"><dt>Mã đơn</dt><dd className="break-all font-medium">{invoice.orderCode}</dd></div>
                <div className="flex justify-between gap-3 rounded bg-surface-soft p-3"><dt>Trạng thái hóa đơn</dt><dd className="font-medium">{invoice.status.replace(/_/g, ' ')}</dd></div>
                {invoice.voucherCode ? <div className="flex justify-between gap-3 rounded bg-surface-soft p-3"><dt>Mã ưu đãi</dt><dd className="break-all font-medium">{invoice.voucherCode}</dd></div> : null}
              </dl>
            </aside>
          </div>
        ) : null}
      </Container>
    </>
  );
};

export default InvoicePage;
