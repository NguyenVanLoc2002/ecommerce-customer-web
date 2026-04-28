import { MapPin } from 'lucide-react';

import { PriceDisplay } from '@/shared/components/catalog/PriceDisplay';
import { QuantitySelector } from '@/shared/components/catalog/QuantitySelector';
import { VariantSelector } from '@/shared/components/catalog/VariantSelector';
import { Button } from '@/shared/components/ui/Button';
import type { ProductDetail } from '@/shared/types/catalog.types';

type PurchaseBlockProps = {
  colorSwatches: Record<string, string>;
  colors: string[];
  currentPrice: number;
  compareAtPrice?: number;
  product: ProductDetail;
  quantity: number;
  selectedColor: string;
  selectedSize: string;
  sizes: string[];
  onAddToCart: () => void;
  onQuantityChange: (value: number) => void;
  onSelectColor: (value: string) => void;
  onSelectSize: (value: string) => void;
};

export const PurchaseBlock = ({
  colorSwatches,
  colors,
  compareAtPrice,
  currentPrice,
  onAddToCart,
  onQuantityChange,
  onSelectColor,
  onSelectSize,
  product,
  quantity,
  selectedColor,
  selectedSize,
  sizes,
}: PurchaseBlockProps) => (
  <aside className="lg:sticky lg:top-32">
    <div className="space-y-10 border-l border-border pl-0 lg:pl-8">
      <header className="space-y-3">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-outline">Archive Series</p>
        <h1 className="font-display text-[3rem] leading-none text-text-primary md:text-[3.5rem]">{product.name}</h1>
        <p className="max-w-md text-sm leading-7 text-text-secondary">{product.subtitle}</p>
        <PriceDisplay compareAtPrice={compareAtPrice} price={currentPrice} size="lg" />
      </header>

      <VariantSelector
        colorSwatches={colorSwatches}
        colors={colors}
        onSelectColor={onSelectColor}
        onSelectSize={onSelectSize}
        selectedColor={selectedColor}
        selectedSize={selectedSize}
        sizes={sizes}
      />

      <div className="space-y-4">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-text-primary">Quantity</p>
        <QuantitySelector onChange={onQuantityChange} value={quantity} />
      </div>

      <div className="space-y-4 pt-2">
        <Button fullWidth onClick={onAddToCart} size="lg">
          Add to Bag
        </Button>
        <Button className="justify-between" fullWidth size="lg" variant="ghost">
          <MapPin className="h-4 w-4" />
          Find in Store
        </Button>
      </div>

      <div className="border-t border-border pt-8">
        <div className="flex items-center justify-between gap-4">
          <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-text-primary">Details & Composition</span>
          <span className="text-lg text-text-secondary">+</span>
        </div>
        <div className="mt-4 space-y-4 text-sm leading-7 text-text-secondary">
          <p>{product.description}</p>
          <p>Materials: {product.materials.join(', ')}.</p>
          <p>Care: {product.care.join(', ')}.</p>
        </div>
      </div>
    </div>
  </aside>
);
