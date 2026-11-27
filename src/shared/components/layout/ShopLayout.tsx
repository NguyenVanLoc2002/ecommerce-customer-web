import { Outlet, useLocation } from 'react-router-dom';

import { routes } from '@/constants/routes';
import { Footer } from '@/shared/components/layout/Footer';
import { Header } from '@/shared/components/layout/Header';
import { MobileNav } from '@/shared/components/layout/MobileNav';
import { cn } from '@/shared/utils/cn';

export const ShopLayout = () => {
  const { pathname } = useLocation();

  const isProductDetail = pathname.startsWith(`${routes.products}/`);

  return (
    <div className={cn('min-h-screen pb-[calc(4rem+env(safe-area-inset-bottom))] print:pb-0 lg:pb-0', isProductDetail && 'product-detail')}>
      <Header />
      <main className={cn(pathname === routes.home && 'pt-16 lg:pt-20', isProductDetail && 'pt-14 lg:pt-16')}>
        <Outlet />
      </main>
      <Footer />
      <MobileNav />
    </div>
  );
};
