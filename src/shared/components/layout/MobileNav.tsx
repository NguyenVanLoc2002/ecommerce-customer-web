import { Compass, Grid2X2, Home, Package2, Search, ShoppingBag, User2 } from 'lucide-react';
import { Link, NavLink, useLocation } from 'react-router-dom';

import { routePaths, routes } from '@/constants/routes';
import { useCartItemCount } from '@/features/cart/hooks/useCart';
import { useAuthStore } from '@/shared/stores/authStore';
import { useUiStore } from '@/shared/stores/uiStore';
import { cn } from '@/shared/utils/cn';

const discoveryLink =
  'flex min-h-12 w-full flex-col items-center justify-center gap-1 px-1 py-1 text-[11px] font-medium leading-tight tracking-tight text-text-secondary transition-colors hover:text-text-primary';

export const MobileNav = () => {
  const { pathname } = useLocation();
  const user = useAuthStore((state) => state.user);
  const isMobileNavOpen = useUiStore((state) => state.isMobileNavOpen);
  const openMobileNav = useUiStore((state) => state.openMobileNav);
  const isHome = pathname === routes.home;
  const isDiscovery = isHome || pathname === routes.products || pathname.startsWith(`${routes.products}/`);
  const { data: cartItemCount = 0 } = useCartItemCount(false);

  if (isDiscovery) {
    const cartCount = user ? cartItemCount : 0;
    const items = [
      { icon: Search, label: 'Tìm kiếm', to: routePaths.productSearch() },
      { icon: ShoppingBag, label: `Túi đồ (${cartCount > 99 ? '99+' : cartCount})`, to: user ? routes.cart : routePaths.loginRedirect(routes.cart) },
      { icon: User2, label: 'Tài khoản', to: user ? routes.profile : routes.login },
    ];

    return (
      <nav aria-label="Điều hướng nhanh" className="fixed inset-x-0 bottom-0 z-40 bg-canvas/95 px-2 pb-[env(safe-area-inset-bottom)] shadow-sticky backdrop-blur-md print:hidden lg:hidden">
        <ul className="mx-auto grid h-16 max-w-lg grid-cols-5 items-center gap-1">
          <li>
            <Link aria-current={isHome ? 'page' : undefined} className={cn(discoveryLink, isHome && 'font-semibold text-text-primary')} to={routes.home}>
              <Compass aria-hidden="true" className="size-5" strokeWidth={1.7} />
              <span>Khám phá</span>
            </Link>
          </li>
          <li>
            <button aria-expanded={isMobileNavOpen} className={discoveryLink} onClick={openMobileNav} type="button">
              <Grid2X2 aria-hidden="true" className="size-5" strokeWidth={1.7} />
              <span>Danh mục</span>
            </button>
          </li>
          {items.map((item) => (
            <li key={item.label}>
              <Link className={discoveryLink} to={item.to}>
                <item.icon aria-hidden="true" className="size-5" strokeWidth={1.7} />
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    );
  }

  const baseItems = [
    { icon: Home, label: 'Trang chủ', to: routes.home },
    { icon: Search, label: 'Sản phẩm', to: routes.products },
  ];
  const items = user
    ? [...baseItems, { icon: Package2, label: 'Đơn hàng', to: routes.orders }, { icon: User2, label: 'Tài khoản', to: routes.profile }]
    : [...baseItems, { icon: User2, label: 'Đăng nhập', to: routes.login }];

  return (
    <nav aria-label="Điều hướng nhanh" className="fixed inset-x-3 bottom-3 z-40 border border-border bg-canvas px-2 py-1 print:hidden lg:hidden">
      <ul className="mx-auto grid max-w-sm grid-flow-col auto-cols-fr gap-1">
        {items.map((item) => (
          <li key={item.label}>
            <NavLink
              className={({ isActive }) =>
                cn(
                  'flex min-h-12 flex-col items-center justify-center gap-0.5 px-1 py-1 text-[10px] font-medium leading-tight text-text-secondary transition-colors',
                  isActive && 'text-brand-primary',
                )
              }
              to={item.to}
            >
              <item.icon aria-hidden="true" className="h-4 w-4" strokeWidth={1.7} />
              <span>{item.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
};
