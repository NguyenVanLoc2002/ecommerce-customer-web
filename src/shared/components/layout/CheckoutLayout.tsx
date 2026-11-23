import { ArrowLeft, LockKeyhole } from 'lucide-react';
import { Link, Outlet, useLocation } from 'react-router-dom';

import { routes } from '@/constants/routes';

const checkoutHeaders: Record<string, { title: string; back: string }> = {
  [routes.checkoutAddress]: { title: 'Địa chỉ giao hàng', back: routes.cart },
  [routes.checkoutPayment]: { title: 'Thanh toán đơn hàng', back: routes.checkoutAddress },
  [routes.checkoutVoucher]: { title: 'Khuyến mãi & Voucher', back: routes.checkoutPayment },
  [routes.checkoutReview]: { title: 'Xem lại đơn hàng', back: routes.checkoutVoucher },
  [routes.checkoutConfirmation]: { title: 'Fashion Shop / Xác nhận', back: routes.orders },
};

export const CheckoutLayout = () => {
  const { pathname } = useLocation();
  const mobile = checkoutHeaders[pathname] ?? checkoutHeaders[routes.checkoutAddress];

  return (
  <div className="min-h-screen bg-canvas">
    <header className="sticky top-0 z-30 border-b border-border bg-canvas">
      <div className="grid min-h-14 grid-cols-[44px_minmax(0,1fr)_44px] items-center px-3 md:hidden">
        <Link aria-label="Quay lại" className="grid min-h-11 place-items-center" to={mobile.back}>
          <ArrowLeft aria-hidden="true" className="h-4 w-4" />
        </Link>
        <p className="text-center text-sm font-semibold">{mobile.title}</p>
        <LockKeyhole aria-label="Thanh toán bảo mật" className="mx-auto h-4 w-4" />
      </div>
      <div className="mx-auto hidden min-h-16 max-w-6xl items-center justify-between gap-6 px-page py-3 md:flex">
        <Link className="text-sm font-semibold tracking-[0.12em] text-text-primary" to={routes.home}>
          FASHION SHOP
        </Link>
        <nav aria-label="Store navigation" className="hidden items-center gap-8 md:flex">
          <Link className="text-xs font-medium uppercase tracking-[0.12em] text-text-secondary hover:text-text-primary" to={routes.products}>Products</Link>
          <Link className="text-xs font-medium uppercase tracking-[0.12em] text-text-secondary hover:text-text-primary" to={routes.orders}>Orders</Link>
          <Link className="text-xs font-medium uppercase tracking-[0.12em] text-text-secondary hover:text-text-primary" to={routes.profile}>Account</Link>
          <Link className="text-xs font-medium uppercase tracking-[0.12em] text-text-primary hover:text-text-secondary" to={routes.cart}>Bag</Link>
        </nav>
        <Link className="inline-flex min-h-11 shrink-0 items-center gap-2 text-sm text-text-secondary transition-colors hover:text-text-primary" to={routes.home}>
          <ArrowLeft aria-hidden="true" className="h-4 w-4" />
          Tiếp tục mua sắm
        </Link>
      </div>
    </header>
    <main>
      <Outlet />
    </main>
  </div>
  );
};
