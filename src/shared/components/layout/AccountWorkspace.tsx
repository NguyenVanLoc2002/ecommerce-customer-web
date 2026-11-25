import type { PropsWithChildren, ReactNode } from 'react';
import { Bell, LockKeyhole, MapPin, Package, Star, UserRound } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

import { routes } from '@/constants/routes';
import { getAccountNavItems, isAccountNavItemActive } from '@/shared/components/layout/accountNavigation';
import { Container } from '@/shared/components/layout/Container';
import { Avatar } from '@/shared/components/ui/Avatar';
import { useAuthStore } from '@/shared/stores/authStore';
import { cn } from '@/shared/utils/cn';

import './accountWorkspace.css';

const navigation = {
  profile: { label: 'Hồ sơ cá nhân', shortLabel: 'Hồ sơ', Icon: UserRound },
  security: { label: 'Bảo mật tài khoản', shortLabel: 'Bảo mật', Icon: LockKeyhole },
  addresses: { label: 'Sổ địa chỉ', shortLabel: 'Sổ địa chỉ', Icon: MapPin },
  orders: { label: 'Đơn hàng của tôi', shortLabel: 'Đơn hàng', Icon: Package },
  reviews: { label: 'Đánh giá của tôi', shortLabel: 'Đánh giá', Icon: Star },
  notifications: { label: 'Thông báo', shortLabel: 'Thông báo', Icon: Bell },
};

type AccountWorkspaceProps = PropsWithChildren<{
  title: string;
  description: string;
  breadcrumbParent?: { label: string; to: string };
  actions?: ReactNode;
  sessionAction?: ReactNode;
  headingInPanel?: boolean;
}>;

export const AccountWorkspace = ({
  actions, breadcrumbParent, children, description, headingInPanel, sessionAction, title,
}: AccountWorkspaceProps) => {
  const { pathname } = useLocation();
  const user = useAuthStore((state) => state.user);
  const fullName = user ? [user.lastName, user.firstName].filter(Boolean).join(' ') || user.email : '';
  const navItems = getAccountNavItems();

  return (
    <Container className="account-workspace pb-16 pt-24 md:pb-20 md:pt-28">
      <nav aria-label="Đường dẫn" className="mb-5 flex flex-wrap items-center gap-2 text-xs text-text-secondary lg:mb-8">
        <Link className="hover:underline" to={routes.home}>Trang chủ</Link>
        <span aria-hidden="true">/</span>
        <Link className="hover:underline" to={routes.profile}>Tài khoản</Link>
        <span aria-hidden="true">/</span>
        {breadcrumbParent ? (
          <>
            <Link className="hover:underline" to={breadcrumbParent.to}>{breadcrumbParent.label}</Link>
            <span aria-hidden="true">/</span>
          </>
        ) : null}
        <span aria-current="page" className="font-medium text-text-primary">{title}</span>
      </nav>
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,3.4fr)] lg:gap-12">
        <aside className="min-w-0 lg:space-y-6">
          {user ? (
            <div className="hidden items-center gap-4 rounded-card border border-border bg-surface p-5 lg:flex">
              <div className="shrink-0"><Avatar name={fullName} src={user.avatarUrl} /></div>
              <div className="min-w-0 [overflow-wrap:anywhere]">
                <p className="text-sm font-semibold">{fullName}</p>
                <p className="mt-1 text-xs text-text-secondary">{user.email}</p>
                {user.loyaltyPoints != null ? (
                  <p className="mt-2 text-xs font-medium text-brand-primary">{user.loyaltyPoints} điểm tích lũy</p>
                ) : null}
              </div>
            </div>
          ) : null}
          <div className="min-w-0 lg:rounded-card lg:border lg:border-border lg:bg-surface lg:p-2">
            <nav aria-label="Tài khoản">
              <ul className="flex flex-wrap gap-2 lg:block lg:space-y-1">
                {navItems.map((item) => {
                  const { Icon, label, shortLabel } = navigation[item.key];
                  const active = isAccountNavItemActive(pathname, item);

                  return (
                    <li key={item.key}>
                      <Link
                        aria-current={active ? 'page' : undefined}
                        className={cn(
                          'flex min-h-11 items-center gap-2 rounded-button border px-3 text-xs transition-colors lg:gap-3 lg:border-transparent lg:text-sm',
                          active ? 'border-brand-primary bg-brand-subtle font-semibold text-brand-primary' :
                            'border-border bg-surface text-text-secondary hover:bg-surface-soft hover:text-text-primary',
                        )}
                        to={item.to}
                      >
                        <Icon aria-hidden="true" className="hidden h-[18px] w-[18px] shrink-0 lg:block" />
                        <span className="lg:hidden">{shortLabel}</span>
                        <span className="hidden lg:inline">{label}</span>
                        {active ? <span aria-hidden="true" className="ml-auto hidden h-1.5 w-1.5 rounded-full bg-brand-primary lg:block" /> : null}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
            {sessionAction ? <div className="mt-2 border-t border-border pt-2">{sessionAction}</div> : null}
          </div>
        </aside>
        <section className={cn('min-w-0', headingInPanel && 'rounded-card border border-border bg-surface')}>
          <header className={cn(
            'flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between',
            headingInPanel ? 'border-b border-border bg-surface-muted p-5 sm:p-8' : 'mb-6 lg:mb-8',
          )}>
            <div className="min-w-0">
              <h1 className={cn('font-semibold leading-tight tracking-tight text-text-primary', headingInPanel ? 'text-2xl' : 'text-[28px] sm:text-[32px]')}>{title}</h1>
              <p className="mt-2 max-w-prose text-sm leading-6 text-text-secondary">{description}</p>
            </div>
            {actions ? <div className="shrink-0">{actions}</div> : null}
          </header>
          {children}
        </section>
      </div>
    </Container>
  );
};
