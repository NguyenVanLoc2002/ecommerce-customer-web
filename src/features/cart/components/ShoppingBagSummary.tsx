import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

import { routes } from '@/constants/routes';
import { Button } from '@/shared/components/ui/Button';
import { FreeShippingProgress } from '@/features/cart/components/FreeShippingProgress';
import type { StorefrontPricing } from '@/shared/types/commerce.types';
import { formatVatSummary } from '@/shared/utils/formatVatSummary';
import { formatVnd } from '@/shared/utils/formatVnd';

type ShoppingBagSummaryProps = StorefrontPricing & {
  isUpdating: boolean;
  hasStaleItems: boolean;
  subtotal: number;
  onCheckout: () => void;
};

export const ShoppingBagSummary = ({ freeShipping, hasStaleItems, isUpdating, onCheckout, subtotal, vatSummary }: ShoppingBagSummaryProps) => {
  const vatLabel = formatVatSummary(vatSummary);

  return (
    <aside aria-labelledby="shopping-bag-summary" className="flex min-w-0 flex-col gap-4 lg:sticky lg:top-24 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:gap-0 lg:rounded-chip lg:border lg:border-border lg:bg-surface lg:p-6 lg:shadow-subtle">
      <div className="rounded-feature bg-surface p-4 shadow-subtle lg:p-0 lg:shadow-none">
        <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1 lg:border-b lg:border-border/70 lg:pb-4">
          <h2 className="text-[13px] font-bold uppercase leading-tight text-text-primary lg:text-base lg:font-semibold lg:tracking-wide" id="shopping-bag-summary">
            Tóm tắt đơn hàng
          </h2>
          <p className="text-[11px] font-medium text-text-secondary lg:hidden">Đơn vị: VND</p>
        </div>
        <dl aria-busy={isUpdating} aria-live="polite" className="mt-4 flex flex-col gap-3 text-[13px] lg:mt-5 lg:gap-4">
          <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-1">
            <dt className="text-text-secondary">Tạm tính</dt>
            <dd className="font-medium text-text-primary">{formatVnd(subtotal)}</dd>
          </div>
          <div className="order-2 flex flex-wrap items-baseline justify-between gap-x-2 gap-y-1 lg:order-1">
            <dt className="text-text-secondary">Phí giao hàng dự tính</dt>
            <dd className="text-right text-xs text-text-secondary">
              Được tính ở bước giao hàng
              <Link className="mt-1 block underline underline-offset-4 hover:text-text-primary" to={routes.shippingPolicy}>Chính sách giao hàng</Link>
            </dd>
          </div>
          {vatLabel ? (
            <div className="order-1 flex flex-wrap items-baseline justify-between gap-x-2 gap-y-1 lg:order-2">
              <dt className="text-text-secondary">Thuế GTGT (VAT)</dt>
              <dd className="text-right text-xs text-text-secondary">{vatLabel}</dd>
            </div>
          ) : null}
          <div className="order-3 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 border-t border-border pt-4 lg:pt-5">
            <dt className="font-bold text-text-primary lg:font-semibold lg:uppercase">Tổng tạm tính</dt>
            <dd className="text-lg font-bold leading-tight text-text-primary lg:text-xl">{formatVnd(subtotal)}</dd>
          </div>
        </dl>
        <p className="mt-1 text-xs leading-5 text-text-secondary">Chưa bao gồm phí giao hàng và ưu đãi</p>
        {freeShipping ? <FreeShippingProgress progress={freeShipping} /> : null}
      </div>
      <Button
        className="!h-[50px] !rounded-[4px] !border-transparent !bg-[rgb(var(--discovery-control))] !px-3 !text-[13px] !font-semibold uppercase !tracking-wide hover:!bg-text-primary active:!bg-text-primary lg:mt-7 lg:!h-12 lg:!rounded-chip lg:!tracking-[0.15em]"
        disabled={hasStaleItems || isUpdating}
        fullWidth
        onClick={onCheckout}
        size="lg"
      >
        Tiến hành đặt hàng
        <ArrowRight aria-hidden="true" className="size-4 shrink-0" />
      </Button>
      {hasStaleItems ? <p className="text-sm leading-6 text-danger lg:mt-3" role="status">Hãy cập nhật giỏ hàng trước khi đặt hàng.</p> : null}
    </aside>
  );
};
