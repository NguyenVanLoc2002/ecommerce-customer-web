import { useEffect } from 'react';
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
      <Container className="space-y-8 py-8 md:space-y-10 md:py-10">
        <CheckoutStepper currentStep="address" />
        <div className="grid gap-10 xl:grid-cols-[minmax(0,1fr)_380px]">
          <section className="space-y-6">
            <div className="space-y-4 border-b border-border pb-8">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-outline">Step 01</p>
              <h1 className="font-display text-[3.25rem] leading-none text-text-primary md:text-[4.25rem]">Shipping Destination</h1>
              <p className="max-w-2xl text-sm leading-7 text-text-secondary">
                Select the address for delivery before continuing through the secure checkout flow.
              </p>
            </div>
            {addressesQuery.isLoading || cartQuery.isLoading ? (
              <LoadingOverlay className="min-h-[320px] border-border bg-surface" inline label="Loading checkout data..." />
            ) : null}
            {addressesQuery.isError ? (
              <ErrorCard
                action={<Button onClick={() => void addressesQuery.refetch()}>Try again</Button>}
                className="border-border bg-surface"
                description="The mock address book could not be loaded."
                title="Address loading failed"
              />
            ) : null}
            <div className="grid gap-4">
              {addressesQuery.data?.map((address) => {
                const selected = address.id === selectedAddressId;

                return (
                  <article
                    className={`border p-5 transition-colors md:p-6 ${
                      selected ? 'border-text-primary bg-surface' : 'border-border bg-surface hover:border-text-primary'
                    }`}
                    key={address.id}
                  >
                    <div className="flex items-start justify-between gap-5">
                      <button className="flex flex-1 items-start gap-4 text-left" onClick={() => setShippingAddressId(address.id)} type="button">
                        <span className={`mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full border ${selected ? 'border-text-primary' : 'border-border'}`}>
                          <span className={`h-2 w-2 rounded-full ${selected ? 'bg-text-primary' : 'bg-transparent'}`} />
                        </span>
                        <div>
                          <div className="flex flex-wrap items-center gap-3">
                            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-outline">{address.label}</p>
                            {address.isDefault ? <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-text-primary">Default</span> : null}
                          </div>
                          <h2 className="mt-3 font-display text-[2rem] leading-none text-text-primary">{address.receiverName}</h2>
                          <p className="mt-3 text-sm uppercase tracking-[0.08em] text-text-secondary">{address.phoneNumber}</p>
                          <p className="mt-3 max-w-xl text-sm leading-7 text-text-secondary">{formatAddress(address)}</p>
                        </div>
                      </button>
                      <div className="hidden shrink-0 md:flex">
                        <Link
                          className="text-[11px] font-bold uppercase tracking-[0.18em] text-outline transition-colors hover:text-text-primary"
                          to={routePaths.profileAddressEdit(address.id, 'checkout')}
                        >
                          Edit address
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
              <Link
                className="flex min-h-[132px] items-center justify-center border border-dashed border-border px-5 py-8 text-center text-[11px] font-bold uppercase tracking-[0.22em] text-text-primary transition-colors hover:border-text-primary"
                to={routePaths.profileAddressNew('checkout')}
              >
                Add new address
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
                            ? 'Live totals now come from POST /orders/preview and will refresh when the cart, address, voucher, or carrier changes.'
                            : 'Waiting for the live backend shipping quote.'
              }
              eyebrow="Secure checkout"
              footer={
                <div className="space-y-3">
                  <Button disabled={!selectedAddressId || cart.staleItemCount > 0} fullWidth onClick={() => navigate(routes.checkoutPayment)} size="lg">
                    Continue to payment
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
              title="Order value"
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
