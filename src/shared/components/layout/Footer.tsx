import { Link, useLocation } from 'react-router-dom';

import { routes } from '@/constants/routes';
import { catalogNavigation } from '@/shared/components/layout/catalogNavigation';
import { cn } from '@/shared/utils/cn';

const serviceLinks = [
  { label: 'Đơn hàng', to: routes.orders },
  { label: 'Sổ địa chỉ', to: routes.profileAddresses },
  { label: 'Thông báo', to: routes.notifications },
];

export const Footer = ({ desktopOnly = false }: { desktopOnly?: boolean }) => {
  const { pathname } = useLocation();
  const home = pathname === routes.home;
  const productDetail = pathname.startsWith(`${routes.products}/`);

  return (
    <footer className={cn('border-t border-border bg-surface-muted text-sm text-text-secondary print:hidden', home && 'bg-canvas', desktopOnly && 'hidden md:block')}>
      <div className={cn('mx-auto max-w-layout px-5 pt-10 md:px-12 md:pb-12 md:pt-14', home && 'max-w-[1440px] lg:px-8 lg:pt-16')}>
        <div className={cn('grid grid-cols-2 gap-6 pb-8 md:grid-cols-12 md:gap-10 md:pb-12', home && 'lg:pb-16')}>
          <div className={cn('col-span-2 space-y-3 md:col-span-5', home && 'max-md:hidden')}>
            <p className={cn('text-sm font-semibold tracking-wider text-text-primary', home && 'text-base font-bold tracking-widest')}>FASHION SHOP</p>
            <p className={cn('max-w-sm leading-relaxed', productDetail && 'max-md:hidden')}>
              Bộ sưu tập trang phục và phụ kiện tinh giản với hình thái tối giản, chất liệu chọn lọc và phom dáng chuẩn mực.
            </p>
          </div>
          <div className={cn('space-y-3 md:col-span-3', productDetail && 'max-md:col-span-2')}>
            <p className={cn('text-xs font-semibold uppercase tracking-widest text-text-primary', home && 'md:text-base md:font-medium md:normal-case md:tracking-tight', productDetail && 'max-md:sr-only')}>Danh mục</p>
            <ul className={cn('space-y-2.5', productDetail && 'max-md:flex max-md:flex-wrap max-md:gap-x-5 max-md:gap-y-2 max-md:space-y-0 max-md:text-xs')}>
              {catalogNavigation.map(({ slug, label, to }) => (
                <li key={slug}><Link className="inline-flex py-0.5 transition-colors hover:text-brand-primary" to={to}>{label}</Link></li>
              ))}
            </ul>
          </div>
          <div className={cn('space-y-3 md:col-span-4', productDetail && 'max-md:hidden')}>
            <p className={cn('text-xs font-semibold uppercase tracking-widest text-text-primary', home && 'md:text-base md:font-medium md:normal-case md:tracking-tight')}>Dịch vụ khách hàng</p>
            <ul className="space-y-2.5">
              {serviceLinks.map(({ label, to }) => (
                <li key={to}><Link className="inline-flex py-0.5 transition-colors hover:text-brand-primary" to={to}>{label}</Link></li>
              ))}
            </ul>
          </div>
        </div>
        <div className="flex flex-col gap-2 pb-8 text-xs text-outline md:flex-row md:items-center md:justify-between md:border-t md:border-border md:pb-0 md:pt-8">
          <p>© {new Date().getFullYear()} Fashion Shop. Bảo lưu mọi quyền.</p>
          <p className="hidden md:block">Sản phẩm hiển thị theo đơn vị tiền tệ VND.</p>
        </div>
      </div>
    </footer>
  );
};
