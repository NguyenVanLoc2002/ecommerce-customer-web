import type { ReactNode } from 'react';

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
}: CartSummaryProps) => (
  <aside className={cn('lg:sticky lg:top-28', summaryShellClasses[variant], className)}>
    {eyebrow ? <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-outline">{eyebrow}</p> : null}
    <h2 className="mt-2 font-display text-[2rem] leading-none text-text-primary">{title}</h2>
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
  </aside>
);
