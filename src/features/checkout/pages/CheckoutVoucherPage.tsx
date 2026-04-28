import { Link, useNavigate } from 'react-router-dom';

import { routes } from '@/constants/routes';
import { useCart } from '@/features/cart/hooks/useCart';
import { VoucherForm } from '@/features/checkout/components/VoucherForm';
import { useValidateVoucher } from '@/features/checkout/hooks/useCheckout';
import { useCheckoutStore } from '@/features/checkout/stores/checkoutStore';
import { CartSummary } from '@/shared/components/commerce/CartSummary';
import { CheckoutStepper } from '@/shared/components/commerce/CheckoutStepper';
import { EmptyState } from '@/shared/components/feedback/EmptyState';
import { LoadingOverlay } from '@/shared/components/feedback/LoadingOverlay';
import { Container } from '@/shared/components/layout/Container';
import { PageSEO } from '@/shared/components/seo/PageSEO';
import { Button } from '@/shared/components/ui/Button';
import { buttonStyles } from '@/shared/components/ui/buttonStyles';
import { useUiStore } from '@/shared/stores/uiStore';
import { formatMoney } from '@/shared/utils/formatMoney';

const sampleOffers = [
  { code: 'FIRSTLOOK', title: 'First order preview', detail: 'Preview a welcoming discount for a first edit.' },
  { code: 'EDITOR25', title: 'Editorial set', detail: 'Preview a larger incentive on higher-value selections.' },
  { code: 'ACCESSORY10', title: 'Accessory pairing', detail: 'Available when an accessory is already in the bag.' },
] as const;

export const CheckoutVoucherPage = () => {
  const navigate = useNavigate();
  const addToast = useUiStore((state) => state.addToast);
  const cartQuery = useCart();
  const validateVoucher = useValidateVoucher();
  const voucherCode = useCheckoutStore((state) => state.voucherCode);
  const voucherPreview = useCheckoutStore((state) => state.voucherPreview);
  const setVoucherCode = useCheckoutStore((state) => state.setVoucherCode);
  const setVoucherPreview = useCheckoutStore((state) => state.setVoucherPreview);

  const cart = cartQuery.data;

  if (cart?.items.length === 0) {
    return (
      <>
        <PageSEO description="Preview voucher eligibility before reviewing the order." noIndex path={routes.checkoutVoucher} title="Checkout Voucher" />
        <Container className="py-10">
          <EmptyState
            action={
              <Link className={buttonStyles({})} to={routes.cart}>
                Return to bag
              </Link>
            }
            className="border-border bg-surface px-6 py-16"
            description="Voucher preview requires a live cart snapshot."
            title="Checkout cannot continue."
          />
        </Container>
      </>
    );
  }

  return (
    <>
      <PageSEO description="Preview voucher eligibility before reviewing the order." noIndex path={routes.checkoutVoucher} title="Checkout Voucher" />
      <Container className="space-y-8 py-8 md:space-y-10 md:py-10">
        <CheckoutStepper currentStep="voucher" />
        <div className="grid gap-10 xl:grid-cols-[minmax(0,1fr)_380px]">
          <section className="space-y-6">
            <div className="space-y-4 border-b border-border pb-8">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-outline">Step 03</p>
              <h1 className="font-display text-[3.25rem] leading-none text-text-primary md:text-[4.25rem]">Apply Rewards &amp; Vouchers</h1>
              <p className="max-w-2xl text-sm leading-7 text-text-secondary">
                Preview voucher eligibility here. The current contract stores the voucher code but does not reduce the order total yet.
              </p>
            </div>
            {cartQuery.isLoading ? <LoadingOverlay className="min-h-[320px] border-border bg-surface" inline label="Loading voucher preview..." /> : null}
            <div className="border border-border bg-surface px-5 py-5 md:px-6">
              <VoucherForm
                defaultValue={voucherCode}
                loading={validateVoucher.isPending}
                onSubmit={(nextVoucherCode) =>
                  validateVoucher.mutate(nextVoucherCode, {
                    onSuccess: (preview) => {
                      setVoucherCode(preview.code);
                      setVoucherPreview(preview);
                      addToast({
                        tone: preview.isApplicable ? 'success' : 'info',
                        title: preview.isApplicable ? 'Voucher preview ready' : 'Voucher preview not applicable',
                        description: preview.message,
                      });
                    },
                    onError: (error) => {
                      setVoucherPreview(null);
                      addToast({
                        tone: 'danger',
                        title: 'Voucher lookup failed',
                        description: error instanceof Error ? error.message : 'Try another code.',
                      });
                    },
                  })
                }
              />
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {sampleOffers.map((offer) => (
                <div className="border border-border bg-surface px-4 py-5" key={offer.code}>
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-outline">{offer.code}</p>
                  <h2 className="mt-3 font-display text-[1.5rem] leading-none text-text-primary">{offer.title}</h2>
                  <p className="mt-3 text-sm leading-7 text-text-secondary">{offer.detail}</p>
                </div>
              ))}
            </div>
            {voucherPreview ? (
              <div className={`border px-5 py-5 md:px-6 ${voucherPreview.isApplicable ? 'border-text-primary bg-surface' : 'border-danger/20 bg-surface'}`}>
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-outline">Applied preview</p>
                    <h2 className="mt-3 font-display text-[2rem] leading-none text-text-primary">{voucherPreview.code}</h2>
                  </div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-text-primary">
                    {voucherPreview.discountAmount > 0 ? `Preview -${formatMoney(voucherPreview.discountAmount)}` : 'Preview $0'}
                  </p>
                </div>
                <p className="mt-4 text-sm leading-7 text-text-secondary">{voucherPreview.message}</p>
                <p className="mt-2 text-sm leading-7 text-text-secondary">{voucherPreview.description}</p>
              </div>
            ) : null}
          </section>
          {cart ? (
            <CartSummary
              description="The current backend stores the selected voucher code but does not apply the discount to totals yet."
              eyebrow="Order value"
              footer={
                <div className="space-y-3">
                  <Button fullWidth onClick={() => navigate(routes.checkoutReview)} size="lg">
                    Continue to review
                  </Button>
                  <Button fullWidth onClick={() => navigate(routes.checkoutPayment)} variant="ghost">
                    Return to payment
                  </Button>
                  <Button fullWidth onClick={() => navigate(routes.checkoutReview)} variant="ghost">
                    Skip this step
                  </Button>
                </div>
              }
              supplementary={<p className="text-sm leading-7 text-text-secondary">Use any preview code above to validate eligibility before you place the order.</p>}
              title="Summary"
              totals={cart}
              variant="checkout"
            />
          ) : null}
        </div>
      </Container>
    </>
  );
};

export default CheckoutVoucherPage;
