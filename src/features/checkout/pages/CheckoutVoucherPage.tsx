import { Link, useNavigate } from 'react-router-dom';

import { routes } from '@/constants/routes';
import { useCart } from '@/features/cart/hooks/useCart';
import { VoucherForm } from '@/features/checkout/components/VoucherForm';
import { useCheckoutPricing } from '@/features/checkout/hooks/useCheckout';
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
import { formatVnd } from '@/shared/utils/formatVnd';

export const CheckoutVoucherPage = () => {
  const navigate = useNavigate();
  const addToast = useUiStore((state) => state.addToast);
  const cartQuery = useCart();
  const cart = cartQuery.data;
  const {
    carrierSelectionError,
    carrierSelectionRequired,
    carriersQuery,
    previewError,
    previewLoading,
    previewValueOverrides,
    selectedCarrier,
    summaryTotals,
  } = useCheckoutPricing(cart);
  const voucherCode = useCheckoutStore((state) => state.voucherCode);
  const orderPreview = useCheckoutStore((state) => state.orderPreview);
  const selectedCarrierId = useCheckoutStore((state) => state.selectedCarrierId);
  const setVoucherCode = useCheckoutStore((state) => state.setVoucherCode);

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
      <Container className="max-w-6xl space-y-6 py-5 md:space-y-8 md:py-8">
        <CheckoutStepper currentStep="voucher" />
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-8">
          <section className="space-y-6">
            <div className="space-y-2 border-b border-border pb-4">
              <h1 className="text-xl font-medium tracking-tight text-text-primary md:text-3xl">Mã giảm giá &amp; Khuyến mãi</h1>
                <p className="max-w-2xl text-sm leading-7 text-text-secondary">
                Nhập mã ưu đãi để kiểm tra mức giảm cho đơn hàng.
              </p>
            </div>
            {cartQuery.isLoading ? <LoadingOverlay className="min-h-[320px] border-border bg-surface" inline label="Loading voucher preview..." /> : null}
            <div className="border border-border bg-surface px-5 py-5 md:px-6">
              <VoucherForm
                defaultValue={voucherCode}
                loading={previewLoading}
                onSubmit={(nextVoucherCode) => {
                  setVoucherCode(nextVoucherCode.trim().toUpperCase());
                  addToast({ tone: 'info', title: 'Checking your code', description: 'The order preview is being recalculated from your cart.' });
                }}
              />
            </div>
            <p className="text-sm leading-6 text-text-secondary">Only a code accepted in the current server order preview is applied. You can continue without a code.</p>
            {voucherCode && orderPreview?.voucherCode ? (
              <div aria-live="polite" className="border border-brand-primary bg-surface px-5 py-5 md:px-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-outline">Server order preview</p>
                    <h2 className="mt-3 text-2xl font-semibold leading-tight text-text-primary">{orderPreview.voucherCode}</h2>
                  </div>
                  <p className="text-sm font-semibold text-text-primary">
                    Discount {formatVnd(orderPreview.discountAmount)}
                  </p>
                </div>
                <p className="mt-4 text-sm leading-7 text-text-secondary">Your cart discount and order total below come from the current server preview.</p>
              </div>
            ) : null}
            {previewError ? <p aria-live="polite" className="border border-danger/30 bg-danger/5 p-4 text-sm text-danger" role="alert">{previewError}</p> : null}
          </section>
          {cart && summaryTotals ? (
            <CartSummary
              description={
                carriersQuery.isError
                  ? 'Carrier options failed to load. Retry the shipping quote before relying on checkout totals.'
                  : carrierSelectionError
                    ? carrierSelectionError
                    : carrierSelectionRequired && !selectedCarrierId
                      ? 'Select a carrier before the backend can confirm shipping totals for this voucher preview.'
                      : previewError
                        ? 'The live shipping quote failed. Retry the quote before placing the order.'
                        : orderPreview
                          ? 'Totals are calculated by the server from your active cart and selected delivery option.'
                          : 'The server will calculate the discount and delivery once your address and carrier are selected.'
              }
              items={cart.items}
              footer={
                <div className="space-y-3">
                  <Button fullWidth onClick={() => navigate(routes.checkoutReview)} size="lg">
                    Xem lại đơn hàng
                  </Button>
                  <Button fullWidth onClick={() => navigate(routes.checkoutPayment)} variant="ghost">
                    Quay lại thanh toán
                  </Button>
                  <Button fullWidth onClick={() => navigate(routes.checkoutReview)} variant="ghost">
                    Tiếp tục không dùng mã
                  </Button>
                </div>
              }
              isTotalsUpdating={previewLoading}
              supplementary={
                <div className="space-y-3 text-sm leading-7 text-text-secondary">
                  <p>Codes are checked against your cart by the order preview. Order placement recalculates and redeems the code.</p>
                  <p>
                    {selectedCarrier
                      ? `${selectedCarrier.name}${orderPreview?.shippingServiceName ? ` / ${orderPreview.shippingServiceName}` : ''}.`
                      : carrierSelectionRequired
                        ? 'Carrier selection is still missing.'
                        : 'No active carrier is available, so backend preview keeps shipping at 0.'}
                  </p>
                </div>
              }
              title="Đơn hàng của bạn"
              totals={summaryTotals}
              valueOverrides={previewValueOverrides}
              variant="checkout"
            />
          ) : null}
        </div>
      </Container>
    </>
  );
};

export default CheckoutVoucherPage;
