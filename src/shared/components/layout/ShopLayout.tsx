import { Outlet } from 'react-router-dom';

import { Footer } from '@/shared/components/layout/Footer';
import { Header } from '@/shared/components/layout/Header';
import { MobileNav } from '@/shared/components/layout/MobileNav';

export const ShopLayout = () => (
  <div className="min-h-screen">
    <Header />
    <main>
      <Outlet />
    </main>
    <Footer />
    <MobileNav />
  </div>
);

