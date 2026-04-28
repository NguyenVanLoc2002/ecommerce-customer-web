import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { routes } from '@/constants/routes';
import { StaleCartBanner } from '@/features/cart/components/StaleCartBanner';
import { useCart, useClearCart, useRemoveCartItem, useUpdateCartItemQuantity } from '@/features/cart/hooks/useCart';
import { CartItemCard } from '@/shared/components/commerce/CartItemCard';
import { CartSummary } from '@/shared/components/commerce/CartSummary';
import { EmptyState } from '@/shared/components/feedback/EmptyState';
import { ErrorCard } from '@/shared/components/feedback/ErrorCard';
import { LoadingOverlay } from '@/shared/components/feedback/LoadingOverlay';
import { Container } from '@/shared/components/layout/Container';
import { ConfirmDialog } from '@/shared/components/overlays/ConfirmDialog';
import { PageSEO } from '@/shared/components/seo/PageSEO';
import { Button } from '@/shared/components/ui/Button';
import { buttonStyles } from '@/shared/components/ui/buttonStyles';
import { useUiStore } from '@/shared/stores/uiStore';

export const CartPage = () => {
  const navigate = useNavigate();
  const addToast = useUiStore((state) => state.addToast);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const cartQuery = useCart();
  const updateQuantity = useUpdateCartItemQuantity();
  const removeItem = useRemoveCartItem();
  const clearCart = useClearCart();

  const cart = cartQuery.data;

  return (
    <>
      <PageSEO description="Review items, resolve stock changes, and continue into the checkout flow." noIndex path={routes.cart} title="Cart" />
      <Container className="space-y-8 pb-16 pt-28 md:space-y-10 md:pb-20 md:pt-32">
        <div className="flex flex-col gap-4 border-b border-border pb-8 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-outline">Maison cart</p>
            <h1 className="mt-3 font-display text-[3.5rem] leading-none text-text-primary md:text-[4.5rem]">Bag</h1>
            <p className="mt-3 text-sm uppercase tracking-[0.12em] text-text-secondary">
              {cart?.totalItems ?? 0} item{cart?.totalItems === 1 ? '' : 's'} selected
            </p>
          </div>
          {cart && cart.items.length > 0 ? (
            <button
              className="text-left text-[11px] font-bold uppercase tracking-[0.18em] text-text-secondary underline decoration-border underline-offset-4 transition-colors hover:text-text-primary hover:decoration-text-primary"
              onClick={() => setConfirmOpen(true)}
              type="button"
            >
              Clear bag
            </button>
          ) : null}
        </div>

        {cartQuery.isLoading ? <LoadingOverlay className="min-h-[320px] border-border bg-surface-muted/55" inline label="Loading your bag..." /> : null}
        {cartQuery.isError ? (
          <ErrorCard
            action={<Button onClick={() => void cartQuery.refetch()}>Try again</Button>}
            className="border-border bg-surface"
            description="The current cart could not be loaded from the mock commerce state."
            title="Bag loading failed"
          />
        ) : null}
        {cart && cart.items.length === 0 ? (
          <EmptyState
            action={
              <Link className={buttonStyles({})} to={routes.products}>
                Continue exploring
              </Link>
            }
            className="border-border bg-surface px-6 py-16"
            description="Curate your next edit from the collection and return here when you're ready to review it."
            title="Your bag is empty."
          />
        ) : null}
        {cart && cart.items.length > 0 ? (
          <div className="grid gap-10 xl:grid-cols-[minmax(0,1fr)_380px]">
            <section className="space-y-6">
              {cart.staleItemCount > 0 ? <StaleCartBanner count={cart.staleItemCount} /> : null}
              <div className="space-y-6">
                {cart.items.map((item) => (
                  <CartItemCard
                    item={item}
                    key={item.id}
                    onQuantityChange={(quantity) => {
                      updateQuantity.mutate(
                        { itemId: item.id, quantity },
                        {
                          onError: (error) => {
                            addToast({
                              tone: 'danger',
                              title: 'Quantity update failed',
                              description: error instanceof Error ? error.message : 'Try again.',
                            });
                          },
                        },
                      );
                    }}
                    onRemove={() =>
                      removeItem.mutate(item.id, {
                        onSuccess: () => {
                          addToast({
                            tone: 'success',
                            title: 'Item removed',
                            description: `${item.productName} was removed from the bag.`,
                          });
                        },
                      })
                    }
                    updating={updateQuantity.isPending || removeItem.isPending}
                  />
                ))}
              </div>
            </section>
            <CartSummary
              description="Shipping and taxes are finalized during checkout review."
              eyebrow="Summary"
              footer={
                <div className="space-y-3">
                  <Button
                    disabled={cart.staleItemCount > 0}
                    fullWidth
                    onClick={() => navigate(routes.checkoutAddress)}
                    size="lg"
                  >
                    Proceed to payment
                  </Button>
                  <Button
                    className="border-border text-text-primary hover:border-text-primary hover:bg-surface-soft"
                    fullWidth
                    onClick={() => navigate(routes.checkoutAddress)}
                    size="lg"
                    variant="secondary"
                  >
                    Pay with Apple Pay
                  </Button>
                  <Link className={buttonStyles({ fullWidth: true, variant: 'ghost' })} to={routes.products}>
                    Continue exploring
                  </Link>
                </div>
              }
              supplementary={
                <div className="space-y-4 text-sm text-text-secondary">
                  <div className="flex items-start justify-between gap-4">
                    <span className="uppercase tracking-[0.12em]">Signature packaging</span>
                    <span className="text-text-primary">Included</span>
                  </div>
                  <div className="flex items-start justify-between gap-4">
                    <span className="uppercase tracking-[0.12em]">Voucher preview</span>
                    <span className="text-text-primary">Apply in checkout</span>
                  </div>
                </div>
              }
              title="Order value"
              totals={cart}
              variant="cart"
            />
          </div>
        ) : null}
      </Container>
      <ConfirmDialog
        cancelLabel="Keep bag"
        confirmLabel={clearCart.isPending ? 'Clearing...' : 'Clear bag'}
        description="This removes every item from the current cart snapshot."
        onClose={() => setConfirmOpen(false)}
        onConfirm={() =>
          clearCart.mutate(undefined, {
            onSuccess: () => {
              setConfirmOpen(false);
              addToast({
                tone: 'success',
                title: 'Bag cleared',
                description: 'Your bag is ready for a new edit.',
              });
            },
          })
        }
        open={confirmOpen}
        title="Clear this bag?"
      />
    </>
  );
};

export default CartPage;
