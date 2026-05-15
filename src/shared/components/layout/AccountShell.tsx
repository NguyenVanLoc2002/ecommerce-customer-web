import type { PropsWithChildren, ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';

import { getAccountNavItems, isAccountNavItemActive } from '@/shared/components/layout/accountNavigation';
import { cn } from '@/shared/utils/cn';

type AccountShellProps = PropsWithChildren<{
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
}>;

export const AccountShell = ({ actions, children, description, eyebrow, title }: AccountShellProps) => {
  const { pathname } = useLocation();
  const navItems = getAccountNavItems();

  return (
    <div className="flex flex-col gap-10 md:flex-row md:gap-16">
      <aside className="w-full md:w-64 md:flex-shrink-0">
        <div className="space-y-6 md:sticky md:top-[140px]">
          <h2 className="font-display text-[2rem] leading-none text-text-primary">Account</h2>
          <nav aria-label="Account">
            <ul className="flex gap-3 overflow-x-auto pb-2 md:block md:space-y-4 md:pb-0">
              {navItems.map((item) => {
                const isActive = isAccountNavItemActive(pathname, item);

                return (
                  <li className="min-w-max md:min-w-0" key={item.key}>
                    <Link
                      aria-current={isActive ? 'page' : undefined}
                      className={cn(
                        'block border px-4 py-3 text-[11px] font-bold uppercase tracking-[0.18em] transition-colors md:border-x-0 md:border-t-0 md:px-0 md:py-0 md:pb-2',
                        isActive
                          ? 'border-text-primary bg-surface text-text-primary md:bg-transparent'
                          : 'border-border bg-surface text-text-secondary hover:border-text-primary hover:text-text-primary md:border-transparent md:bg-transparent md:hover:border-border',
                      )}
                      to={item.to}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </aside>

      <section className="min-w-0 flex-1 space-y-8">
        <div className="border-b border-border pb-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-outline">{eyebrow}</p>
              <h1 className="mt-3 font-display text-[3rem] leading-none text-text-primary md:text-[4rem]">{title}</h1>
              <p className="mt-4 text-sm leading-7 text-text-secondary">{description}</p>
            </div>
            {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
          </div>
        </div>
        {children}
      </section>
    </div>
  );
};
