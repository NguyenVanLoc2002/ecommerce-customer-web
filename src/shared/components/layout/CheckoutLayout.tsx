import { ArrowLeft } from 'lucide-react';
import { Link, Outlet } from 'react-router-dom';

import { routes } from '@/constants/routes';

export const CheckoutLayout = () => (
  <div className="min-h-screen bg-canvas">
    <header className="border-b border-border bg-canvas">
      <div className="mx-auto flex min-h-[72px] max-w-[1280px] items-center justify-between gap-6 px-page py-3">
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
