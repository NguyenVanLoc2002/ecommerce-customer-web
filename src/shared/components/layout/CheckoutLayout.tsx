import { ArrowLeft } from 'lucide-react';
import { Link, Outlet } from 'react-router-dom';

import { routes } from '@/constants/routes';

export const CheckoutLayout = () => (
  <div className="min-h-screen bg-canvas">
    <header className="border-b border-border bg-canvas">
      <div className="mx-auto flex min-h-16 max-w-layout items-center justify-between gap-4 px-page py-3">
        <Link className="text-sm font-semibold tracking-[0.12em] text-text-primary" to={routes.home}>
          FASHION SHOP
        </Link>
        <Link className="inline-flex min-h-11 items-center gap-2 text-sm text-text-secondary transition-colors hover:text-text-primary" to={routes.home}>
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
