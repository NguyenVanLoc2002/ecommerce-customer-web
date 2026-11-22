import { PriceDisplay } from '@/shared/components/catalog/PriceDisplay';
import { QuantitySelector } from '@/shared/components/catalog/QuantitySelector';
import { VariantSelector } from '@/shared/components/catalog/VariantSelector';
import { Button } from '@/shared/components/ui/Button';
import { Plus } from 'lucide-react';
import type { VariantAttributeGroup, VariantSelectionResult } from '@/features/products/utils/variantSelection';
import type { ProductDetail } from '@/shared/types/catalog.types';
import type { RefObject } from 'react';

type PurchaseBlockProps = {
  addToCartDisabled: boolean;
  addToCartLabel: string;
  addToCartLoading: boolean;
  selection: VariantSelectionResult;
  groups: VariantAttributeGroup[];
  selectedValues: Record<string, string>;
  currentPrice?: number;
  compareAtPrice?: number;
  product: ProductDetail;
  quantity: number;
  addError?: string;
  purchaseActionRef: RefObject<HTMLDivElement>;
  onSelectValue: (attributeId: string, valueId: string) => void;
  onAddToCart: () => void;
  onQuantityChange: (value: number) => void;
};

export const PurchaseBlock = ({
  addError,
  addToCartDisabled,
  addToCartLabel,
  addToCartLoading,
  compareAtPrice,
  currentPrice,
  groups,
  onAddToCart,
  onQuantityChange,
  onSelectValue,
  product,
  purchaseActionRef,
  quantity,
  selectedValues,
  selection,
}: PurchaseBlockProps) => (
  <aside className="lg:sticky lg:top-32">
    <div className="space-y-8 border-t border-border pt-6 lg:border-0 lg:pt-0">
      <header className="space-y-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">{product.brandName}</p>
        <h1 className="break-words text-[28px] font-medium leading-[1.2] tracking-tight text-text-primary md:text-[40px]">{product.name}</h1>
        {currentPrice !== undefined ? (
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            {selection.status !== 'active' && selection.status !== 'inactive' ? <span className="text-sm text-text-secondary">Giá từ</span> : null}
            <PriceDisplay align="left" compareAtPrice={compareAtPrice} price={currentPrice} size="lg" />
          </div>
        ) : <p className="text-sm text-text-secondary">Chọn phân loại để xem giá.</p>}
        {product.subtitle ? <p className="max-w-prose text-base leading-7 text-text-secondary md:hidden">{product.subtitle}</p> : null}
      </header>

      <VariantSelector
        groups={groups}
        onSelectValue={onSelectValue}
        selectedValues={selectedValues}
        selection={selection}
        variants={product.variants}
      />

      <div className="space-y-3">
        <p className="text-sm font-semibold text-text-primary" id="product-quantity-label">Số lượng</p>
        <QuantitySelector labelledBy="product-quantity-label" onChange={onQuantityChange} value={quantity} />
      </div>

      {addError ? <p aria-live="assertive" className="border border-danger/30 bg-danger/5 p-3 text-sm leading-6 text-danger" role="alert">{addError}</p> : null}

      <div ref={purchaseActionRef}>
        <Button
          className="!border-text-primary !bg-text-primary uppercase tracking-[0.18em] !text-surface transition-[transform,background-color,border-color] duration-500 hover:!border-text-secondary hover:!bg-text-secondary hover:scale-[1.02] motion-reduce:transform-none"
          disabled={addToCartDisabled}
          fullWidth
          loading={addToCartLoading}
          onClick={onAddToCart}
          size="lg"
        >
          {addToCartLabel}
        </Button>
      </div>

      {product.description ? (
        <details className="group border-t border-border pt-8" open>
          <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary [&::-webkit-details-marker]:hidden">
            <span>Chi tiết sản phẩm</span>
            <Plus aria-hidden="true" className="h-4 w-4 shrink-0 transition-transform duration-300 group-open:rotate-45 motion-reduce:transition-none" strokeWidth={1.5} />
          </summary>
          <p className="max-w-prose pb-5 pt-5 text-base leading-7 text-text-secondary">{product.description}</p>
        </details>
      ) : null}
    </div>
  </aside>
);
