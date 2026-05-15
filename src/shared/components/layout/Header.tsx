import { useEffect, useId, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import { Bell, ChevronDown, Menu, ShoppingBag, User2 } from 'lucide-react';
import { Link, NavLink, useLocation } from 'react-router-dom';

import { routes } from '@/constants/routes';
import { useLogout } from '@/features/auth/hooks/useLogout';
import { getAccountNavItems, isAccountNavItemActive } from '@/shared/components/layout/accountNavigation';
import { Drawer } from '@/shared/components/overlays/Drawer';
import { useUnreadNotificationCount } from '@/shared/hooks/useNotifications';
import { useAuthStore } from '@/shared/stores/authStore';
import { useUiStore } from '@/shared/stores/uiStore';
import { cn } from '@/shared/utils/cn';

const homeLinks = [
  { label: 'Womenswear', to: `${routes.products}?category=womenswear` },
  { label: 'Menswear', to: `${routes.products}?category=menswear` },
  { label: 'Accessories', to: `${routes.products}?category=accessories` },
];

const collectionLinks = [
  { label: 'Womenswear', to: `${routes.products}?category=womenswear` },
  { label: 'Menswear', to: `${routes.products}?category=menswear` },
  { label: 'Accessories', to: `${routes.products}?category=accessories` },
  { label: 'Bag', to: routes.cart },
];

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'border-b border-transparent pb-1 font-display text-sm uppercase tracking-[0.2em] text-text-secondary transition-colors duration-300 hover:text-text-primary',
    isActive && 'border-text-primary text-text-primary',
  );

const headerIconButtonClassName =
  'relative inline-flex h-10 shrink-0 items-center justify-center rounded-full text-text-primary transition-colors hover:bg-surface-muted hover:text-brand-primary focus-visible:bg-surface-muted';

export const Header = () => {
  const { pathname } = useLocation();
  const closeMobileNav = useUiStore((state) => state.closeMobileNav);
  const isMobileNavOpen = useUiStore((state) => state.isMobileNavOpen);
  const openMobileNav = useUiStore((state) => state.openMobileNav);
  const logout = useLogout();
  const user = useAuthStore((state) => state.user);
  const accountMenuId = useId();
  const accountMenuRef = useRef<HTMLDivElement | null>(null);
  const accountMenuButtonRef = useRef<HTMLButtonElement | null>(null);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const unreadNotificationCountQuery = useUnreadNotificationCount();
  const unreadNotificationCount = unreadNotificationCountQuery.data ?? 0;
  const productSurface = pathname.startsWith(routes.products);
  const navLinks = pathname === routes.home ? homeLinks : collectionLinks;
  const logo = pathname === routes.home ? 'AURA EDITORIAL' : 'AURA';
  const accountNavItems = getAccountNavItems({ includeNotifications: false });

  useEffect(() => {
    setIsAccountMenuOpen(false);
  }, [pathname]);

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

  return (
    <header className="glass-header fixed inset-x-0 top-0 z-50 border-b border-border/70 print:hidden">
      <div className="mx-auto flex h-20 max-w-layout items-center justify-between gap-4 px-page">
        <div className="flex items-center gap-4 md:gap-8">
          <button
            aria-label="Open menu"
            className="inline-flex h-10 w-10 items-center justify-center text-text-primary transition-colors hover:text-brand-primary md:hidden"
            onClick={openMobileNav}
            type="button"
          >
            <Menu className="h-5 w-5" strokeWidth={1.6} />
          </button>
          <Link
            className={cn(
              'font-display text-xl uppercase tracking-[0.28em] text-text-primary transition-opacity hover:opacity-70',
              productSurface ? 'md:text-2xl' : 'md:text-[1.65rem]',
            )}
            to={routes.home}
          >
            {logo}
          </Link>
        </div>
        <nav className="hidden items-center gap-10 md:flex">
          {navLinks.map((link) => (
            <NavLink className={navLinkClass} key={link.label} to={link.to}>
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="flex items-center gap-2 md:gap-3">
          {user ? (
            <Link
              aria-label="Open notifications"
              className={cn(headerIconButtonClassName, 'w-10')}
              to={routes.notifications}
            >
              <Bell className="h-5 w-5" strokeWidth={1.7} />
              {unreadNotificationCount > 0 ? (
                <span className="absolute -right-2 -top-2 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-text-primary px-1 text-[10px] font-bold text-white">
                  {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
                </span>
              ) : null}
            </Link>
          ) : null}
          <Link
            aria-label="Open cart"
            className={cn(headerIconButtonClassName, 'w-10')}
            to={routes.cart}
          >
            <ShoppingBag className="h-5 w-5" strokeWidth={1.7} />
          </Link>
          {user ? (
            <div className="relative">
              <button
                aria-controls={isAccountMenuOpen ? accountMenuId : undefined}
                aria-expanded={isAccountMenuOpen}
                aria-haspopup="menu"
                aria-label="Open account menu"
                className={cn(headerIconButtonClassName, 'w-auto gap-1 px-3', isAccountMenuOpen && 'bg-surface-muted')}
                onClick={() => setIsAccountMenuOpen((open) => !open)}
                onKeyDown={handleAccountMenuButtonKeyDown}
                ref={accountMenuButtonRef}
                type="button"
              >
                <User2 className="h-5 w-5" strokeWidth={1.7} />
                <ChevronDown className={cn('h-3.5 w-3.5 text-outline transition-transform duration-300', isAccountMenuOpen && 'rotate-180')} strokeWidth={1.7} />
              </button>
              {isAccountMenuOpen ? (
                <div
                  aria-label="Account menu"
                  className="absolute right-0 top-full z-50 mt-3 w-[min(18rem,calc(100vw-2rem))] border border-border bg-surface p-2 shadow-card"
                  id={accountMenuId}
                  ref={accountMenuRef}
                  role="menu"
                >
                  <div className="border-b border-border px-3 pb-3 pt-2">
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-outline">Account</p>
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
                      {logout.isPending ? 'Signing out...' : 'Sign out'}
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          ) : (
            <Link
              aria-label="Go to login"
              className={cn(headerIconButtonClassName, 'w-10')}
              to={routes.login}
            >
              <User2 className="h-5 w-5" strokeWidth={1.7} />
            </Link>
          )}
        </div>
      </div>
      <Drawer onClose={closeMobileNav} open={isMobileNavOpen} side="left" title="Aura Editorial">
        <nav>
          <ul className="space-y-4">
            {navLinks.map((link) => (
              <li key={link.label}>
                <NavLink
                  className="block border-b border-border pb-3 font-display text-base uppercase tracking-[0.18em] text-text-primary transition-colors hover:text-brand-primary"
                  onClick={closeMobileNav}
                  to={link.to}
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
            {user ? (
              <li>
                <NavLink
                  className="block border-b border-border pb-3 font-display text-base uppercase tracking-[0.18em] text-text-primary transition-colors hover:text-brand-primary"
                  onClick={closeMobileNav}
                  to={routes.notifications}
                >
                  Notifications
                </NavLink>
              </li>
            ) : null}
            <li>
              <NavLink
                className="block border-b border-border pb-3 font-display text-base uppercase tracking-[0.18em] text-text-primary transition-colors hover:text-brand-primary"
                onClick={closeMobileNav}
                to={user ? routes.profile : routes.login}
              >
                {user ? 'Profile' : 'Member Access'}
              </NavLink>
            </li>
            {user ? (
              <li>
                <button
                  className="block w-full border-b border-border pb-3 text-left font-display text-base uppercase tracking-[0.18em] text-text-primary transition-colors hover:text-brand-primary disabled:opacity-50"
                  disabled={logout.isPending}
                  onClick={() => {
                    closeMobileNav();
                    logout.mutate({ redirectTo: routes.home });
                  }}
                  type="button"
                >
                  {logout.isPending ? 'Signing out...' : 'Sign out'}
                </button>
              </li>
            ) : null}
          </ul>
        </nav>
      </Drawer>
    </header>
  );
};
