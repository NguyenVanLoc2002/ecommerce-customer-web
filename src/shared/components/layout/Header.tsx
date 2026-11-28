import { motion, useReducedMotion } from 'framer-motion';
import { useEffect, useId, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import { ArrowLeft, Bell, Menu, Search, ShoppingBag, User2 } from 'lucide-react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';

import { routePaths, routes } from '@/constants/routes';
import { useLogout } from '@/features/auth/hooks/useLogout';
import { useCartItemCount } from '@/features/cart/hooks/useCart';
import { getAccountNavItems, isAccountNavItemActive } from '@/shared/components/layout/accountNavigation';
import { catalogNavigation } from '@/shared/components/layout/catalogNavigation';
import { Drawer } from '@/shared/components/overlays/Drawer';
import { useUnreadNotificationCount } from '@/shared/hooks/useNotifications';
import { useAuthStore } from '@/shared/stores/authStore';
import { useUiStore } from '@/shared/stores/uiStore';
import { cn } from '@/shared/utils/cn';

const headerIconButtonClassName =
  'relative inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center gap-2 rounded-button text-sm text-text-primary transition-colors hover:text-brand-primary';

const headerBadgeClassName =
  'pointer-events-none absolute -right-2 -top-2 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-text-primary px-1 text-[10px] font-bold text-white';

export const Header = () => {
  const { pathname, search } = useLocation();
  const [searchParams] = useSearchParams();
  const closeMobileNav = useUiStore((state) => state.closeMobileNav);
  const isMobileNavOpen = useUiStore((state) => state.isMobileNavOpen);
  const openMobileNav = useUiStore((state) => state.openMobileNav);
  const logout = useLogout();
  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);
  const accountMenuId = useId();
  const accountMenuRef = useRef<HTMLDivElement | null>(null);
  const accountMenuButtonRef = useRef<HTMLButtonElement | null>(null);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const reducedMotion = useReducedMotion();
  const unreadNotificationCountQuery = useUnreadNotificationCount();
  const cartItemCountQuery = useCartItemCount(Boolean(user && accessToken));
  const unreadNotificationCount = unreadNotificationCountQuery.data ?? 0;
  const cartItemCount = cartItemCountQuery.data ?? 0;
  const isHome = pathname === routes.home;
  const isCart = pathname === routes.cart;
  const isProductList = pathname === routes.products;
  const isCatalog = pathname === routes.products || pathname.startsWith(`${routes.products}/`);
  const category = isCatalog ? searchParams.get('category') : null;
  const cartTarget = user ? routes.cart : routePaths.loginRedirect(routes.cart);
  const accountNavItems = getAccountNavItems({ includeNotifications: false });
  const cartBadgeText = cartItemCount > 99 ? '99+' : String(cartItemCount);
  const cartAriaLabel = cartItemCount > 0 ? `Giỏ hàng, ${cartItemCount} sản phẩm` : 'Giỏ hàng';

  useEffect(() => {
    setIsAccountMenuOpen(false);
  }, [pathname, search]);

  useEffect(() => {
    if (!isAccountMenuOpen) {
      return undefined;
    }

    const focusFirstMenuItem = () => {
      accountMenuRef.current?.querySelector<HTMLElement>('[data-account-menu-item="true"]')?.focus();
    };

    focusFirstMenuItem();

    const handlePointerDown = (event: MouseEvent) => {
      if (!accountMenuRef.current?.contains(event.target as Node) && !accountMenuButtonRef.current?.contains(event.target as Node)) {
        setIsAccountMenuOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') {
        return;
      }

      setIsAccountMenuOpen(false);
      accountMenuButtonRef.current?.focus();
    };

    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isAccountMenuOpen]);

  const handleAccountMenuButtonKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== 'ArrowDown' || isAccountMenuOpen) {
      return;
    }

    event.preventDefault();
    setIsAccountMenuOpen(true);
  };

  const handleAccountMenuKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;

    const items = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('[data-account-menu-item]:not(:disabled)'));
    if (!items.length) return;

    event.preventDefault();
    const current = items.findIndex((item) => item === document.activeElement);
    const index = event.key === 'Home' ? 0 : event.key === 'End' ? items.length - 1 :
      (current + (event.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length;
    items[index]?.focus();
  };

  const accountIcon = (
    <span className={cn('grid size-8 shrink-0 place-items-center rounded-full text-surface', isHome || isProductList || isCart ? 'bg-[rgb(var(--discovery-control))]' : 'bg-brand-primary', isHome && 'lg:hidden')}>
      <User2 aria-hidden="true" className="size-[18px]" strokeWidth={1.7} />
    </span>
  );

  return (
    <header className={cn('fixed inset-x-0 top-0 z-50 print:hidden', isHome || isCart ? 'bg-canvas lg:border-b lg:border-border' : 'bg-canvas/90 shadow-subtle backdrop-blur-md')}>
      <div className={cn(
        'mx-auto flex items-center justify-between gap-0.5 px-4 lg:gap-4 lg:px-12',
        isHome ? 'h-16 max-w-[1440px] px-4 lg:h-20 lg:px-8' : isCatalog || isCart ? 'h-14 max-w-layout lg:h-16' : 'h-[72px] max-w-layout lg:h-20',
      )}>
        <div className={cn('flex min-w-0 items-center gap-1 sm:gap-3 lg:gap-10', (isHome || isProductList || isCart) && 'min-[360px]:gap-3', isHome && 'lg:gap-12')}>
          {isCart ? (
            <Link aria-label="Quay lại danh sách sản phẩm" className={cn(headerIconButtonClassName, '-ml-2 lg:hidden')} to={routes.products}>
              <ArrowLeft aria-hidden="true" className="size-5" />
            </Link>
          ) : (
            <button
              aria-expanded={isMobileNavOpen}
              aria-label="Mở danh mục"
              className="-ml-2 inline-flex size-11 shrink-0 items-center justify-center text-text-primary transition-colors hover:text-brand-primary lg:hidden"
              onClick={openMobileNav}
              type="button"
            >
              <Menu aria-hidden="true" className="size-[22px]" strokeWidth={1.6} />
            </button>
          )}
          <Link
            className={cn('inline-flex min-h-11 items-center whitespace-nowrap text-xs font-semibold tracking-tight transition-colors hover:text-brand-primary min-[360px]:text-base', (isHome || isCart) && 'lg:text-lg lg:font-bold lg:tracking-widest')}
            to={routes.home}
          >
            FASHION SHOP
          </Link>
          <nav aria-label="Danh mục sản phẩm" className={cn('hidden items-center gap-7 lg:flex', isHome && 'lg:gap-8')}>
            {catalogNavigation.map((link) => (
              <Link
                aria-current={category === link.slug ? 'page' : undefined}
                className={cn('inline-flex min-h-11 items-center whitespace-nowrap text-sm text-text-secondary transition-colors hover:text-brand-primary', isHome && 'text-[15px] text-text-primary', category === link.slug && 'font-semibold text-brand-primary underline underline-offset-8')}
                key={link.slug}
                to={link.to}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className={cn('flex shrink-0 items-center gap-0.5 min-[360px]:gap-1', isHome ? 'lg:gap-2' : 'lg:gap-4')}>
          <Link aria-label="Tìm kiếm sản phẩm" className={cn(headerIconButtonClassName, 'lg:px-2')} to={routePaths.productSearch()}>
            <Search aria-hidden="true" className="size-5" strokeWidth={1.7} />
            {!isCart ? <span className="hidden lg:inline">Tìm kiếm</span> : null}
          </Link>
          {user ? (
            <div className={cn('relative', isCart && 'order-2 lg:order-none')}>
              <button
                aria-controls={isAccountMenuOpen ? accountMenuId : undefined}
                aria-expanded={isAccountMenuOpen}
                aria-haspopup="menu"
                aria-label="Open account menu"
                className={cn(headerIconButtonClassName, 'lg:px-2', isAccountMenuOpen && 'bg-surface-muted')}
                onClick={() => setIsAccountMenuOpen((open) => !open)}
                onKeyDown={handleAccountMenuButtonKeyDown}
                ref={accountMenuButtonRef}
                type="button"
              >
                <span className="hidden lg:inline">Tài khoản</span>
                {accountIcon}
              </button>
              {isAccountMenuOpen ? (
                <div
                  aria-label="Account menu"
                  className="absolute right-0 top-full z-50 mt-3 w-[min(18rem,calc(100vw-2rem))] border border-border bg-surface p-2 shadow-subtle"
                  id={accountMenuId}
                  onKeyDown={handleAccountMenuKeyDown}
                  ref={accountMenuRef}
                  role="menu"
                >
                  <div className="border-b border-border px-3 pb-3 pt-2">
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-outline">Tài khoản</p>
                    <p className="mt-2 text-sm text-text-secondary [overflow-wrap:anywhere]">{user.email}</p>
                  </div>
                  <div className="py-2">
                    {accountNavItems.map((item) => {
                      const isActive = isAccountNavItemActive(pathname, item);

                      return (
                        <Link
                          className={cn(
                            'block px-3 py-3 text-[11px] font-bold uppercase tracking-[0.18em] transition-colors',
                            isActive ? 'bg-surface-muted text-text-primary' : 'text-text-secondary hover:bg-surface-muted hover:text-text-primary',
                          )}
                          data-account-menu-item="true"
                          key={item.key}
                          onClick={() => setIsAccountMenuOpen(false)}
                          role="menuitem"
                          to={item.to}
                        >
                          {item.label}
                        </Link>
                      );
                    })}
                  </div>
                  <div className="border-t border-border pt-2">
                    <button
                      className="block w-full px-3 py-3 text-left text-[11px] font-bold uppercase tracking-[0.18em] text-text-primary transition-colors hover:bg-surface-muted disabled:opacity-50"
                      data-account-menu-item="true"
                      disabled={logout.isPending}
                      onClick={() => {
                        setIsAccountMenuOpen(false);
                        logout.mutate({ redirectTo: routes.home });
                      }}
                      role="menuitem"
                      type="button"
                    >
                      {logout.isPending ? 'Đang đăng xuất...' : 'Đăng xuất'}
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          ) : (
            <Link
              aria-label="Đăng nhập"
              className={cn(headerIconButtonClassName, 'lg:px-2')}
              to={routes.login}
            >
              <span className="hidden lg:inline">Tài khoản</span>
              {accountIcon}
            </Link>
          )}
          <Link
            aria-label={cartAriaLabel}
            className={cn(headerIconButtonClassName, 'gap-1 px-2 lg:gap-1.5', isCart && 'lg:uppercase')}
            to={cartTarget}
          >
            <ShoppingBag aria-hidden="true" className={cn('size-5', (isHome || isCart) && 'lg:hidden')} strokeWidth={1.7} />
            <span className={cn('text-xs font-medium lg:text-sm lg:font-normal', isCart && 'lg:inline-flex lg:items-center lg:gap-1 lg:text-xs lg:tracking-wide')}>
              <span className="hidden lg:inline">Giỏ hàng </span>
              <motion.span
                animate={reducedMotion ? undefined : { opacity: 1 }}
                initial={reducedMotion ? false : { opacity: 0.6 }}
                className={isCart ? 'absolute right-1 top-0.5 grid size-4 place-items-center rounded-full bg-[rgb(var(--discovery-control))] text-[10px] font-semibold text-surface lg:static' : undefined}
                key={cartBadgeText}
                transition={{ duration: 0.2 }}
              >
                {isCart ? cartBadgeText : `(${cartBadgeText})`}
              </motion.span>
            </span>
          </Link>
          {user ? (
            <Link
              aria-label="Thông báo"
              className={cn(headerIconButtonClassName, 'hidden lg:inline-flex')}
              to={routes.notifications}
            >
              <Bell className="h-5 w-5" strokeWidth={1.7} />
              {unreadNotificationCount > 0 ? (
                <span aria-hidden="true" className={headerBadgeClassName}>
                  {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
                </span>
              ) : null}
            </Link>
          ) : null}
        </div>
      </div>
      <Drawer onClose={closeMobileNav} open={isMobileNavOpen} side="left" title="Fashion Shop">
        <nav>
          <ul className="space-y-4">
            {catalogNavigation.map((link) => (
              <li key={link.label}>
                <Link
                  className="flex min-h-11 items-center border-b border-border py-3 text-base text-text-primary transition-colors hover:text-brand-primary"
                  onClick={closeMobileNav}
                  to={link.to}
                >
                  {link.label}
                </Link>
              </li>
            ))}
            {user ? (
              <li>
                <Link
                  className="flex min-h-11 items-center border-b border-border py-3 text-base text-text-primary transition-colors hover:text-brand-primary"
                  onClick={closeMobileNav}
                  to={routes.notifications}
                >
                  Thông báo
                </Link>
              </li>
            ) : null}
            <li>
              <Link
                className="flex min-h-11 items-center border-b border-border py-3 text-base text-text-primary transition-colors hover:text-brand-primary"
                onClick={closeMobileNav}
                to={user ? routes.profile : routes.login}
              >
                {user ? 'Tài khoản' : 'Đăng nhập'}
              </Link>
            </li>
            {user ? (
              <li>
                <button
                  className="block min-h-11 w-full border-b border-border py-3 text-left text-base text-text-primary transition-colors hover:text-brand-primary disabled:opacity-50"
                  disabled={logout.isPending}
                  onClick={() => {
                    closeMobileNav();
                    logout.mutate({ redirectTo: routes.home });
                  }}
                  type="button"
                >
                  {logout.isPending ? 'Đang đăng xuất...' : 'Đăng xuất'}
                </button>
              </li>
            ) : null}
            <li>
              <Link className="flex min-h-11 items-center border-b border-border py-3 hover:text-brand-primary" onClick={closeMobileNav} to={routes.products}>
                Tất cả sản phẩm
              </Link>
            </li>
          </ul>
        </nav>
      </Drawer>
    </header>
  );
};
