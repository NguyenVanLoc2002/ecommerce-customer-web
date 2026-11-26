import { ArrowLeft, UserRound } from 'lucide-react';
import { Link, NavLink, Outlet, useSearchParams } from 'react-router-dom';

import { routePaths, routes } from '@/constants/routes';

const navClass = ({ isActive }: { isActive: boolean }) =>
  `inline-flex min-h-11 items-center px-2 text-sm underline-offset-8 hover:underline ${isActive ? 'font-semibold underline' : 'text-text-secondary'}`;

export const AuthLayout = () => {
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') ?? undefined;

  return (
    <div className="auth-shell-bg flex min-h-screen flex-col">
      <header className="bg-canvas/90 shadow-subtle backdrop-blur-md">
        <div className="mx-auto flex min-h-16 max-w-7xl flex-wrap items-center justify-between gap-x-3 px-4 sm:min-h-20 sm:px-6 lg:px-12">
          <Link className="inline-flex min-h-11 items-center text-sm font-semibold tracking-[0.28em] hover:text-brand-primary sm:text-lg" to={routes.home}>
            FASHION SHOP
          </Link>
          <div className="flex items-center gap-2 sm:gap-6">
            <nav aria-label="Tài khoản" className="hidden items-center sm:flex">
              <NavLink className={navClass} to={routePaths.loginRedirect(redirect)}>Đăng nhập</NavLink>
              <span aria-hidden="true" className="text-xs text-outline">/</span>
              <NavLink className={navClass} to={routePaths.registerRedirect(redirect)}>Đăng ký</NavLink>
            </nav>
            <Link className="inline-flex min-h-11 items-center gap-2 rounded-button px-3 text-xs font-medium text-text-secondary transition-colors hover:bg-surface-muted hover:text-text-primary sm:uppercase sm:tracking-[0.15em]" to={routes.home}>
              <ArrowLeft aria-hidden="true" className="size-4" />
              <span className="sm:hidden">Cửa hàng</span>
              <span className="hidden sm:inline">Quay lại cửa hàng</span>
            </Link>
            <span aria-hidden="true" className="hidden size-8 place-items-center rounded-full bg-brand-primary text-surface sm:grid">
              <UserRound className="size-4" />
            </span>
          </div>
        </div>
      </header>
      <main className="flex flex-1 flex-col items-center px-5 py-8 md:px-8 md:py-16">
        <Outlet />
      </main>
      <footer className="bg-surface-muted py-6 text-center text-xs text-text-secondary sm:py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 sm:text-left lg:px-12">
          © {new Date().getFullYear()} Fashion Shop. Bảo lưu mọi quyền.
        </div>
      </footer>
    </div>
  );
};
