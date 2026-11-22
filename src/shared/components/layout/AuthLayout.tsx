import { Link, Outlet } from 'react-router-dom';

import { routes } from '@/constants/routes';
import { Container } from '@/shared/components/layout/Container';

export const AuthLayout = () => (
  <div className="auth-shell-bg flex min-h-screen flex-col">
    <header className="border-b border-border">
      <Container className="flex min-h-16 items-center justify-between py-3">
        <Link className="text-sm font-semibold tracking-[0.12em] text-text-primary" to={routes.home}>
          FASHION SHOP
        </Link>
        <Link className="text-sm text-text-secondary underline-offset-4 hover:text-text-primary hover:underline" to={routes.home}>
          Quay lại cửa hàng
        </Link>
      </Container>
    </header>
    <main className="flex flex-1 items-center justify-center px-page py-10 md:py-16">
      <section className="w-full max-w-md border border-border bg-surface px-6 py-8 sm:px-8 md:px-10 md:py-10">
        <Outlet />
      </section>
    </main>
    <footer className="border-t border-border py-5 text-center text-xs text-text-secondary">
      <Container>© {new Date().getFullYear()} Fashion Shop</Container>
    </footer>
  </div>
);
