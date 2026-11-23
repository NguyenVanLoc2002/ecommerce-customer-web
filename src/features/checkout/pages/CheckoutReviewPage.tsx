import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { routePaths, routes } from '@/constants/routes';
import { useCart } from '@/features/cart/hooks/useCart';
import { CheckoutCarrierSelector } from '@/features/checkout/components/CheckoutCarrierSelector';
import { buildOrderPreviewFromOrder } from '@/features/checkout/lib/checkoutOrder';
import { useCheckoutAddresses, useCheckoutPricing, usePlaceOrder } from '@/features/checkout/hooks/useCheckout';
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
import { getPaymentMethodLabel, getPaymentMethodNote, getPaymentProviderLabel } from '@/shared/lib/commerceLabels';
import { isAuthenticationError } from '@/shared/lib/authErrors';
import {
  isMutationProcessingError,
  isUncertainMutationFailure,
  shouldReuseIdempotencyKey,
} from '@/shared/lib/idempotentMutation';
import { useUiStore } from '@/shared/stores/uiStore';
import { createIdempotencyKey } from '@/shared/utils/createIdempotencyKey';
import { formatAddress } from '@/shared/utils/formatAddress';
import { formatVnd } from '@/shared/utils/formatVnd';
import { PAYMENT_METHODS } from '@/shared/types/enums';
import { PAYMENT_PROVIDERS } from '@/shared/types/payment.types';

const editLinkClassName =
  'text-[11px] font-bold uppercase tracking-[0.18em] text-text-primary underline decoration-border underline-offset-4 transition-colors hover:decoration-text-primary';
const ORDER_STATUS_UNKNOWN_MESSAGE =
  'The order may still be processing. Please check the order status again or try again later.';

type PendingCheckoutAttempt = {
  idempotencyKey: string;
  payloadSignature: string;
};

export const CheckoutReviewPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const addToast = useUiStore((state) => state.addToast);
  const cartQuery = useCart();
  const cart = cartQuery.data;
  const {
    canPreview,
    carrierOptions,
    carrierSelectionError,
    carrierSelectionRequired,
    carriersQuery,
    checkoutPayload,
    previewError,
    previewLoading,
    previewRequestSignature,
    previewQuery,
    previewValueOverrides,
    selectedCarrier,
    summaryTotals,
  } = useCheckoutPricing(cart);
  const addressesQuery = useCheckoutAddresses();
  const placeOrder = usePlaceOrder();
  const customerNote = useCheckoutStore((state) => state.customerNote);
  const orderPreview = useCheckoutStore((state) => state.orderPreview);
  const paymentMethod = useCheckoutStore((state) => state.paymentMethod);
  const paymentProvider = useCheckoutStore((state) => state.paymentProvider);
  const resetCheckout = useCheckoutStore((state) => state.resetCheckout);
  const selectedCarrierId = useCheckoutStore((state) => state.selectedCarrierId);
  const setCarrierSelectionError = useCheckoutStore((state) => state.setCarrierSelectionError);
  const setConfirmationOrder = useCheckoutStore((state) => state.setConfirmationOrder);
  const setOrderPreview = useCheckoutStore((state) => state.setOrderPreview);
  const setSelectedCarrierId = useCheckoutStore((state) => state.setSelectedCarrierId);
  const shippingAddressId = useCheckoutStore((state) => state.shippingAddressId);
  const voucherCode = useCheckoutStore((state) => state.voucherCode);
  const [pendingAttempt, setPendingAttempt] = useState<PendingCheckoutAttempt | null>(null);
  const [submitStage, setSubmitStage] = useState<'placing-order' | null>(null);

  const address = useMemo(
    () => addressesQuery.data?.find((item) => item.id === shippingAddressId) ?? null,
    [addressesQuery.data, shippingAddressId],
  );
  const isPaypalCheckout = paymentMethod === PAYMENT_METHODS.ONLINE && paymentProvider === PAYMENT_PROVIDERS.PAYPAL;
  const previewBlocked = canPreview && !orderPreview;
  const carrierErrorMessage = carriersQuery.error instanceof Error ? carriersQuery.error.message : 'The live carrier list could not be loaded.';
  const placeOrderDisabled =
    !address ||
    !cart ||
    cart.staleItemCount > 0 ||
    placeOrder.isPending ||
    carriersQuery.isLoading ||
    carriersQuery.isError ||
    (carrierSelectionRequired && !selectedCarrierId) ||
    previewLoading ||
    Boolean(previewError) ||
    previewBlocked;

  useEffect(() => {
    if (!pendingAttempt || placeOrder.isPending || pendingAttempt.payloadSignature === previewRequestSignature) {
      return;
    }

    setPendingAttempt(null);
  }, [pendingAttempt, placeOrder.isPending, previewRequestSignature]);

  const handlePlaceOrder = () => {
    if (placeOrderDisabled || !cart) {
      return;
    }

    const idempotencyKey =
      pendingAttempt?.payloadSignature === previewRequestSignature
        ? pendingAttempt.idempotencyKey
        : createIdempotencyKey('checkout');

    setSubmitStage('placing-order');
    setPendingAttempt({
      idempotencyKey,
      payloadSignature: previewRequestSignature,
    });

    placeOrder.mutate(
      {
        payload: checkoutPayload,
        idempotencyKey,
      },
      {
        onSuccess: (order) => {
          setPendingAttempt(null);
          setCarrierSelectionError(null);
          setSelectedCarrierId(order.carrierId ?? '');
          setOrderPreview(buildOrderPreviewFromOrder(order));
          setConfirmationOrder(order);
          if (isPaypalCheckout) {
            setSubmitStage(null);
            navigate(routePaths.paymentResult(order.id, PAYMENT_PROVIDERS.PAYPAL));
            return;
          }

          setSubmitStage(null);
          addToast({
            tone: 'success',
            title: 'Order placed',
            description: `${order.code} is now available in your orders list.`,
          });
          navigate(routes.checkoutConfirmation);
        },
        onError: (error) => {
          setSubmitStage(null);
          if (!shouldReuseIdempotencyKey(error)) {
            setPendingAttempt(null);
          }

          if (isAuthenticationError(error)) {
            addToast({
              tone: 'info',
              title: 'Please sign in to continue',
              description: 'Sign in again to place your order.',
            });
            navigate(routePaths.loginRedirect(location.pathname + location.search));
            return;
          }

          if (isMutationProcessingError(error)) {
            addToast({
              tone: 'info',
              title: 'Order is still processing',
              description: error instanceof Error ? error.message : ORDER_STATUS_UNKNOWN_MESSAGE,
            });
            return;
          }

          if (isUncertainMutationFailure(error)) {
            addToast({
              tone: 'info',
              title: 'Check the order status again',
              description: ORDER_STATUS_UNKNOWN_MESSAGE,
            });
            return;
          }

          addToast({
            tone: 'danger',
            title: 'Order placement failed',
            description: error instanceof Error ? error.message : 'Try again.',
          });
        },
      },
    );
  };

  if (cart?.items.length === 0) {
    return (
      <>
        <PageSEO description="Review address, payment, voucher preview, and order total before placing the order." noIndex path={routes.checkoutReview} title="Checkout Review" />
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
      </>
    );
  }

  return (
    <>
      <PageSEO description="Review address, payment, voucher preview, and order total before placing the order." noIndex path={routes.checkoutReview} title="Checkout Review" />
      <Container className="mx-auto max-w-[1280px] space-y-8 px-5 py-8 md:space-y-10 md:px-12 md:py-12">
        <CheckoutStepper currentStep="review" />
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_380px] xl:gap-14">
          <section className="space-y-6">
            <div className="space-y-4 border-b border-border pb-8">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-secondary">Bước cuối · Xác nhận đơn</p>
              <h1 className="text-3xl font-semibold leading-tight text-text-primary md:text-4xl">Xem lại đơn hàng</h1>
              <p className="max-w-2xl text-sm leading-7 text-text-secondary">
                Kiểm tra thông tin trước khi gửi yêu cầu tạo đơn. Hệ thống sẽ xác minh lại giá, ưu đãi và phí vận chuyển.
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
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-text-secondary">Thông tin giao hàng</p>
                      <h2 className="mt-3 font-display text-[2rem] leading-none text-text-primary">{address.receiverName}</h2>
                    </div>
                    <button className={editLinkClassName} onClick={() => navigate(routes.checkoutAddress)} type="button">
                      Chỉnh sửa
                    </button>
                  </div>
                  <p className="mt-4 text-sm uppercase tracking-[0.08em] text-text-secondary">{address.phoneNumber}</p>
                  <p className="mt-3 max-w-xl text-sm leading-7 text-text-secondary">{formatAddress(address)}</p>
                </section>

                <CheckoutCarrierSelector
                  carrierLoading={carriersQuery.isLoading}
                  errorMessage={carriersQuery.isError ? carrierErrorMessage : null}
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

                <section className="border border-border bg-surface px-5 py-5 md:px-6">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-text-secondary">Phương thức thanh toán</p>
                      <h2 className="mt-3 font-display text-[2rem] leading-none text-text-primary">{getPaymentMethodLabel(paymentMethod)}</h2>
                    </div>
                    <button className={editLinkClassName} onClick={() => navigate(routes.checkoutPayment)} type="button">
                      Thay đổi
                    </button>
                  </div>
                  <p className="mt-4 max-w-2xl text-sm leading-7 text-text-secondary">
                    {getPaymentMethodNote(paymentMethod)}
                    {paymentMethod === PAYMENT_METHODS.ONLINE ? ` Provider: ${getPaymentProviderLabel(paymentProvider)}.` : ''}
                  </p>
                </section>

                <section className="border border-border bg-surface px-5 py-5 md:px-6">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-text-secondary">Mã ưu đãi</p>
                      <h2 className="mt-3 text-xl font-semibold leading-tight text-text-primary">{voucherCode || 'Không dùng mã'}</h2>
                    </div>
                    <button className={editLinkClassName} onClick={() => navigate(routes.checkoutVoucher)} type="button">
                      Thay đổi
                    </button>
                  </div>
                  <p className="mt-4 text-sm leading-7 text-text-secondary">
                    {orderPreview?.voucherCode
                      ? `Báo giá hệ thống đã trừ ${formatVnd(orderPreview.discountAmount)}. Hệ thống sẽ kiểm tra và tính lại khi tạo đơn.`
                      : 'Đơn hàng hiện không áp dụng mã ưu đãi.'}
                  </p>
                </section>

                <section className="border border-border bg-surface px-5 py-5 md:px-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-text-secondary">Ghi chú đơn hàng</p>
                  <p className="mt-4 text-sm leading-7 text-text-secondary">{customerNote.trim().length > 0 ? customerNote : 'Không có ghi chú.'}</p>
                </section>

                <section className="border border-border bg-surface px-5 py-5 md:px-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-text-secondary">Sản phẩm trong đơn</p>
                  <div className="mt-6 space-y-5">
                    {cart?.items.map((item) => (
                      <article className="grid gap-4 border-b border-border pb-5 last:border-b-0 last:pb-0 md:grid-cols-[104px_minmax(0,1fr)_auto]" key={item.id}>
                        <img
                          alt={item.primaryImage.alt}
                          className="aspect-[4/5] w-full bg-surface-soft object-cover"
                          height={item.primaryImage.height}
                          loading="lazy"
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
                        <p className="text-sm font-medium text-text-primary md:text-right">{formatVnd(item.subtotal)}</p>
                      </article>
                    ))}
                  </div>
                </section>
              </div>
            ) : null}
          </section>
          {cart && summaryTotals ? (
            <OrderSummaryPanel
              footer={
                <div className="space-y-3">
                  <Button disabled={placeOrderDisabled} fullWidth onClick={handlePlaceOrder} size="lg">
                    {submitStage === 'placing-order' ? 'Đang tạo đơn…' : 'Đặt hàng'}
                  </Button>
                  <Button fullWidth onClick={() => navigate(routes.checkoutVoucher)} variant="ghost">
                    Quay lại mã ưu đãi
                  </Button>
                  <Button
                    fullWidth
                    onClick={() => {
                      resetCheckout();
                      navigate(routes.cart);
                    }}
                    variant="ghost"
                  >
                    Quay lại giỏ hàng
                  </Button>
                </div>
              }
              isTotalsUpdating={previewLoading}
              note={
                carriersQuery.isError
                  ? 'Carrier options failed to load. Retry before placing the order so shipping totals remain server-sourced.'
                  : carrierSelectionError
                    ? carrierSelectionError
                    : carrierSelectionRequired && !selectedCarrierId
                    ? 'Select one carrier to refresh the live shipping quote and final total.'
                    : previewError
                      ? 'The shipping quote preview failed. Refresh the carrier selection before placing the order.'
                      : orderPreview
                        ? 'Tổng tiền lấy từ POST /orders/preview và sẽ được máy chủ xác minh lại khi tạo đơn.'
                        : 'Đang chờ báo giá từ hệ thống.'
              }
              supplementary={
                <div className="space-y-3 text-sm leading-7 text-text-secondary">
                  <p>
                    {orderPreview?.carrierName
                      ? `${orderPreview.carrierName}${orderPreview.shippingServiceName ? ` / ${orderPreview.shippingServiceName}` : ''}.`
                      : selectedCarrier
                        ? `${selectedCarrier.name}${orderPreview?.shippingServiceName ? ` / ${orderPreview.shippingServiceName}` : ''}.`
                      : carrierSelectionRequired
                        ? 'Choose a carrier to finish the shipping quote preview.'
                        : 'No carrier is currently available for this checkout. Shipping is calculated by the server.'}
                  </p>
                  <p>
                    The order is created immediately after placement and moved into the archive.
                    {isPaypalCheckout ? ' PayPal orders redirect to provider approval immediately after order creation.' : ''}
                  </p>
                </div>
              }
              totals={summaryTotals}
              valueOverrides={previewValueOverrides}
            />
          ) : null}
        </div>
      </Container>
      {submitStage ? <LoadingOverlay label="Creating order..." /> : null}
    </>
  );
};

export default CheckoutReviewPage;
