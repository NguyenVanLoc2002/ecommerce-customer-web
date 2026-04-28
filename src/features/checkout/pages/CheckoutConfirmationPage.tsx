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
import { getPaymentMethodLabel } from '@/shared/lib/commerceLabels';
import { formatAddress } from '@/shared/utils/formatAddress';
import { formatDate } from '@/shared/utils/formatDate';

export const CheckoutConfirmationPage = () => {
  const navigate = useNavigate();
  const confirmationOrder = useCheckoutStore((state) => state.confirmationOrder);
  const resetCheckout = useCheckoutStore((state) => state.resetCheckout);
  const [copied, setCopied] = useState(false);

  if (!confirmationOrder) {
    return (
      <>
        <PageSEO description="Order placed successfully. Review the confirmation details and continue to order history." noIndex path={routes.checkoutConfirmation} title="Order Confirmation" />
        <Container className="py-10">
          <EmptyState
            action={
              <Link className={buttonStyles({})} to={routes.orders}>
                View orders
              </Link>
            }
            className="border-border bg-surface px-6 py-16"
            description="Place an order from the checkout review step to see confirmation here."
            title="No confirmed order yet."
          />
        </Container>
      </>
    );
  }

  return (
    <>
      <PageSEO description="Order placed successfully. Review the confirmation details and continue to order history." noIndex path={routes.checkoutConfirmation} title="Order Confirmation" />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Order',
          orderNumber: confirmationOrder.code,
          orderStatus: confirmationOrder.status,
          priceCurrency: 'USD',
          price: confirmationOrder.grandTotal,
          acceptedOffer: confirmationOrder.items.map((item) => ({
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Product',
              name: item.productName,
              image: item.primaryImage.src,
            },
            price: item.unitPrice,
            priceCurrency: 'USD',
            eligibleQuantity: {
              '@type': 'QuantitativeValue',
              value: item.quantity,
            },
          })),
        }}
      />
      <Container className="space-y-8 py-8 md:space-y-10 md:py-10">
        <div className="grid gap-10 xl:grid-cols-[minmax(0,1fr)_380px]">
          <section className="space-y-6">
            <div className="border border-border bg-surface px-6 py-8 md:px-8 md:py-10">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-outline">Order confirmed</p>
              <h1 className="mt-4 font-display text-[3.5rem] leading-none text-text-primary md:text-[4.75rem]">Order Confirmed.</h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-text-secondary">
                Created {formatDate(confirmationOrder.createdAt)} with {getPaymentMethodLabel(confirmationOrder.paymentMethod)}. Your archive has been updated.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <OrderStatusBadge status={confirmationOrder.status} />
                <button
                  className="border border-border px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-text-primary transition-colors hover:border-text-primary"
                  onClick={async () => {
                    await navigator.clipboard.writeText(confirmationOrder.code);
                    setCopied(true);
                  }}
                  type="button"
                >
                  {copied ? 'Copied' : confirmationOrder.code}
                </button>
              </div>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button onClick={() => navigate(routePaths.orderDetail(confirmationOrder.id))} size="lg">
                  View full order
                </Button>
                <Button
                  onClick={() => {
                    resetCheckout();
                    navigate(routes.home);
                  }}
                  size="lg"
                  variant="ghost"
                >
                  Continue exploring
                </Button>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <section className="border border-border bg-surface px-5 py-5 md:px-6">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-outline">Next steps</p>
                <ul className="mt-4 space-y-3 text-sm leading-7 text-text-secondary">
                  <li>Your order is now available in the archive.</li>
                  <li>Tracking, invoice, and payment-result routes continue in later phases.</li>
                  <li>You can return to the archive at any time from the storefront navigation.</li>
                </ul>
              </section>
              <section className="border border-border bg-surface px-5 py-5 md:px-6">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-outline">Delivery address</p>
                <h2 className="mt-3 font-display text-[2rem] leading-none text-text-primary">{confirmationOrder.shippingAddress.receiverName}</h2>
                <p className="mt-4 text-sm uppercase tracking-[0.08em] text-text-secondary">{confirmationOrder.shippingAddress.phoneNumber}</p>
                <p className="mt-3 text-sm leading-7 text-text-secondary">{formatAddress(confirmationOrder.shippingAddress)}</p>
              </section>
            </div>

            <section className="border border-border bg-surface px-5 py-5 md:px-6">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-outline">Your selection</p>
              <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
                {confirmationOrder.items.map((item) => (
                  <img
                    alt={item.primaryImage.alt}
                    className="aspect-[4/5] w-full bg-surface-soft object-cover"
                    height={item.primaryImage.height}
                    key={item.id}
                    loading="lazy"
                    src={item.primaryImage.src}
                    width={item.primaryImage.width}
                  />
                ))}
              </div>
            </section>
          </section>
          <OrderSummaryPanel
            supplementary={<p className="text-sm leading-7 text-text-secondary">Order code {confirmationOrder.code} is now active in your archive.</p>}
            totals={confirmationOrder}
          />
        </div>
      </Container>
    </>
  );
};

export default CheckoutConfirmationPage;
