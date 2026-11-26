import { ChevronLeft, LockKeyhole, Search, User2 } from 'lucide-react';
import { Link, Outlet, useLocation } from 'react-router-dom';

import { routePaths, routes } from '@/constants/routes';
import { useCartItemCount } from '@/features/cart/hooks/useCart';
import { catalogNavigation } from '@/shared/components/layout/catalogNavigation';
import { Footer } from '@/shared/components/layout/Footer';

const checkoutHeaders: Record<string, { title: string; back: string }> = {
  [routes.checkoutAddress]: { title: 'Địa chỉ giao hàng', back: routes.cart },
  [routes.checkoutPayment]: { title: 'Thanh toán đơn hàng', back: routes.checkoutAddress },
  [routes.checkoutVoucher]: { title: 'Khuyến mãi & Voucher', back: routes.checkoutPayment },
  [routes.checkoutReview]: { title: 'Xem lại đơn hàng', back: routes.checkoutVoucher },
  [routes.checkoutConfirmation]: { title: 'Fashion Shop / Xác nhận', back: routes.orders },
};

const headerLink = 'inline-flex min-h-11 items-center whitespace-nowrap transition-colors hover:text-brand-primary';

export const CheckoutLayout = () => {
  const { pathname } = useLocation();
  const mobile = checkoutHeaders[pathname] ?? checkoutHeaders[routes.checkoutAddress];
  const { data: cartItemCount } = useCartItemCount(false);

  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <header className="sticky top-0 z-30 border-b border-border bg-canvas/95 backdrop-blur-md">
        <div className="flex h-16 items-center justify-between gap-2 px-4 md:hidden">
          <div className="flex min-w-0 items-center gap-2">
            <Link aria-label="Quay lại" className="-ml-2 grid size-11 shrink-0 place-items-center rounded-button hover:text-brand-primary" to={mobile.back}>
              <ChevronLeft aria-hidden="true" className="size-5" />
            </Link>
            <div className="min-w-0">
              <p className="text-sm font-medium leading-tight tracking-tight">{mobile.title}</p>
              <p className="mt-1 flex items-center gap-1 text-[11px] leading-tight text-text-secondary">
                <LockKeyhole aria-hidden="true" className="size-3 shrink-0" />
                Thanh toán bảo mật
              </p>
            </div>
          </div>
          <Link aria-label="Fashion Shop" className="flex min-h-11 shrink-0 items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-text-secondary hover:text-brand-primary" to={routes.home}>
            <span className="hidden min-[360px]:inline">Fashion Shop</span>
            <User2 aria-hidden="true" className="size-8 rounded-full bg-brand-primary p-1.5 text-surface" />
          </Link>
        </div>
        <div className="mx-auto hidden h-16 max-w-layout items-center justify-between gap-4 px-5 md:flex lg:px-12">
          <div className="flex items-center gap-6 lg:gap-12">
            <Link className={`${headerLink} text-lg font-semibold tracking-[0.2em]`} to={routes.home}>FASHION SHOP</Link>
            <nav aria-label="Danh mục sản phẩm" className="flex items-center gap-5 text-sm text-text-secondary lg:gap-8">
              {catalogNavigation.map(({ label, slug, to }) => (
                <Link className={headerLink} key={slug} to={to}>{label}</Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3 text-xs uppercase tracking-wider text-text-secondary lg:gap-6">
            <Link aria-label="Tìm kiếm sản phẩm" className={`${headerLink} justify-center px-3`} to={routePaths.productSearch()}>
              <Search aria-hidden="true" className="size-5" />
            </Link>
            <Link className={`${headerLink} gap-1.5 text-text-primary`} to={routes.cart}>
              Giỏ hàng
              {cartItemCount ? <span className="rounded-full bg-brand-primary px-1.5 py-0.5 text-[11px] font-medium leading-none text-surface">{cartItemCount}</span> : null}
            </Link>
            <Link className={`${headerLink} gap-2`} to={routes.profile}>
              Tài khoản <User2 aria-hidden="true" className="size-8 rounded-full bg-brand-primary p-1.5 text-surface" />
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer desktopOnly />
    </div>
  );
};
