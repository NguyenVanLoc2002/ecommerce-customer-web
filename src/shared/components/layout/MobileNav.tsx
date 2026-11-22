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

  const baseItems = [
    { icon: Home, label: 'Trang chủ', to: routes.home },
    { icon: Search, label: 'Sản phẩm', to: routes.products },
  ];
  const items = user
    ? [...baseItems, { icon: Package2, label: 'Đơn hàng', to: routes.orders }, { icon: User2, label: 'Tài khoản', to: routes.profile }]
    : [...baseItems, { icon: User2, label: 'Đăng nhập', to: routes.login }];

  return (
    <nav aria-label="Điều hướng nhanh" className="fixed inset-x-3 bottom-3 z-40 border border-border bg-canvas px-2 py-1 print:hidden lg:hidden">
      <ul className="mx-auto grid max-w-sm grid-cols-4 gap-1">
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
