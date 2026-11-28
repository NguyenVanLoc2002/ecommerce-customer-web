import { Minus, Plus } from 'lucide-react';

import { cn } from '@/shared/utils/cn';

type QuantitySelectorProps = {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  max?: number;
  label?: string;
  compact?: boolean;
  appearance?: 'cart' | 'product';
  variant?: 'default' | 'cart';
  labelledBy?: string;
};

export const QuantitySelector = ({
  appearance = 'cart',
  compact = false,
  disabled = false,
  label = 'quantity',
  labelledBy,
  max,
  onChange,
  value,
  variant = 'default',
}: QuantitySelectorProps) => {
  const decrementLabel = label.startsWith('quantity') ? `Decrease ${label}` : `Giảm ${label}`;
  const incrementLabel = label.startsWith('quantity') ? `Increase ${label}` : `Tăng ${label}`;
  const product = appearance === 'product';
  const cartVariant = !product && variant === 'cart';
  const controlWidthClassName = cartVariant ? 'w-10 sm:w-[34px]' : compact ? 'w-10' : 'w-11';
  const outputWidthClassName = product ? 'min-w-10 font-medium max-lg:text-base' : compact || cartVariant ? 'min-w-8' : 'min-w-12';

  return (
    <div
      aria-labelledby={labelledBy}
      className={cn(
        'inline-flex items-center',
        product && 'rounded bg-surface-muted lg:h-[52px] lg:w-36 lg:justify-between lg:rounded-sm lg:ring-1 lg:ring-border',
        cartVariant && 'shrink-0 rounded-[4px] border border-transparent bg-[rgb(var(--discovery-panel))] sm:rounded-chip sm:border-border',
        !product && !cartVariant && 'border border-border bg-surface',
      )}
      role="group"
    >
      <button
        aria-label={decrementLabel}
        className={`inline-flex h-11 ${controlWidthClassName} items-center justify-center text-text-primary transition-colors hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-50`}
        disabled={disabled || value <= 1}
        onClick={() => onChange(Math.max(1, value - 1))}
        type="button"
      >
        <Minus aria-hidden="true" className="h-4 w-4" />
      </button>
      <output aria-label="Số lượng hiện tại" aria-live="polite" className={`${outputWidthClassName} text-center text-sm`}>
        {value}
      </output>
      <button
        aria-label={incrementLabel}
        className={`inline-flex h-11 ${controlWidthClassName} items-center justify-center text-text-primary transition-colors hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-50`}
        disabled={disabled || (max !== undefined && value >= max)}
        onClick={() => onChange(value + 1)}
        type="button"
      >
        <Plus aria-hidden="true" className="h-4 w-4" />
      </button>
    </div>
  );
};
