import { PriceDisplay } from '@/shared/components/catalog/PriceDisplay';
import { QuantitySelector } from '@/shared/components/catalog/QuantitySelector';
import { VariantSelector } from '@/shared/components/catalog/VariantSelector';
import { Button } from '@/shared/components/ui/Button';
import { ChevronDown } from 'lucide-react';
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
  <aside className="lg:sticky lg:top-20">
    <div className="space-y-6 border-t border-border pt-6 lg:border-0 lg:pt-0">
      <header className="space-y-3">
        <p className="text-xs font-medium uppercase tracking-[0.12em] text-text-secondary">{product.brandName}</p>
        <h1 className="break-words text-[28px] font-semibold leading-[1.2] tracking-tight text-text-primary md:text-[30px]">{product.name}</h1>
        {currentPrice !== undefined ? (
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            {selection.status !== 'active' && selection.status !== 'inactive' ? <span className="text-sm text-text-secondary">Giá từ</span> : null}
            <PriceDisplay align="left" compareAtPrice={compareAtPrice} price={currentPrice} size="lg" />
          </div>
        ) : <p className="text-sm text-text-secondary">Chọn phân loại để xem giá.</p>}
        {product.subtitle ? <p className="max-w-prose pt-1 text-base leading-7 text-text-secondary">{product.subtitle}</p> : null}
      </header>

      <VariantSelector
        groups={groups}
        onSelectValue={onSelectValue}
        selectedValues={selectedValues}
        selection={selection}
        variants={product.variants}
      />

      {addError ? <p aria-live="assertive" className="border border-danger/30 bg-danger/5 p-3 text-sm leading-6 text-danger" role="alert">{addError}</p> : null}

      <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(128px,auto)_1fr] md:items-end">
        <div className="flex items-center justify-between md:block">
          <p className="mb-0 text-sm font-medium text-text-primary md:mb-3" id="product-quantity-label">Số lượng</p>
          <QuantitySelector labelledBy="product-quantity-label" onChange={onQuantityChange} value={quantity} />
        </div>
        <div ref={purchaseActionRef}>
        <Button
          className="!min-h-12 !rounded !border-text-primary !bg-text-primary text-sm !font-medium !tracking-normal !text-surface transition-colors duration-200 hover:!border-text-secondary hover:!bg-text-secondary motion-reduce:transition-none"
          disabled={addToCartDisabled}
          fullWidth
          loading={addToCartLoading}
          onClick={onAddToCart}
          size="lg"
        >
          {addToCartLabel}
        </Button>
        </div>
      </div>

      {product.description ? (
        <details className="group rounded bg-surface-muted p-4 md:rounded-none md:border-t md:bg-transparent md:p-0 md:pt-5" open>
          <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 py-1 text-sm font-semibold text-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary [&::-webkit-details-marker]:hidden">
            <span>Chi tiết sản phẩm &amp; Chất liệu</span>
            <ChevronDown aria-hidden="true" className="h-4 w-4 shrink-0 transition-transform duration-200 group-open:rotate-180 motion-reduce:transition-none" strokeWidth={1.5} />
          </summary>
          <div className="space-y-3 pb-1 pt-3 text-sm leading-6 text-text-secondary md:pb-5">
            <p>{product.description}</p>
            {product.materials.length > 0 ? <ul className="list-disc space-y-2 pl-5">{product.materials.map((material) => <li key={material}>{material}</li>)}</ul> : null}
            {product.care.length > 0 ? <ul className="list-disc space-y-2 pl-5">{product.care.map((careInstruction) => <li key={careInstruction}>{careInstruction}</li>)}</ul> : null}
          </div>
        </details>
      ) : null}
    </div>
  </aside>
);
