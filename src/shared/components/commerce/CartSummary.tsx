import { useState } from 'react';
import type { ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';

import { cn } from '@/shared/utils/cn';
import type { CartItem, CartTotals } from '@/shared/types/commerce.types';
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
  items?: readonly CartItem[];
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
  items,
  variant = 'cart',
  isTotalsUpdating = false,
  valueOverrides,
}: CartSummaryProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const isCartSummary = variant === 'cart';
  const formatTotal = formatVnd;

  return (
    <aside className={cn('lg:sticky lg:top-28', summaryShellClasses[variant], className)}>
    {eyebrow ? <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-outline">{eyebrow}</p> : null}
    <div className={cn('flex items-center justify-between gap-4', isCartSummary ? 'mt-0' : 'mt-2')}>
      <h2 className={cn(
        'leading-tight text-text-primary',
        isCartSummary ? 'text-base font-semibold uppercase tracking-[0.08em] md:text-lg' : 'text-xs font-semibold uppercase tracking-wider',
      )}>{title}</h2>
      {variant !== 'cart' ? (
        <button
          aria-expanded={!collapsed}
          className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-text-primary md:hidden"
          onClick={() => setCollapsed((current) => !current)}
          type="button"
        >
          Chi tiết
          <ChevronDown className={cn('h-4 w-4 transition-transform', !collapsed && 'rotate-180')} />
        </button>
      ) : null}
      {isCartSummary ? <p className="shrink-0 text-xs font-medium text-text-secondary sm:text-sm">Đơn vị: VND</p> : null}
    </div>
    <div className={cn(collapsed && variant !== 'cart' ? 'hidden md:block' : 'block')}>
      {items?.length ? (
        <ul className="mt-4 divide-y divide-border border-y border-border">
          {items.map((item) => (
            <li className="grid grid-cols-[48px_minmax(0,1fr)_auto] items-start gap-3 py-3 text-xs" key={item.id}>
              <img alt={item.primaryImage.alt} className="aspect-[3/4] w-12 rounded-sm object-cover" height={64} src={item.primaryImage.src} width={48} />
              <div className="min-w-0">
                <p className="font-medium text-text-primary">{item.productName}</p>
                <p className="mt-1 text-text-secondary">{item.variantName || [item.color, item.size].filter(Boolean).join(' / ')} · SL {item.quantity}</p>
              </div>
              <span className="font-medium text-text-primary">{formatVnd(item.subtotal)}</span>
            </li>
          ))}
        </ul>
      ) : null}
      {description ? <p className="mt-3 text-sm leading-7 text-text-secondary">{description}</p> : null}
      {supplementary ? <div className="mt-6 border-y border-border py-4">{supplementary}</div> : null}
      <dl aria-busy={isTotalsUpdating} aria-live={variant === 'cart' ? undefined : 'polite'} className={cn('mt-6', isCartSummary ? 'space-y-0' : 'space-y-4')}>
      <div className={cn('flex items-center justify-between gap-4 text-sm', isCartSummary && 'pb-4')}>
        <dt className="text-text-secondary">Sản phẩm</dt>
        <dd className="font-medium text-text-primary">{totals.totalItems}</dd>
      </div>
      {!isCartSummary ? (
        <div className="flex items-center justify-between gap-4 text-sm">
          <dt className="text-text-secondary">Tạm tính</dt>
          <dd className="font-medium text-text-primary">{formatTotal(totals.subTotal)}</dd>
        </div>
      ) : null}
      {!isCartSummary ? (
        <>
          <div className="flex items-center justify-between gap-4 text-sm">
            <dt className="uppercase tracking-[0.12em] text-text-secondary">Phí vận chuyển</dt>
            <dd className="font-medium text-text-primary">{valueOverrides?.shippingFee ?? formatVnd(totals.shippingFee)}</dd>
          </div>
          <div className="flex items-center justify-between gap-4 text-sm">
            <dt className="uppercase tracking-[0.12em] text-text-secondary">Ưu đãi</dt>
            <dd className="font-medium text-text-primary">{valueOverrides?.discountTotal ?? (totals.discountTotal === 0 ? formatVnd(0) : `-${formatVnd(totals.discountTotal)}`)}</dd>
          </div>
        </>
      ) : null}
      <div className={cn('flex items-end justify-between gap-4 border-t border-border', isCartSummary ? 'pt-4' : 'pt-5')}>
        <dt className={cn('font-semibold text-text-primary', isCartSummary ? 'text-base' : 'text-sm')}>{isCartSummary ? 'Tạm tính' : 'Tổng thanh toán'}</dt>
        <dd className={cn('font-semibold leading-none text-text-primary', isCartSummary && 'text-lg md:text-xl')}>{valueOverrides?.grandTotal ?? formatTotal(isCartSummary ? totals.subTotal : totals.grandTotal)}</dd>
      </div>
      </dl>
      {footer ? <div className="mt-7">{footer}</div> : null}
    </div>
    </aside>
  );
};
