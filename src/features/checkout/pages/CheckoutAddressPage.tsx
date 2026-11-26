import { useEffect } from 'react';
import { MapPin, Pencil, Plus } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

import { routePaths, routes } from '@/constants/routes';
import { useCart } from '@/features/cart/hooks/useCart';
import { CheckoutCarrierSelector } from '@/features/checkout/components/CheckoutCarrierSelector';
import { useCheckoutAddresses, useCheckoutPricing } from '@/features/checkout/hooks/useCheckout';
import { useCheckoutStore } from '@/features/checkout/stores/checkoutStore';
import { CartSummary } from '@/shared/components/commerce/CartSummary';
import { CheckoutStepper } from '@/shared/components/commerce/CheckoutStepper';
import { EmptyState } from '@/shared/components/feedback/EmptyState';
import { ErrorCard } from '@/shared/components/feedback/ErrorCard';
import { LoadingOverlay } from '@/shared/components/feedback/LoadingOverlay';
import { Container } from '@/shared/components/layout/Container';
import { PageSEO } from '@/shared/components/seo/PageSEO';
import { Button } from '@/shared/components/ui/Button';
import { buttonStyles } from '@/shared/components/ui/buttonStyles';
import { formatAddress } from '@/shared/utils/formatAddress';

export const CheckoutAddressPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const cartQuery = useCart();
  const addressesQuery = useCheckoutAddresses();
  const cart = cartQuery.data;
  const {
    carrierOptions,
    carrierSelectionError,
    carrierSelectionRequired,
    carriersQuery,
    previewError,
    previewLoading,
    previewQuery,
    previewValueOverrides,
    selectedCarrier,
    summaryTotals,
  } = useCheckoutPricing(cart);
  const orderPreview = useCheckoutStore((state) => state.orderPreview);
  const selectedAddressId = useCheckoutStore((state) => state.shippingAddressId);
  const selectedCarrierId = useCheckoutStore((state) => state.selectedCarrierId);
  const setCarrierSelectionError = useCheckoutStore((state) => state.setCarrierSelectionError);
  const setOrderPreview = useCheckoutStore((state) => state.setOrderPreview);
  const setSelectedCarrierId = useCheckoutStore((state) => state.setSelectedCarrierId);
  const setShippingAddressId = useCheckoutStore((state) => state.setShippingAddressId);
  const selectedAddressQuery = searchParams.get('selectedAddressId');

  useEffect(() => {
    if (selectedAddressQuery && addressesQuery.data?.some((address) => address.id === selectedAddressQuery)) {
      setShippingAddressId(selectedAddressQuery);
      return;
    }

    if (!selectedAddressId && addressesQuery.data?.length) {
      const defaultAddress = addressesQuery.data.find((address) => address.isDefault) ?? addressesQuery.data[0];
      setShippingAddressId(defaultAddress.id);
    }
  }, [addressesQuery.data, selectedAddressId, selectedAddressQuery, setShippingAddressId]);

  if (cart?.items.length === 0) {
    return (
      <>
        <PageSEO description="Select a shipping address before reviewing payment and voucher details." noIndex path={routes.checkoutAddress} title="Checkout Address" />
        <Container className="py-10">
          <EmptyState
            action={
              <Link className={buttonStyles({})} to={routes.cart}>
                Return to bag
              </Link>
            }
            className="border-border bg-surface px-6 py-16"
            description="Checkout opens once the cart contains at least one valid item."
            title="Your bag is empty."
          />
        </Container>
      </>
    );
  }

  return (
    <>
      <PageSEO description="Choose the customer delivery address for this order." noIndex path={routes.checkoutAddress} title="Checkout Address" />
      <Container className="max-w-6xl space-y-6 py-5 md:space-y-8 md:py-8">
        <CheckoutStepper currentStep="address" />
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-8">
          <section className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-2 md:block md:space-y-2 md:border-b md:border-border md:pb-4">
              <h1 className="flex items-center gap-2 text-base font-semibold uppercase tracking-wide md:text-3xl md:font-medium md:normal-case md:tracking-tight">
                <MapPin aria-hidden="true" className="size-4 md:hidden" />
                <span className="md:hidden">Địa chỉ nhận hàng</span>
                <span className="hidden md:inline">Địa chỉ giao hàng</span>
              </h1>
              {addressesQuery.data ? <p className="text-xs text-text-secondary md:hidden">{addressesQuery.data.length} địa chỉ lưu</p> : null}
              <p className="hidden max-w-2xl text-sm leading-7 text-text-secondary md:block">
                Chọn địa chỉ nhận hàng và đơn vị vận chuyển.
              </p>
            </div>
            {addressesQuery.isLoading || cartQuery.isLoading ? (
              <LoadingOverlay className="min-h-[320px] border-border bg-surface" inline label="Loading checkout data..." />
            ) : null}
            {addressesQuery.isError ? (
              <ErrorCard
                action={<Button onClick={() => void addressesQuery.refetch()}>Try again</Button>}
                className="border-border bg-surface"
                description="The address book could not be loaded from the storefront service."
                title="Address loading failed"
              />
            ) : null}
            <div className="grid gap-4">
              {addressesQuery.data?.map((address) => {
                const selected = address.id === selectedAddressId;

                return (
                  <article
                    className={`rounded-feature border p-4 transition-colors md:rounded-none md:p-6 ${
                      selected ? 'border-brand-primary bg-surface' : 'border-border bg-surface hover:border-text-primary'
                    }`}
                    key={address.id}
                  >
                    <div className="flex flex-col items-start justify-between gap-2 md:flex-row md:gap-5">
                      <button aria-pressed={selected} className="flex min-h-11 flex-1 items-start gap-3 text-left" onClick={() => setShippingAddressId(address.id)} type="button">
                        <span aria-hidden="true" className={`mt-1 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${selected ? 'border-text-primary' : 'border-border'}`}>
                          <span className={`h-2 w-2 rounded-full ${selected ? 'bg-text-primary' : 'bg-transparent'}`} />
                        </span>
                        <div>
                          <div className="flex flex-wrap items-center gap-3">
                            <p className="text-xs font-medium text-text-secondary">{address.label}</p>
                            {address.isDefault ? <span className="rounded-chip bg-brand-subtle px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-brand-primary">Mặc định</span> : null}
                          </div>
                          <h2 className="mt-2 text-base font-semibold leading-snug text-text-primary">{address.receiverName}</h2>
                          <p className="mt-1 text-sm text-text-secondary">{address.phoneNumber}</p>
                          <p className="mt-1 max-w-xl text-sm leading-6 text-text-secondary">{formatAddress(address)}</p>
                        </div>
                      </button>
                      <div className="ml-7 shrink-0 md:ml-0">
                        <Link
                          className="inline-flex min-h-11 items-center gap-1.5 text-xs font-medium text-text-secondary transition-colors hover:text-brand-primary"
                          to={routePaths.profileAddressEdit(address.id, 'checkout')}
                        >
                          <Pencil aria-hidden="true" className="size-3.5" />
                          Chỉnh sửa
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
              <Link
                className="flex min-h-11 items-center justify-center gap-2 rounded-feature bg-surface-muted px-4 text-center text-sm font-medium text-text-primary transition-colors hover:bg-surface-soft md:rounded-none md:border md:border-dashed md:border-border md:bg-transparent md:py-4"
                to={routePaths.profileAddressNew('checkout')}
              >
                <Plus aria-hidden="true" className="size-4" />
                Thêm địa chỉ giao hàng mới
              </Link>
            </div>
            {selectedAddressId ? (
              <CheckoutCarrierSelector
                carrierLoading={carriersQuery.isLoading}
                errorMessage={carriersQuery.isError ? (carriersQuery.error instanceof Error ? carriersQuery.error.message : 'The live carrier list could not be loaded.') : null}
                onChange={(carrierId) => {
                  setCarrierSelectionError(null);
                  setSelectedCarrierId(carrierId);
                  setOrderPreview(null);
                }}
                onRetry={() => void carriersQuery.refetch()}
                onRetryPreview={() => void previewQuery.refetch()}
                options={carrierOptions}
                previewError={previewError}
                previewLoading={previewLoading}
                selectedCarrierId={selectedCarrierId}
                selectionError={carrierSelectionError}
                shippingServiceName={orderPreview?.shippingServiceName ?? null}
              />
            ) : null}
          </section>
          {cart && summaryTotals ? (
            <CartSummary
              description={
                !selectedAddressId
                  ? 'Select an address first, then request a live backend shipping quote.'
                  : carriersQuery.isError
                    ? 'Carrier options failed to load. Retry before relying on shipping totals.'
                    : carrierSelectionError
                      ? carrierSelectionError
                      : carrierSelectionRequired && !selectedCarrierId
                        ? 'Choose a carrier here so checkout can request the live shipping fee before review.'
                        : previewError
                          ? 'The live shipping quote failed. Retry the quote before placing the order.'
                          : orderPreview
                            ? 'Phí vận chuyển được cập nhật theo địa chỉ và đơn vị giao hàng đã chọn.'
                            : 'Waiting for the live backend shipping quote.'
              }
              items={cart.items}
              footer={
                <div className="space-y-3">
                  <Button disabled={!selectedAddressId || cart.staleItemCount > 0} fullWidth onClick={() => navigate(routes.checkoutPayment)} size="lg">
                    Tiếp tục
                  </Button>
                  <Link className={buttonStyles({ fullWidth: true, variant: 'ghost' })} to={routes.cart}>
                    Return to bag
                  </Link>
                </div>
              }
              isTotalsUpdating={previewLoading}
              supplementary={
                <div className="space-y-3 text-sm leading-7 text-text-secondary">
                  <p>Your selected address is stored only for this customer checkout draft.</p>
                  <p>
                    {selectedCarrier
                      ? `${selectedCarrier.name}${orderPreview?.shippingServiceName ? ` / ${orderPreview.shippingServiceName}` : ''}.`
                      : carrierSelectionRequired
                        ? 'Carrier selection is still required for a live shipping quote.'
                        : 'No active carrier is currently available, so preview will fall back to backend shipping fee 0.'}
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

export default CheckoutAddressPage;
