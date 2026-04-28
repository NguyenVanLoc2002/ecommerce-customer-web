import { Home, Package2, Search, User2 } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';

import { routes } from '@/constants/routes';
import { useAuthStore } from '@/shared/stores/authStore';
import { cn } from '@/shared/utils/cn';

const inScopeRoutes = [routes.home, routes.products] as const;

export const MobileNav = () => {
  const { pathname } = useLocation();
  const user = useAuthStore((state) => state.user);

  if (pathname.startsWith(routes.products) || inScopeRoutes.includes(pathname as (typeof inScopeRoutes)[number])) {
    return null;
  }

  const items = [
    { icon: Home, label: 'Home', to: routes.home },
    { icon: Search, label: 'Shop', to: routes.products },
    { icon: Package2, label: 'Orders', to: routes.orders },
    { icon: User2, label: user ? 'Profile' : 'Login', to: user ? routes.profile : routes.login },
  ];

  return (
    <nav className="fixed inset-x-4 bottom-4 z-40 border border-border bg-white/90 px-3 py-2 shadow-sticky backdrop-blur lg:hidden">
      <ul className="grid grid-cols-4 gap-2">
        {items.map((item) => (
          <li key={item.label}>
            <NavLink
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center gap-1 px-2 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-text-secondary transition-colors',
                  isActive && 'text-text-primary',
                )
              }
              to={item.to}
            >
              <item.icon className="h-4 w-4" strokeWidth={1.7} />
              <span>{item.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
};
