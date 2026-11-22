import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { routePaths, routes } from '@/constants/routes';
import { isCartStockConflict } from '@/features/cart/lib/cartErrors';
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
  const mutationPending = updateQuantity.isPending || removeItem.isPending || clearCart.isPending;

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
      <Container className="space-y-3 pb-16 pt-24 md:space-y-10 md:pb-20 md:pt-32">
        <header className="border-b-0 pb-0 md:border-b md:border-border md:pb-8">
          <div>
            <nav aria-label="Breadcrumb" className="mb-2 text-sm text-text-secondary">
              <Link className="underline decoration-border underline-offset-4 hover:text-text-primary" to={routes.home}>Trang chủ</Link>
              <span aria-hidden="true" className="mx-2">/</span>
              <span aria-current="page" className="text-text-primary">Giỏ hàng</span>
            </nav>
            <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
              <h1 className="text-xl font-normal leading-tight text-text-primary md:text-3xl">Túi đồ của bạn</h1>
              {cart || cartQuery.isLoading ? (
                <p aria-live="polite" className="text-base text-text-secondary md:text-lg">
                  ({cart ? `${cart.totalItems} sản phẩm` : 'Đang tải…'})
                </p>
              ) : null}
            </div>
          </div>
        </header>

        {cartQuery.isLoading ? <LoadingOverlay className="min-h-[240px] border-border bg-surface" inline label="Đang tải giỏ hàng…" /> : null}
        {cartQuery.isError ? (
          <ErrorCard
            action={<Button onClick={() => void cartQuery.refetch()}>Thử tải lại</Button>}
            className="border-border bg-surface"
            description="Không thể tải giỏ hàng lúc này. Vui lòng thử lại."
            title="Tải giỏ hàng không thành công"
          />
        ) : null}
        {cart && cart.items.length === 0 ? (
          <EmptyState
            action={
              <Link className={buttonStyles({})} to={routes.products}>
                Tiếp tục mua sắm
              </Link>
            }
            className="border-border bg-surface px-6 py-16"
            description="Sản phẩm bạn thêm vào sẽ xuất hiện tại đây."
            title="Giỏ hàng đang trống"
          />
        ) : null}

        {cart && cart.items.length > 0 ? (
          <div className="grid items-start gap-3 md:gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-12">
            <section aria-label="Sản phẩm trong giỏ hàng" className="min-w-0 lg:col-start-1 lg:row-start-1">
              {cart.staleItemCount > 0 ? <StaleCartBanner count={cart.staleItemCount} /> : null}
              <div className="mt-0 space-y-3 md:mt-6 md:space-y-8">
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

            <CartSummary
              className="lg:col-start-2 lg:row-span-2 lg:row-start-1"
              description="Phí vận chuyển và ưu đãi (nếu có) sẽ được tính ở bước thanh toán."
              footer={
                <div className="space-y-3">
                  <Button
                    disabled={cart.staleItemCount > 0 || mutationPending}
                    fullWidth
                    onClick={() => navigate(routes.checkoutAddress)}
                    size="lg"
                  >
                    Tiếp tục thanh toán
                  </Button>
                  {cart.staleItemCount > 0 ? (
                    <p className="text-sm leading-6 text-danger" role="status">Hãy cập nhật số lượng tồn kho trước khi thanh toán.</p>
                  ) : null}
                </div>
              }
              isTotalsUpdating={mutationPending}
              title="Tóm tắt đơn hàng"
              totals={cart}
              variant="cart"
            />
            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border pt-5 md:mt-0 md:pt-5 lg:col-start-1 lg:row-start-2">
              <Link className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-text-primary underline decoration-border underline-offset-4 hover:decoration-text-primary" to={routes.products}>
                <span aria-hidden="true">←</span>
                Tiếp tục xem sản phẩm
              </Link>
              <button
                className="inline-flex min-h-11 items-center text-sm text-text-secondary underline decoration-border underline-offset-4 transition-colors hover:text-text-primary hover:decoration-text-primary disabled:cursor-not-allowed disabled:opacity-50"
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
