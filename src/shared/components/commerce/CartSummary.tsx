import { useState } from 'react';
import type { ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';

import { cn } from '@/shared/utils/cn';
import type { CartTotals } from '@/shared/types/commerce.types';
import { formatMoney } from '@/shared/utils/formatMoney';

type CartSummaryProps = {
  title?: string;
  description?: string;
  totals: CartTotals;
  footer?: ReactNode;
  eyebrow?: string;
  supplementary?: ReactNode;
  variant?: 'cart' | 'checkout' | 'order';
  className?: string;
};

const summaryShellClasses: Record<NonNullable<CartSummaryProps['variant']>, string> = {
  cart: 'border border-border bg-surface-muted/55 px-5 py-6 md:px-6',
  checkout: 'border border-border bg-surface px-5 py-6 md:px-6',
  order: 'border border-border bg-surface px-5 py-6 md:px-6',
};

export const CartSummary = ({
  className,
  description,
  eyebrow,
  footer,
  supplementary,
  title = 'Order summary',
  totals,
  variant = 'cart',
}: CartSummaryProps) => {
  const [collapsed, setCollapsed] = useState(variant !== 'cart');

  return (
    <aside className={cn('lg:sticky lg:top-28', summaryShellClasses[variant], className)}>
    {eyebrow ? <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-outline">{eyebrow}</p> : null}
    <div className="mt-2 flex items-center justify-between gap-4">
      <h2 className="font-display text-[2rem] leading-none text-text-primary">{title}</h2>
      {variant !== 'cart' ? (
        <button
          aria-expanded={!collapsed}
          className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-text-primary md:hidden"
          onClick={() => setCollapsed((current) => !current)}
          type="button"
        >
          Details
          <ChevronDown className={cn('h-4 w-4 transition-transform', !collapsed && 'rotate-180')} />
        </button>
      ) : null}
    </div>
    <div className={cn(collapsed && variant !== 'cart' ? 'hidden md:block' : 'block')}>
      {description ? <p className="mt-3 text-sm leading-7 text-text-secondary">{description}</p> : null}
      {supplementary ? <div className="mt-6 border-y border-border py-4">{supplementary}</div> : null}
      <dl className="mt-6 space-y-4">
      <div className="flex items-center justify-between gap-4 text-sm">
        <dt className="uppercase tracking-[0.12em] text-text-secondary">Items</dt>
        <dd className="font-medium text-text-primary">{totals.totalItems}</dd>
      </div>
      <div className="flex items-center justify-between gap-4 text-sm">
        <dt className="uppercase tracking-[0.12em] text-text-secondary">Subtotal</dt>
        <dd className="font-medium text-text-primary">{formatMoney(totals.subTotal)}</dd>
      </div>
      <div className="flex items-center justify-between gap-4 text-sm">
        <dt className="uppercase tracking-[0.12em] text-text-secondary">Shipping</dt>
        <dd className="font-medium text-text-primary">{totals.shippingFee === 0 ? 'Included' : formatMoney(totals.shippingFee)}</dd>
      </div>
      <div className="flex items-center justify-between gap-4 text-sm">
        <dt className="uppercase tracking-[0.12em] text-text-secondary">Discount</dt>
        <dd className="font-medium text-text-primary">{totals.discountTotal === 0 ? '$0' : `-${formatMoney(totals.discountTotal)}`}</dd>
      </div>
      <div className="flex items-end justify-between gap-4 border-t border-border pt-5">
        <dt className="text-[11px] font-bold uppercase tracking-[0.18em] text-text-primary">Total</dt>
        <dd className="font-display text-[2rem] leading-none text-text-primary">{formatMoney(totals.grandTotal)}</dd>
      </div>
      </dl>
      {footer ? <div className="mt-7">{footer}</div> : null}
    </div>
    </aside>
  );
};
