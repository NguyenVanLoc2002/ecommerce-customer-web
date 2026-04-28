import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { routes } from '@/constants/routes';
import { useCart } from '@/features/cart/hooks/useCart';
import { useCheckoutAddresses, usePlaceOrder } from '@/features/checkout/hooks/useCheckout';
import { useCheckoutStore } from '@/features/checkout/stores/checkoutStore';
import { OrderSummaryPanel } from '@/shared/components/commerce/OrderSummaryPanel';
import { CheckoutStepper } from '@/shared/components/commerce/CheckoutStepper';
import { EmptyState } from '@/shared/components/feedback/EmptyState';
import { ErrorCard } from '@/shared/components/feedback/ErrorCard';
import { LoadingOverlay } from '@/shared/components/feedback/LoadingOverlay';
import { Container } from '@/shared/components/layout/Container';
import { PageSEO } from '@/shared/components/seo/PageSEO';
import { Button } from '@/shared/components/ui/Button';
import { buttonStyles } from '@/shared/components/ui/buttonStyles';
import { getPaymentMethodLabel, getPaymentMethodNote } from '@/shared/lib/commerceLabels';
import { useUiStore } from '@/shared/stores/uiStore';
import { formatAddress } from '@/shared/utils/formatAddress';
import { formatMoney } from '@/shared/utils/formatMoney';

const editLinkClassName =
  'text-[11px] font-bold uppercase tracking-[0.18em] text-text-primary underline decoration-border underline-offset-4 transition-colors hover:decoration-text-primary';

export const CheckoutReviewPage = () => {
  const navigate = useNavigate();
  const addToast = useUiStore((state) => state.addToast);
  const cartQuery = useCart();
  const addressesQuery = useCheckoutAddresses();
  const placeOrder = usePlaceOrder();
  const customerNote = useCheckoutStore((state) => state.customerNote);
  const paymentMethod = useCheckoutStore((state) => state.paymentMethod);
  const resetCheckout = useCheckoutStore((state) => state.resetCheckout);
  const setConfirmationOrder = useCheckoutStore((state) => state.setConfirmationOrder);
  const shippingAddressId = useCheckoutStore((state) => state.shippingAddressId);
  const voucherCode = useCheckoutStore((state) => state.voucherCode);
  const voucherPreview = useCheckoutStore((state) => state.voucherPreview);

  const cart = cartQuery.data;
  const address = useMemo(
    () => addressesQuery.data?.find((item) => item.id === shippingAddressId) ?? null,
    [addressesQuery.data, shippingAddressId],
  );

  if (cart?.items.length === 0) {
    return (
      <Container className="py-10">
        <EmptyState
          action={
            <Link className={buttonStyles({})} to={routes.cart}>
              Return to bag
            </Link>
          }
          className="border-border bg-surface px-6 py-16"
          description="Order review requires a valid cart snapshot."
          title="Nothing to review."
        />
      </Container>
    );
  }

  return (
    <>
      <PageSEO description="Review address, payment, voucher preview, and order total before placing the order." noIndex path={routes.checkoutReview} title="Checkout Review" />
      <Container className="space-y-8 py-8 md:space-y-10 md:py-10">
        <CheckoutStepper currentStep="review" />
        <div className="grid gap-10 xl:grid-cols-[minmax(0,1fr)_380px]">
          <section className="space-y-6">
            <div className="space-y-4 border-b border-border pb-8">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-outline">Step 04</p>
              <h1 className="font-display text-[3.25rem] leading-none text-text-primary md:text-[4.25rem]">Review Your Order</h1>
              <p className="max-w-2xl text-sm leading-7 text-text-secondary">
                Confirm each detail before the order is placed and moved into the archive.
              </p>
            </div>
            {cartQuery.isLoading || addressesQuery.isLoading ? (
              <LoadingOverlay className="min-h-[320px] border-border bg-surface" inline label="Preparing order review..." />
            ) : null}
            {!address ? (
              <ErrorCard
                action={<Button onClick={() => navigate(routes.checkoutAddress)}>Choose address</Button>}
                className="border-border bg-surface"
                description="A shipping address is required before the order can be placed."
                title="Address missing"
              />
            ) : null}
            {address ? (
              <div className="space-y-4">
                <section className="border border-border bg-surface px-5 py-5 md:px-6">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-outline">Shipping address</p>
                      <h2 className="mt-3 font-display text-[2rem] leading-none text-text-primary">{address.receiverName}</h2>
                    </div>
                    <button className={editLinkClassName} onClick={() => navigate(routes.checkoutAddress)} type="button">
                      Edit
                    </button>
                  </div>
                  <p className="mt-4 text-sm uppercase tracking-[0.08em] text-text-secondary">{address.phoneNumber}</p>
                  <p className="mt-3 max-w-xl text-sm leading-7 text-text-secondary">{formatAddress(address)}</p>
                </section>

                <section className="border border-border bg-surface px-5 py-5 md:px-6">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-outline">Payment method</p>
                      <h2 className="mt-3 font-display text-[2rem] leading-none text-text-primary">{getPaymentMethodLabel(paymentMethod)}</h2>
                    </div>
                    <button className={editLinkClassName} onClick={() => navigate(routes.checkoutPayment)} type="button">
                      Edit
                    </button>
                  </div>
                  <p className="mt-4 max-w-2xl text-sm leading-7 text-text-secondary">{getPaymentMethodNote(paymentMethod)}</p>
                </section>

                <section className="border border-border bg-surface px-5 py-5 md:px-6">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-outline">Rewards &amp; voucher</p>
                      <h2 className="mt-3 font-display text-[2rem] leading-none text-text-primary">{voucherCode || 'No voucher applied'}</h2>
                    </div>
                    <button className={editLinkClassName} onClick={() => navigate(routes.checkoutVoucher)} type="button">
                      Edit
                    </button>
                  </div>
                  <p className="mt-4 text-sm leading-7 text-text-secondary">
                    {voucherPreview ? voucherPreview.message : 'You can continue without a voucher and still place the order.'}
                  </p>
                </section>

                <section className="border border-border bg-surface px-5 py-5 md:px-6">
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-outline">Order note (optional)</p>
                  <p className="mt-4 text-sm leading-7 text-text-secondary">{customerNote.trim().length > 0 ? customerNote : 'No note provided.'}</p>
                </section>

                <section className="border border-border bg-surface px-5 py-5 md:px-6">
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-outline">Your selection</p>
                  <div className="mt-6 space-y-5">
                    {cart?.items.map((item) => (
                      <article className="grid gap-4 border-b border-border pb-5 last:border-b-0 last:pb-0 md:grid-cols-[104px_minmax(0,1fr)_auto]" key={item.id}>
                        <img
                          alt={item.primaryImage.alt}
                          className="aspect-[4/5] w-full bg-surface-soft object-cover"
                          height={item.primaryImage.height}
                          src={item.primaryImage.src}
                          width={item.primaryImage.width}
                        />
                        <div>
                          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-outline">{item.brandName}</p>
                          <h3 className="mt-3 font-display text-[1.5rem] leading-none text-text-primary">{item.productName}</h3>
                          <p className="mt-3 text-sm uppercase tracking-[0.08em] text-text-secondary">
                            {item.color} / {item.size} / Qty {item.quantity}
                          </p>
                        </div>
                        <p className="text-sm text-text-primary md:text-right">{formatMoney(item.subtotal)}</p>
                      </article>
                    ))}
                  </div>
                </section>
              </div>
            ) : null}
          </section>
          {cart ? (
            <OrderSummaryPanel
              footer={
                <div className="space-y-3">
                  <Button
                    disabled={!address || cart.staleItemCount > 0 || placeOrder.isPending}
                    fullWidth
                    onClick={() =>
                      placeOrder.mutate(
                        {
                          shippingAddressId,
                          paymentMethod,
                          customerNote,
                          voucherCode,
                        },
                        {
                          onSuccess: (order) => {
                            setConfirmationOrder(order);
                            addToast({
                              tone: 'success',
                              title: 'Order placed',
                              description: `${order.code} is now available in your orders list.`,
                            });
                            navigate(routes.checkoutConfirmation);
                          },
                          onError: (error) => {
                            addToast({
                              tone: 'danger',
                              title: 'Order placement failed',
                              description: error instanceof Error ? error.message : 'Try again.',
                            });
                          },
                        },
                      )
                    }
                    size="lg"
                  >
                    {placeOrder.isPending ? 'Placing order...' : 'Place order'}
                  </Button>
                  <Button fullWidth onClick={() => navigate(routes.checkoutVoucher)} variant="ghost">
                    Back to rewards
                  </Button>
                  <Button
                    fullWidth
                    onClick={() => {
                      resetCheckout();
                      navigate(routes.cart);
                    }}
                    variant="ghost"
                  >
                    Start over
                  </Button>
                </div>
              }
              note="Voucher validation is preview-only in this phase, so the grand total remains aligned with the current API contract."
              supplementary={<p className="text-sm leading-7 text-text-secondary">The order is created immediately after placement and moved into the archive.</p>}
              totals={cart}
            />
          ) : null}
        </div>
      </Container>
      {placeOrder.isPending ? <LoadingOverlay label="Placing your order..." /> : null}
    </>
  );
};

export default CheckoutReviewPage;
