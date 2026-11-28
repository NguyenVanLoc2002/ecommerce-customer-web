import { useState } from 'react';
import { ArrowLeft, ShoppingBag, Truck } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { routePaths, routes } from '@/constants/routes';
import { isCartStockConflict } from '@/features/cart/lib/cartErrors';
import { CartVoucher } from '@/features/cart/components/CartVoucher';
import { useCartVoucher } from '@/features/cart/hooks/useCartVoucher';
import { StaleCartBanner } from '@/features/cart/components/StaleCartBanner';
import { useCart, useClearCart, useRemoveCartItem, useUpdateCartItemQuantity } from '@/features/cart/hooks/useCart';
import { CartItemCard } from '@/shared/components/commerce/CartItemCard';
import { ShoppingBagSummary } from '@/features/cart/components/ShoppingBagSummary';
import { ErrorCard } from '@/shared/components/feedback/ErrorCard';
import { CartSkeleton } from '@/features/cart/components/CartSkeleton';
import { Container } from '@/shared/components/layout/Container';
import { ConfirmDialog } from '@/shared/components/overlays/ConfirmDialog';
import { PageSEO } from '@/shared/components/seo/PageSEO';
import { Button } from '@/shared/components/ui/Button';
import { buttonStyles } from '@/shared/components/ui/buttonStyles';
import { isAuthenticationError } from '@/shared/lib/authErrors';
import { useUiStore } from '@/shared/stores/uiStore';

export const CartPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const addToast = useUiStore((state) => state.addToast);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const cartQuery = useCart();
  const updateQuantity = useUpdateCartItemQuantity();
  const removeItem = useRemoveCartItem();
  const clearCart = useClearCart();

  const cart = cartQuery.data;
  const mutationPending = updateQuantity.isPending || removeItem.isPending || clearCart.isPending || cartQuery.isFetching;

  const voucher = useCartVoucher(cart, mutationPending);
  const freeShipping = voucher.checking ? undefined : voucher.preview?.freeShipping ?? cart?.freeShipping;

  const handleMutationError = (error: unknown, title: string) => {
    if (isAuthenticationError(error)) {
      addToast({
        tone: 'info',
        title: 'Phiên đăng nhập đã hết hạn',
        description: 'Đăng nhập lại để tiếp tục cập nhật giỏ hàng.',
      });
      navigate(routePaths.loginRedirect(location.pathname + location.search));
      return;
    }

    addToast({
      tone: 'danger',
      title,
      description: error instanceof Error ? error.message : 'Vui lòng thử lại.',
    });
  };

  return (
    <>
      <PageSEO description="Xem lại sản phẩm và biến thể trong giỏ hàng trước khi tiếp tục thanh toán." noIndex path={routes.cart} title="Giỏ hàng" />
      <Container className="space-y-4 pb-14 pt-[72px] lg:space-y-12 lg:pb-20 lg:pt-32">
        <header className="lg:border-b lg:border-border lg:pb-6">
          <div>
            <nav aria-label="Breadcrumb" className="mb-3 flex flex-wrap items-baseline gap-x-2 gap-y-1 text-[13px] text-text-secondary">
              <Link className="hover:text-text-primary hover:underline" to={routes.home}>Trang chủ</Link>
              <span aria-hidden="true" className="text-outline">/</span>
              <span aria-current="page" className="font-semibold text-text-primary">Giỏ hàng</span>
              {cart ? <span aria-hidden="true" className="ml-1 lg:hidden">({cart.totalItems} sản phẩm)</span> : null}
            </nav>
            <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
              <h1 className="text-xl font-bold leading-tight text-text-primary lg:text-[30px] lg:font-normal">Túi đồ của bạn</h1>
              {freeShipping?.enabled && freeShipping.qualified ? (
                <span className="ml-auto inline-flex items-center gap-1 rounded bg-brand-subtle px-2 py-1 text-xs font-medium text-text-secondary lg:hidden">
                  <Truck aria-hidden="true" className="size-3.5" /> Miễn phí vận chuyển
                </span>
              ) : null}
              {cart || cartQuery.isLoading ? (
                <p aria-live="polite" className="sr-only text-text-secondary lg:not-sr-only lg:text-base">
                  ({cart ? `${cart.totalItems} sản phẩm` : 'Đang tải…'})
                </p>
              ) : null}
            </div>
          </div>
        </header>

        {cartQuery.isLoading ? <CartSkeleton /> : null}
        {cartQuery.isError ? (
          <ErrorCard
            action={<Button onClick={() => void cartQuery.refetch()}>Thử tải lại</Button>}
            className="border-border bg-surface"
            description="Không thể tải giỏ hàng lúc này. Vui lòng thử lại."
            title="Tải giỏ hàng không thành công"
          />
        ) : null}
        {cart && cart.items.length === 0 ? (
          <section className="rounded-feature bg-surface px-6 py-14 text-center shadow-subtle lg:rounded-chip lg:py-16">
            <span className="mx-auto grid size-12 place-items-center rounded-full bg-[rgb(var(--discovery-panel))] text-text-secondary">
              <ShoppingBag aria-hidden="true" className="size-6" />
            </span>
            <h2 className="mt-4 text-base font-semibold">Túi đồ của bạn đang trống</h2>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-text-secondary">
              Hãy khám phá bộ sưu tập mới nhất để tìm trang phục phù hợp.
            </p>
            <Link className={buttonStyles({ variant: 'ghost', className: 'mt-4 border-border uppercase' })} to={routes.products}>
              Khám phá bộ sưu tập
            </Link>
          </section>
        ) : null}

        {cart && cart.items.length > 0 ? (
          <div className="grid items-start gap-3 lg:grid-cols-[minmax(0,2.16fr)_minmax(320px,1fr)] lg:gap-x-14 lg:gap-y-8">
            <section aria-label="Sản phẩm trong giỏ hàng" className="min-w-0 space-y-3 lg:col-start-1 lg:row-start-1 lg:space-y-8">
              {cart.staleItemCount > 0 ? <StaleCartBanner count={cart.staleItemCount} /> : null}
              <div className="space-y-3 lg:space-y-8">
                {cart.items.map((item) => (
                  <CartItemCard
                    item={item}
                    key={item.id}
                    onQuantityChange={(quantity) => {
                      updateQuantity.mutate(
                        { itemId: item.id, quantity },
                        {
                          onSuccess: () => {
                            addToast({
                              tone: 'success',
                              title: 'Đã cập nhật số lượng',
                              description: item.productName,
                            });
                          },
                          onError: (error) => {
                            if (isCartStockConflict(error)) {
                              void cartQuery.refetch();
                            }
                            handleMutationError(error, 'Không thể cập nhật số lượng');
                          },
                        },
                      );
                    }}
                    onRemove={() =>
                      removeItem.mutate(item.id, {
                        onSuccess: () => {
                          addToast({
                            tone: 'success',
                            title: 'Đã xóa sản phẩm',
                            description: item.productName,
                          });
                        },
                        onError: (error) => handleMutationError(error, 'Không thể xóa sản phẩm'),
                      })
                    }
                    updating={mutationPending}
                  />
                ))}
              </div>
            </section>

            <CartVoucher {...voucher} disabled={mutationPending || cart.staleItemCount > 0} />
            <ShoppingBagSummary
              freeShipping={freeShipping}
              hasStaleItems={cart.staleItemCount > 0}
              isUpdating={mutationPending || voucher.checking}
              onCheckout={() => navigate(routes.checkoutAddress, voucher.code
                ? { state: { cartVoucherCode: voucher.preview?.isApplicable ? voucher.preview.code : null } }
                : undefined)}
              subtotal={cart.subTotal}
              vatSummary={cart.vatSummary}
            />
            <div className="flex flex-col items-center lg:col-start-1 lg:row-start-2 lg:flex-row lg:justify-between lg:gap-4 lg:border-t lg:border-border lg:pt-4">
              <Link className="inline-flex min-h-11 items-center gap-2 text-xs font-semibold text-text-secondary transition-colors hover:text-text-primary lg:uppercase lg:tracking-wide lg:text-text-primary" to={routes.products}>
                <ArrowLeft aria-hidden="true" className="size-4" />
                <span className="lg:hidden">Tiếp tục mua sắm</span>
                <span className="hidden lg:inline">Tiếp tục xem sản phẩm</span>
              </Link>
              <button
                className="inline-flex min-h-11 items-center text-xs text-text-secondary underline decoration-border underline-offset-4 transition-colors hover:text-text-primary hover:decoration-text-primary disabled:cursor-not-allowed disabled:opacity-50 lg:uppercase lg:tracking-wide"
                disabled={mutationPending}
                onClick={() => setConfirmOpen(true)}
                type="button"
              >
                Xóa toàn bộ túi đồ
              </button>
            </div>
          </div>
        ) : null}
      </Container>

      <ConfirmDialog
        cancelLabel="Giữ lại"
        confirmLabel={clearCart.isPending ? 'Đang xóa…' : 'Xóa giỏ hàng'}
        confirmLoading={clearCart.isPending}
        description="Thao tác này sẽ xóa tất cả sản phẩm khỏi giỏ hàng."
        onClose={() => setConfirmOpen(false)}
        onConfirm={() =>
          clearCart.mutate(undefined, {
            onSuccess: () => {
              setConfirmOpen(false);
              addToast({
                tone: 'success',
                title: 'Đã xóa giỏ hàng',
                description: 'Bạn có thể tiếp tục chọn sản phẩm.',
              });
            },
            onError: (error) => handleMutationError(error, 'Không thể xóa giỏ hàng'),
          })
        }
        open={confirmOpen}
        title="Xóa toàn bộ giỏ hàng?"
      />
    </>
  );
};

export default CartPage;
