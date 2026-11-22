import type { ProductVariant } from '@/shared/types/catalog.types';
import { formatVnd } from '@/shared/utils/formatVnd';

type VariantSelectorProps = {
  variants: ProductVariant[];
  selectedVariantId: string;
  onSelectVariant: (variantId: string) => void;
};

const getVariantLabel = (variant: ProductVariant) =>
  variant.attributes.map((attribute) => `${attribute.attributeName}: ${attribute.displayValue}`).filter(Boolean).join(' · ') || variant.sku || 'Phiên bản';

export const VariantSelector = ({ variants, selectedVariantId, onSelectVariant }: VariantSelectorProps) => {
  if (variants.length === 0) {
    return <p className="text-sm text-text-secondary" role="status">Sản phẩm hiện chưa có phiên bản để đặt mua.</p>;
  }

  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-semibold text-text-primary">Chọn phiên bản</legend>
      <div className="grid gap-2 sm:grid-cols-2">
        {variants.map((variant) => {
          const selected = variant.id === selectedVariantId;
          const disabled = variant.status?.toUpperCase() === 'INACTIVE';

          return (
            <button
              aria-pressed={selected}
              className={`min-h-12 border p-3 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary ${selected ? 'border-brand-primary bg-brand-subtle' : 'border-border hover:border-brand-primary'}`}
              disabled={disabled}
              key={variant.id}
              onClick={() => onSelectVariant(variant.id)}
              type="button"
            >
              <span className="block text-sm font-medium">{getVariantLabel(variant)}</span>
              <span className="mt-1 block text-sm text-text-secondary">{formatVnd(variant.price)}</span>
              {disabled ? <span className="mt-1 block text-xs text-text-secondary">Tạm ngừng bán</span> : null}
            </button>
          );
        })}
      </div>
      <p className="text-xs text-text-secondary">Tình trạng tồn kho sẽ được xác nhận khi thêm vào giỏ hàng.</p>
    </fieldset>
  );
};
