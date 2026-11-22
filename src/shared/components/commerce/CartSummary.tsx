import { useState } from 'react';
import type { ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';

import { cn } from '@/shared/utils/cn';
import type { CartTotals } from '@/shared/types/commerce.types';
import { formatMoney } from '@/shared/utils/formatMoney';
import { formatVnd } from '@/shared/utils/formatVnd';

export type CartSummaryValueOverrides = Partial<{
  shippingFee: ReactNode;
  discountTotal: ReactNode;
  grandTotal: ReactNode;
}>;

type CartSummaryProps = {
  title?: string;
  description?: string;
  totals: CartTotals;
  footer?: ReactNode;
  eyebrow?: string;
  supplementary?: ReactNode;
  variant?: 'cart' | 'checkout' | 'order';
  className?: string;
  isTotalsUpdating?: boolean;
  valueOverrides?: CartSummaryValueOverrides;
};

const summaryShellClasses: Record<NonNullable<CartSummaryProps['variant']>, string> = {
  cart: 'rounded-feature border border-border/70 bg-surface px-5 py-6 shadow-subtle md:px-6 md:py-7',
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
  isTotalsUpdating = false,
  valueOverrides,
}: CartSummaryProps) => {
  const [collapsed, setCollapsed] = useState(variant !== 'cart');
  const isCartSummary = variant === 'cart';
  const formatTotal = isCartSummary ? formatVnd : formatMoney;

  return (
    <aside className={cn('lg:sticky lg:top-28', summaryShellClasses[variant], className)}>
    {eyebrow ? <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-outline">{eyebrow}</p> : null}
    <div className={cn('flex items-center justify-between gap-4', isCartSummary ? 'mt-0' : 'mt-2')}>
      <h2 className={cn(
        'leading-tight text-text-primary',
        isCartSummary ? 'text-base font-semibold uppercase tracking-[0.08em] md:text-lg' : 'font-display text-[2rem] leading-none',
      )}>{title}</h2>
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
      {isCartSummary ? <p className="shrink-0 text-xs font-medium text-text-secondary sm:text-sm">Đơn vị: VND</p> : null}
    </div>
    <div className={cn(collapsed && variant !== 'cart' ? 'hidden md:block' : 'block')}>
      {description ? <p className="mt-3 text-sm leading-7 text-text-secondary">{description}</p> : null}
      {supplementary ? <div className="mt-6 border-y border-border py-4">{supplementary}</div> : null}
      <dl aria-busy={isTotalsUpdating} aria-live={variant === 'cart' ? undefined : 'polite'} className={cn('mt-6', isCartSummary ? 'space-y-0' : 'space-y-4')}>
      <div className={cn('flex items-center justify-between gap-4 text-sm', isCartSummary && 'pb-4')}>
        <dt className="text-text-secondary">{isCartSummary ? 'Sản phẩm' : 'Items'}</dt>
        <dd className="font-medium text-text-primary">{totals.totalItems}</dd>
      </div>
      {!isCartSummary ? (
        <div className="flex items-center justify-between gap-4 text-sm">
          <dt className="text-text-secondary">Subtotal</dt>
          <dd className="font-medium text-text-primary">{formatTotal(totals.subTotal)}</dd>
        </div>
      ) : null}
      {!isCartSummary ? (
        <>
          <div className="flex items-center justify-between gap-4 text-sm">
            <dt className="uppercase tracking-[0.12em] text-text-secondary">Shipping</dt>
            <dd className="font-medium text-text-primary">{valueOverrides?.shippingFee ?? (totals.shippingFee === 0 ? 'Included' : formatMoney(totals.shippingFee))}</dd>
          </div>
          <div className="flex items-center justify-between gap-4 text-sm">
            <dt className="uppercase tracking-[0.12em] text-text-secondary">Discount</dt>
            <dd className="font-medium text-text-primary">{valueOverrides?.discountTotal ?? (totals.discountTotal === 0 ? '$0' : `-${formatMoney(totals.discountTotal)}`)}</dd>
          </div>
        </>
      ) : null}
      <div className={cn('flex items-end justify-between gap-4 border-t border-border', isCartSummary ? 'pt-4' : 'pt-5')}>
        <dt className={cn('font-semibold text-text-primary', isCartSummary ? 'text-base' : 'text-sm')}>{isCartSummary ? 'Tạm tính' : 'Total'}</dt>
        <dd className={cn('font-semibold leading-none text-text-primary', isCartSummary && 'text-lg md:text-xl')}>{valueOverrides?.grandTotal ?? formatTotal(isCartSummary ? totals.subTotal : totals.grandTotal)}</dd>
      </div>
      </dl>
      {footer ? <div className="mt-7">{footer}</div> : null}
    </div>
    </aside>
  );
};
