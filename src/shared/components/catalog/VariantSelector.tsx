import { cn } from '@/shared/utils/cn';

type VariantSelectorProps = {
  colors: string[];
  sizes: string[];
  selectedColor: string;
  selectedSize: string;
  colorSwatches: Record<string, string>;
  onSelectColor: (value: string) => void;
  onSelectSize: (value: string) => void;
};

export const VariantSelector = ({
  colorSwatches,
  colors,
  onSelectColor,
  onSelectSize,
  selectedColor,
  selectedSize,
  sizes,
}: VariantSelectorProps) => (
  <div className="space-y-8">
    {colors.length > 1 ? (
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-text-primary">Select Color</p>
        <div className="mt-4 flex flex-wrap gap-3">
          {colors.map((color) => (
            <button
              aria-pressed={selectedColor === color}
              className={cn(
                'inline-flex items-center gap-3 border px-4 py-3 text-[11px] font-bold uppercase tracking-[0.16em] transition-colors',
                selectedColor === color ? 'border-text-primary bg-text-primary text-surface' : 'border-border text-text-primary hover:border-text-primary',
              )}
              key={color}
              onClick={() => onSelectColor(color)}
              type="button"
            >
              <span
                aria-hidden="true"
                className="h-3.5 w-3.5 rounded-full border border-black/10"
                style={{ backgroundColor: colorSwatches[color] }}
              />
              {color}
            </button>
          ))}
        </div>
      </div>
    ) : null}
    <div>
      <div className="flex items-end justify-between gap-4 border-b border-border pb-2">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-text-primary">Select Size</p>
        <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-text-secondary">Size Guide</span>
      </div>
      <div className="mt-4 grid grid-cols-4 gap-2">
        {sizes.map((size) => (
          <button
            aria-pressed={selectedSize === size}
            className={cn(
              'border py-3 text-base transition-colors',
              selectedSize === size ? 'border-text-primary bg-text-primary text-surface' : 'border-border text-text-primary hover:border-text-primary',
            )}
            key={size}
            onClick={() => onSelectSize(size)}
            type="button"
          >
            {size}
          </button>
        ))}
      </div>
    </div>
  </div>
);
