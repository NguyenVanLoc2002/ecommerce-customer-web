import { Bell, Menu, ShoppingBag, User2 } from 'lucide-react';
import { Link, NavLink, useLocation } from 'react-router-dom';

import { routes } from '@/constants/routes';
import { useUnreadNotificationCount } from '@/shared/hooks/useNotifications';
import { Drawer } from '@/shared/components/overlays/Drawer';
import { useAuthStore } from '@/shared/stores/authStore';
import { useUiStore } from '@/shared/stores/uiStore';
import { cn } from '@/shared/utils/cn';

const homeLinks = [
  { label: 'Collections', to: routes.products },
  { label: 'Artisan', to: routes.products },
  { label: 'Journal', to: routes.products },
];

const collectionLinks = [
  { label: 'Collections', to: routes.products },
  { label: 'Tailoring', to: routes.products },
  { label: 'Lookbook', to: routes.products },
  { label: 'Objects', to: routes.products },
];

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'border-b border-transparent pb-1 font-display text-sm uppercase tracking-[0.2em] text-text-secondary transition-colors duration-300 hover:text-text-primary',
    isActive && 'border-text-primary text-text-primary',
  );

export const Header = () => {
  const { pathname } = useLocation();
  const closeMobileNav = useUiStore((state) => state.closeMobileNav);
  const isMobileNavOpen = useUiStore((state) => state.isMobileNavOpen);
  const openMobileNav = useUiStore((state) => state.openMobileNav);
  const user = useAuthStore((state) => state.user);
  const unreadNotificationCountQuery = useUnreadNotificationCount();
  const unreadNotificationCount = unreadNotificationCountQuery.data ?? 0;
  const productSurface = pathname.startsWith(routes.products);
  const navLinks = pathname === routes.home ? homeLinks : collectionLinks;
  const logo = pathname === routes.home ? 'AURA EDITORIAL' : 'AURA';

  return (
    <header className="glass-header fixed inset-x-0 top-0 z-50 border-b border-border/70">
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
        <div className="flex items-center gap-5 md:gap-6">
          {user ? (
            <Link
              aria-label="Open notifications"
              className="relative text-text-primary transition-colors hover:text-brand-primary"
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
            className="text-text-primary transition-colors hover:text-brand-primary"
            to={routes.cart}
          >
            <ShoppingBag className="h-5 w-5" strokeWidth={1.7} />
          </Link>
          <Link
            aria-label={user ? 'Go to profile' : 'Go to login'}
            className="text-text-primary transition-colors hover:text-brand-primary"
            to={user ? routes.profile : routes.login}
          >
            <User2 className="h-5 w-5" strokeWidth={1.7} />
          </Link>
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
          </ul>
        </nav>
      </Drawer>
    </header>
  );
};
