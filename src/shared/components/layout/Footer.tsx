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
  const productList = pathname === routes.products;
  const cart = pathname === routes.cart;
  const compactLinks = 'max-md:flex max-md:flex-wrap max-md:gap-x-5 max-md:gap-y-2 max-md:space-y-0 max-md:text-xs';
  const productDetail = pathname.startsWith(`${routes.products}/`);

  return (
    <footer className={cn('border-t border-border text-sm text-text-secondary print:hidden', home ? 'bg-canvas' : productList ? 'bg-[rgb(var(--discovery-panel))]' : 'bg-surface-muted', productDetail && 'max-lg:border-0 max-lg:bg-canvas', desktopOnly && 'hidden md:block')}>
      <div className={cn('mx-auto max-w-layout px-5 pt-10 md:px-12 md:pb-12 md:pt-14', home && 'max-w-[1440px] lg:px-8 lg:pt-16', productDetail && 'max-lg:pt-8')}>
        <div className={cn('grid pb-8 md:gap-10 md:pb-12', productList ? 'grid-cols-1 gap-4 md:grid-cols-4' : 'grid-cols-2 gap-6 md:grid-cols-12', cart && 'md:grid-cols-[1.4fr_1fr_1fr_1fr]', home && 'lg:pb-16', productDetail && 'max-lg:gap-3 max-lg:pb-3')}>
          <div className={cn('space-y-3', productList ? 'col-span-1' : cart ? 'col-span-2 md:col-span-1' : 'col-span-2 md:col-span-5', home && 'max-md:hidden')}>
            <p className={cn('text-sm font-semibold tracking-wider text-text-primary', home && 'text-base font-bold tracking-widest')}>FASHION SHOP</p>
            <p className={cn('max-w-sm leading-relaxed', productDetail && 'max-lg:hidden', productList && 'text-xs')}>
              Bộ sưu tập trang phục và phụ kiện tinh giản với hình thái tối giản, chất liệu chọn lọc và phom dáng chuẩn mực.
            </p>
          </div>
          {!cart ? (
            <div className={cn('space-y-3', productList ? 'col-span-1' : 'md:col-span-3', productDetail && 'max-lg:col-span-2')}>
              <p className={cn('text-xs font-semibold uppercase tracking-widest text-text-primary', home && 'md:text-base md:font-medium md:normal-case md:tracking-tight', productList && 'max-md:sr-only', productDetail && 'max-lg:sr-only')}>Danh mục</p>
              <ul className={cn('space-y-2.5', productList && compactLinks, productDetail && 'max-lg:flex max-lg:flex-wrap max-lg:gap-x-5 max-lg:gap-y-2 max-lg:space-y-0 max-lg:text-xs')}>
                {catalogNavigation.map(({ slug, label, to }) => (
                  <li key={slug}><Link className="inline-flex py-0.5 transition-colors hover:text-brand-primary" to={to}>{label}</Link></li>
                ))}
              </ul>
            </div>
          ) : null}
          <div className={cn('space-y-3', productList || cart ? 'col-span-1' : 'md:col-span-4', productDetail && 'max-lg:hidden', productList && 'text-xs')}>
            <p className={cn('text-xs font-semibold uppercase tracking-widest text-text-primary', home && 'md:text-base md:font-medium md:normal-case md:tracking-tight', productList && 'max-md:sr-only')}>Dịch vụ khách hàng</p>
            <ul className={cn('space-y-2.5', productList && compactLinks)}>
              {serviceLinks.map(({ label, to }) => (
                <li key={to}><Link className="inline-flex py-0.5 transition-colors hover:text-brand-primary" to={to}>{label}</Link></li>
              ))}
            </ul>
          </div>
          {cart ? (
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-text-primary">Chính sách</p>
              <Link className="inline-flex py-0.5 transition-colors hover:text-brand-primary" to={routes.shippingPolicy}>Chính sách giao hàng</Link>
            </div>
          ) : null}
          {cart ? (
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-text-primary">Tiền tệ & khu vực</p>
              <p className="text-xs leading-relaxed">Việt Nam / VND</p>
            </div>
          ) : null}
          {productList ? (
            <div className="hidden space-y-3 md:block">
              <p className="text-xs font-semibold uppercase tracking-widest text-text-primary">Ghi chú cửa hàng</p>
              <p className="text-xs leading-relaxed">Sản phẩm hiển thị theo đơn vị tiền tệ VND.</p>
            </div>
          ) : null}
        </div>
        <div className="flex flex-col gap-2 pb-8 text-xs text-outline md:flex-row md:items-center md:justify-between md:border-t md:border-border md:pb-0 md:pt-8">
          <p>© {new Date().getFullYear()} Fashion Shop. Bảo lưu mọi quyền.</p>
          {!productList && !cart ? <p className={cn('hidden md:block', productDetail && 'max-lg:hidden')}>Sản phẩm hiển thị theo đơn vị tiền tệ VND.</p> : null}
        </div>
      </div>
    </footer>
  );
};
