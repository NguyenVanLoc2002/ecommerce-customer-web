import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { routes } from '@/constants/routes';
import { useCart } from '@/features/cart/hooks/useCart';
import { useCheckoutStore } from '@/features/checkout/stores/checkoutStore';
import { CartSummary } from '@/shared/components/commerce/CartSummary';
import { CheckoutStepper } from '@/shared/components/commerce/CheckoutStepper';
import { EmptyState } from '@/shared/components/feedback/EmptyState';
import { LoadingOverlay } from '@/shared/components/feedback/LoadingOverlay';
import { Container } from '@/shared/components/layout/Container';
import { PageSEO } from '@/shared/components/seo/PageSEO';
import { Button } from '@/shared/components/ui/Button';
import { buttonStyles } from '@/shared/components/ui/buttonStyles';
import { Textarea } from '@/shared/components/ui/Textarea';
import { getPaymentMethodLabel, getPaymentMethodNote } from '@/shared/lib/commerceLabels';
import { PAYMENT_METHODS } from '@/shared/types/enums';

const paymentOptions = [
  {
    value: PAYMENT_METHODS.COD,
    title: 'Cash on delivery',
    description: 'Pay when your order arrives. The order remains cancelable until fulfillment begins.',
  },
  {
    value: PAYMENT_METHODS.ONLINE,
    title: 'Online payment',
    description: 'Reserve the order now and complete the payment result flow in the next phase of the product.',
  },
] as const;

export const CheckoutPaymentPage = () => {
  const navigate = useNavigate();
  const cartQuery = useCart();
  const customerNote = useCheckoutStore((state) => state.customerNote);
  const paymentMethod = useCheckoutStore((state) => state.paymentMethod);
  const setCustomerNote = useCheckoutStore((state) => state.setCustomerNote);
  const setPaymentMethod = useCheckoutStore((state) => state.setPaymentMethod);
  const shippingAddressId = useCheckoutStore((state) => state.shippingAddressId);

  useEffect(() => {
    if (!shippingAddressId) {
      navigate(routes.checkoutAddress, { replace: true });
    }
  }, [navigate, shippingAddressId]);

  const cart = cartQuery.data;

  if (cart?.items.length === 0) {
    return (
      <>
        <PageSEO description="Select the payment method and add delivery notes for this order." noIndex path={routes.checkoutPayment} title="Checkout Payment" />
        <Container className="py-10">
          <EmptyState
            action={
              <Link className={buttonStyles({})} to={routes.cart}>
                Return to bag
              </Link>
            }
            className="border-border bg-surface px-6 py-16"
            description="Checkout payment depends on a valid cart and selected shipping address."
            title="Checkout cannot continue."
          />
        </Container>
      </>
    );
  }

  return (
    <>
      <PageSEO description="Select the payment method and add delivery notes for this order." noIndex path={routes.checkoutPayment} title="Checkout Payment" />
      <Container className="space-y-8 py-8 md:space-y-10 md:py-10">
        <CheckoutStepper currentStep="payment" />
        <div className="grid gap-10 xl:grid-cols-[minmax(0,1fr)_380px]">
          <section className="space-y-6">
            <div className="space-y-4 border-b border-border pb-8">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-outline">Step 02</p>
              <h1 className="font-display text-[3.25rem] leading-none text-text-primary md:text-[4.25rem]">Payment Method</h1>
              <p className="max-w-2xl text-sm leading-7 text-text-secondary">
                Choose how you want to complete the order, then add any delivery note that should travel with it.
              </p>
            </div>
            {cartQuery.isLoading ? <LoadingOverlay className="min-h-[320px] border-border bg-surface" inline label="Loading payment options..." /> : null}
            <div className="grid gap-4">
              {paymentOptions.map((option) => {
                const selected = paymentMethod === option.value;

                return (
                  <button
                    className={`border p-5 text-left transition-colors md:p-6 ${
                      selected ? 'border-text-primary bg-surface' : 'border-border bg-surface hover:border-text-primary'
                    }`}
                    key={option.value}
                    onClick={() => setPaymentMethod(option.value)}
                    type="button"
                  >
                    <div className="flex items-start gap-4">
                      <span className={`mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full border ${selected ? 'border-text-primary' : 'border-border'}`}>
                        <span className={`h-2 w-2 rounded-full ${selected ? 'bg-text-primary' : 'bg-transparent'}`} />
                      </span>
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-outline">Payment option</p>
                        <h2 className="mt-3 font-display text-[2rem] leading-none text-text-primary">{option.title}</h2>
                        <p className="mt-3 max-w-2xl text-sm leading-7 text-text-secondary">{option.description}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="border border-border bg-surface px-5 py-5 md:px-6">
              <Textarea
                hint="Optional note saved on the order record."
                label="Delivery note"
                onChange={(event) => setCustomerNote(event.target.value)}
                placeholder="Special delivery instructions or styling timing."
                value={customerNote}
                variant="transaction"
              />
            </div>
          </section>
          {cart ? (
            <CartSummary
              description={getPaymentMethodNote(paymentMethod)}
              eyebrow="Selected payment"
              footer={
                <div className="space-y-3">
                  <Button fullWidth onClick={() => navigate(routes.checkoutVoucher)} size="lg">
                    Continue to rewards
                  </Button>
                  <Button fullWidth onClick={() => navigate(routes.checkoutAddress)} variant="ghost">
                    Back to shipping
                  </Button>
                </div>
              }
              supplementary={<p className="text-sm uppercase tracking-[0.08em] text-text-primary">{getPaymentMethodLabel(paymentMethod)}</p>}
              title="Order value"
              totals={cart}
              variant="checkout"
            />
          ) : null}
        </div>
      </Container>
    </>
  );
};

export default CheckoutPaymentPage;
