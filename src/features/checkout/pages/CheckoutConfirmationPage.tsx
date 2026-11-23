import { formatVnd } from '@/shared/utils/formatVnd';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { routePaths, routes } from '@/constants/routes';
import { useCheckoutStore } from '@/features/checkout/stores/checkoutStore';
import { OrderStatusBadge } from '@/shared/components/commerce/OrderStatusBadge';
import { OrderSummaryPanel } from '@/shared/components/commerce/OrderSummaryPanel';
import { EmptyState } from '@/shared/components/feedback/EmptyState';
import { Container } from '@/shared/components/layout/Container';
import { JsonLd } from '@/shared/components/seo/JsonLd';
import { PageSEO } from '@/shared/components/seo/PageSEO';
import { Button } from '@/shared/components/ui/Button';
import { buttonStyles } from '@/shared/components/ui/buttonStyles';
import { getPaymentMethodLabel, getPaymentProviderLabel } from '@/shared/lib/commerceLabels';
import { useUiStore } from '@/shared/stores/uiStore';
import { ORDER_STATUSES, PAYMENT_METHODS } from '@/shared/types/enums';
import { PAYMENT_PROVIDERS, PAYMENT_STATUSES } from '@/shared/types/payment.types';
import { formatAddress } from '@/shared/utils/formatAddress';
import { formatDate } from '@/shared/utils/formatDate';

export const CheckoutConfirmationPage = () => {
  const navigate = useNavigate();
  const addToast = useUiStore((state) => state.addToast);
  const confirmationOrder = useCheckoutStore((state) => state.confirmationOrder);
  const paymentProvider = useCheckoutStore((state) => state.paymentProvider);
  const resetCheckout = useCheckoutStore((state) => state.resetCheckout);
  const [copied, setCopied] = useState(false);
  const requiresOnlinePayment =
    confirmationOrder?.paymentMethod === PAYMENT_METHODS.ONLINE &&
    confirmationOrder.status === ORDER_STATUSES.AWAITING_PAYMENT &&
    confirmationOrder.paymentStatus !== PAYMENT_STATUSES.PAID;

  if (!confirmationOrder) {
    return (
      <>
        <PageSEO description="Order placed successfully. Review the confirmation details and continue to order history." noIndex path={routes.checkoutConfirmation} title="Order Confirmation" />
        <Container className="mx-auto max-w-5xl px-5 py-10 md:px-12 md:py-14">
          <EmptyState
            action={
              <Link className={buttonStyles({})} to={routes.orders}>
                View orders
              </Link>
            }
            className="border-border bg-surface px-6 py-16"
            description="Đơn hàng sẽ xuất hiện ở đây sau khi hệ thống xác nhận tạo đơn thành công."
            title="Chưa có đơn hàng để xác nhận"
          />
        </Container>
      </>
    );
  }

  const paymentProviderLabel =
    confirmationOrder.paymentMethod === PAYMENT_METHODS.ONLINE ? getPaymentProviderLabel(paymentProvider) : getPaymentMethodLabel(confirmationOrder.paymentMethod);
  const paymentActionLabel =
    paymentProvider === PAYMENT_PROVIDERS.PAYPAL
      ? 'Pay with PayPal'
      : paymentProvider === PAYMENT_PROVIDERS.MOCK
        ? 'Continue to Mock payment'
        : 'Pay with MoMo';

  return (
    <>
      <PageSEO description="Order placed successfully. Review the confirmation details and continue to order history." noIndex path={routes.checkoutConfirmation} title="Order Confirmation" />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Order',
          orderNumber: confirmationOrder.code,
          orderStatus: confirmationOrder.status,
          priceCurrency: 'VND',
          price: confirmationOrder.grandTotal,
          acceptedOffer: confirmationOrder.items.map((item) => ({
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Product',
              name: item.productName,
              image: item.primaryImage.src,
            },
            price: item.unitPrice,
            priceCurrency: 'VND',
            eligibleQuantity: {
              '@type': 'QuantitativeValue',
              value: item.quantity,
            },
          })),
        }}
      />
      <Container className="mx-auto max-w-3xl space-y-6 px-5 py-6 md:py-10">
        <div className="space-y-8">
          <section className="space-y-6">
            <div className="rounded-sm border border-border bg-surface px-6 py-8 text-center md:px-10 md:py-12">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-secondary">Fashion Shop · Xác nhận đơn</p>
              <h1 className="mt-4 text-xl font-semibold tracking-tight text-text-primary md:text-3xl">Đơn hàng đã được tạo thành công</h1>
              <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-text-secondary">
                Đơn {confirmationOrder.code} được tạo lúc {formatDate(confirmationOrder.createdAt)}. Trạng thái hiện tại: {confirmationOrder.status}.
              </p>
              <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                <OrderStatusBadge status={confirmationOrder.status} />
                <button
                  className="border border-border px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-text-primary transition-colors hover:border-text-primary"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(confirmationOrder.code);
                      setCopied(true);
                    } catch {
                      addToast({
                        tone: 'danger',
                        title: 'Copy failed',
                        description: 'Clipboard access is unavailable in this browser context.',
                      });
                    }
                  }}
                  type="button"
                >
                  {copied ? 'Copied' : confirmationOrder.code}
                </button>
              </div>
              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                {requiresOnlinePayment ? (
                  <Button onClick={() => navigate(routePaths.paymentResult(confirmationOrder.id, paymentProvider))} size="lg">
                    {paymentActionLabel}
                  </Button>
                ) : null}
                  <Button onClick={() => navigate(routePaths.orderDetail(confirmationOrder.id))} size="lg">
                  Xem chi tiết đơn hàng
                </Button>
                <Button
                  onClick={() => {
                    resetCheckout();
                    navigate(routes.home);
                  }}
                  size="lg"
                  variant="ghost"
                >
                  Tiếp tục mua sắm
                </Button>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <section className="border border-border bg-surface px-5 py-5 md:px-6">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-text-secondary">Thông tin đơn hàng</p>
                <ul className="mt-4 space-y-3 text-sm leading-7 text-text-secondary">
                  <li>Trạng thái đơn hàng: {confirmationOrder.status}.</li>
                  <li>Phương thức thanh toán: {paymentProviderLabel}.</li>
                  <li>Mã đơn hàng: <span className="font-mono">{confirmationOrder.code}</span>.</li>
                </ul>
              </section>
              <section className="border border-border bg-surface px-5 py-5 md:px-6">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-text-secondary">Thông tin giao hàng</p>
                <h2 className="mt-2 text-base font-semibold text-text-primary">{confirmationOrder.shippingAddress.receiverName}</h2>
                <p className="mt-4 text-sm uppercase tracking-[0.08em] text-text-secondary">{confirmationOrder.shippingAddress.phoneNumber}</p>
                <p className="mt-3 text-sm leading-7 text-text-secondary">{formatAddress(confirmationOrder.shippingAddress)}</p>
              </section>
            </div>

            <section className="border border-border bg-surface px-5 py-5 md:px-6">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-text-secondary">Đơn vị vận chuyển</p>
              <h2 className="mt-2 text-base font-semibold text-text-primary">{confirmationOrder.carrierName ?? 'Carrier not selected'}</h2>
              <p className="mt-4 text-sm leading-7 text-text-secondary">
                {confirmationOrder.carrierName
                  ? `${confirmationOrder.carrierCode ?? confirmationOrder.carrierName}${confirmationOrder.carrierProviderType ? ` / ${confirmationOrder.carrierProviderType}` : ''}.`
                  : 'This order was created without a selected carrier. Shipping follows the server order response.'}
              </p>
            </section>

            <section className="border border-border bg-surface px-5 py-5 md:px-6">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-text-secondary">Sản phẩm trong đơn</p>
              <div className="mt-6 divide-y divide-border">
                {confirmationOrder.items.map((item) => (
                  <div className="grid grid-cols-[56px_minmax(0,1fr)_auto] items-start gap-3 py-3" key={item.id}><img
                    alt={item.primaryImage.alt}
                    className="aspect-[4/5] w-full bg-surface-soft object-cover"
                    height={item.primaryImage.height}
                    loading="lazy"
                    src={item.primaryImage.src}
                    width={item.primaryImage.width}
                  /><div><p className="text-sm font-medium">{item.productName}</p><p className="mt-1 text-xs text-text-secondary">{[item.color, item.size].filter(Boolean).join(' / ')} · SL {item.quantity}</p></div><p className="text-sm">{formatVnd(item.subtotal)}</p></div>
                ))}
              </div>
            </section>
          </section>
          <OrderSummaryPanel
            supplementary={
              <div className="space-y-3 text-sm leading-7 text-text-secondary">
                <p>Mã đơn hàng <span className="font-mono">{confirmationOrder.code}</span>.</p>
                <p>Thanh toán: {getPaymentMethodLabel(confirmationOrder.paymentMethod)} · {confirmationOrder.paymentStatus ?? 'Chưa có trạng thái thanh toán'}.</p>
              </div>
            }
            title="Tóm tắt đơn hàng"
            totals={confirmationOrder}
          />
        </div>
      </Container>
    </>
  );
};

export default CheckoutConfirmationPage;
