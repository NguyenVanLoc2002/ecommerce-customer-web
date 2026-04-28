import { Link, Outlet } from 'react-router-dom';

import { routes } from '@/constants/routes';

export const CheckoutLayout = () => (
  <div className="min-h-screen bg-canvas">
    <header className="border-b border-border bg-canvas/95 backdrop-blur">
      <div className="mx-auto flex min-h-[88px] max-w-layout items-center justify-between gap-4 px-page py-5">
        <Link className="font-display text-lg uppercase tracking-[0.28em] text-text-primary md:text-xl" to={routes.home}>
          Aura
        </Link>
        <div className="text-right">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-outline">Secure checkout</p>
          <p className="mt-2 text-sm text-text-secondary">Encrypted checkout flow</p>
        </div>
      </div>
    </header>
    <main>
      <Outlet />
    </main>
  </div>
);
