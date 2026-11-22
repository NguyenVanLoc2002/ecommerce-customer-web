import { PriceDisplay } from '@/shared/components/catalog/PriceDisplay';
import { QuantitySelector } from '@/shared/components/catalog/QuantitySelector';
import { VariantSelector } from '@/shared/components/catalog/VariantSelector';
import { Button } from '@/shared/components/ui/Button';
import type { ProductDetail } from '@/shared/types/catalog.types';

type PurchaseBlockProps = {
  addToCartDisabled?: boolean;
  addToCartLabel?: string;
  selectedVariantId: string;
  currentPrice: number;
  compareAtPrice?: number;
  product: ProductDetail;
  quantity: number;
  onSelectVariant: (variantId: string) => void;
  onAddToCart: () => void;
  onQuantityChange: (value: number) => void;
};

export const PurchaseBlock = ({
  addToCartDisabled = false,
  addToCartLabel = 'Add to Bag',
  compareAtPrice,
  currentPrice,
  onAddToCart,
  onQuantityChange,
  onSelectVariant,
  product,
  quantity,
  selectedVariantId,
}: PurchaseBlockProps) => (
  <aside className="lg:sticky lg:top-32">
    <div className="space-y-8 border-t border-border pt-6 lg:sticky lg:top-28 lg:border-0 lg:pt-0">
      <header className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-primary">{product.brandName}</p>
        <h1 className="text-3xl font-semibold leading-tight text-text-primary md:text-4xl">{product.name}</h1>
        <p className="max-w-md text-base leading-7 text-text-secondary">{product.subtitle}</p>
        <PriceDisplay compareAtPrice={compareAtPrice} price={currentPrice} size="lg" />
      </header>

      <VariantSelector
        variants={product.variants}
        onSelectVariant={onSelectVariant}
        selectedVariantId={selectedVariantId}
      />

      <div className="space-y-4">
        <p className="text-sm font-semibold text-text-primary">Số lượng</p>
        <QuantitySelector onChange={onQuantityChange} value={quantity} />
      </div>

      <div className="space-y-4 pt-2">
        <Button disabled={addToCartDisabled} fullWidth onClick={onAddToCart} size="lg">
          {addToCartLabel}
        </Button>
        <Button className="justify-between" fullWidth size="lg" variant="ghost">
          Chi tiết sản phẩm
        </Button>
      </div>

      <div className="border-t border-border pt-8">
        <div className="flex items-center justify-between gap-4">
          <span className="text-sm font-semibold text-text-primary">Mô tả sản phẩm</span>
          <span className="text-lg text-text-secondary">+</span>
        </div>
        <div className="mt-4 space-y-4 text-sm leading-7 text-text-secondary">
          <p>{product.description}</p>
        </div>
      </div>
    </div>
  </aside>
);
