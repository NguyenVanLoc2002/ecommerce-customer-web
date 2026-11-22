import { PriceDisplay } from '@/shared/components/catalog/PriceDisplay';
import { QuantitySelector } from '@/shared/components/catalog/QuantitySelector';
import { VariantSelector } from '@/shared/components/catalog/VariantSelector';
import { Button } from '@/shared/components/ui/Button';
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
  <aside className="lg:sticky lg:top-28">
    <div className="space-y-7 border-t border-border pt-6 lg:border-0 lg:pt-0">
      <header className="space-y-3">
        <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-brand-primary">{product.brandName}</p>
        <h1 className="break-words text-[28px] font-medium leading-9 text-text-primary md:text-[40px] md:leading-[50px]">{product.name}</h1>
        {currentPrice !== undefined ? (
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            {selection.status !== 'active' && selection.status !== 'inactive' ? <span className="text-sm text-text-secondary">Giá từ</span> : null}
            <PriceDisplay align="left" compareAtPrice={compareAtPrice} price={currentPrice} size="lg" />
          </div>
        ) : <p className="text-sm text-text-secondary">Chọn phân loại để xem giá.</p>}
        {product.subtitle ? <p className="max-w-prose text-base leading-7 text-text-secondary">{product.subtitle}</p> : null}
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
        <Button disabled={addToCartDisabled} fullWidth loading={addToCartLoading} onClick={onAddToCart} size="lg">
          {addToCartLabel}
        </Button>
      </div>

      {product.description ? (
        <details className="border-y border-border py-4">
          <summary className="min-h-11 cursor-pointer py-2 text-sm font-semibold text-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary">
            Chi tiết sản phẩm
          </summary>
          <p className="max-w-prose pb-2 pt-3 text-sm leading-7 text-text-secondary">{product.description}</p>
        </details>
      ) : null}
    </div>
  </aside>
);
