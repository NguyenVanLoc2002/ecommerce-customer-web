import { Link } from 'react-router-dom';

import { routes } from '@/constants/routes';
import { Container } from '@/shared/components/layout/Container';
import { SORT_OPTIONS } from '@/shared/types/enums';

const shopLinks = [
  { label: 'Sản phẩm mới', href: `${routes.products}?sort=${SORT_OPTIONS.NEWEST}` },
  { label: 'Tất cả sản phẩm', href: routes.products },
  { label: 'Nổi bật', href: `${routes.products}?sort=${SORT_OPTIONS.FEATURED}` },
];

const accountLinks = [
  { label: 'Đơn hàng', href: routes.orders },
  { label: 'Sổ địa chỉ', href: routes.profileAddresses },
  { label: 'Thông báo', href: routes.notifications },
];

const accessLinks = [
  { label: 'Đăng nhập', href: routes.login },
  { label: 'Tạo tài khoản', href: routes.register },
  { label: 'Hồ sơ', href: routes.profile },
];

const renderLinkGroup = (title: string, links: Array<{ label: string; href: string }>) => (
  <div className="space-y-5">
    <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-outline">{title}</h4>
    <div className="space-y-4">
      {links.map((link) => (
        <Link className="block text-sm text-text-secondary transition-colors hover:text-text-primary" key={link.label} to={link.href}>
          {link.label}
        </Link>
      ))}
    </div>
  </div>
);

export const Footer = () => (
  <footer className="border-t border-border bg-canvas pt-12 print:hidden md:pt-16">
    <Container className="grid gap-10 pb-12 sm:grid-cols-2 md:grid-cols-12 md:gap-x-12 md:pb-16">
      <div className="md:col-span-4">
        <span className="block font-display text-2xl font-semibold tracking-[0.12em] text-text-primary">FASHION SHOP</span>
        <p className="mt-5 max-w-xs text-sm leading-7 text-text-secondary">
          Khám phá những thiết kế được tuyển chọn, cùng trải nghiệm mua sắm rõ ràng và thuận tiện.
        </p>
      </div>
      <div className="md:col-span-2">{renderLinkGroup('Mua sắm', shopLinks)}</div>
      <div className="md:col-span-3">{renderLinkGroup('Tài khoản', accountLinks)}</div>
      <div className="md:col-span-3">
        <h4 className="text-sm font-medium text-text-primary">Truy cập</h4>
        <div className="mt-5 space-y-4">
          {accessLinks.map((link) => (
            <Link className="block text-sm text-text-secondary transition-colors hover:text-text-primary" key={link.label} to={link.href}>
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </Container>
    <Container className="flex flex-col gap-5 border-t border-border py-8 text-xs uppercase tracking-[0.18em] text-outline md:flex-row md:items-center md:justify-between">
      <p>© {new Date().getFullYear()} Fashion Shop</p>
      <p>Thời trang dành cho mỗi ngày</p>
    </Container>
  </footer>
);
