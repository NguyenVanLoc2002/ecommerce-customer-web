import { Minus, Plus } from 'lucide-react';

type QuantitySelectorProps = {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  label?: string;
  compact?: boolean;
  labelledBy?: string;
};

export const QuantitySelector = ({
  compact = false,
  disabled = false,
  label = 'quantity',
  labelledBy,
  onChange,
  value,
}: QuantitySelectorProps) => {
  const decrementLabel = label.startsWith('quantity') ? `Decrease ${label}` : `Giảm ${label}`;
  const incrementLabel = label.startsWith('quantity') ? `Increase ${label}` : `Tăng ${label}`;
  const controlWidthClassName = compact ? 'w-10' : 'w-11';

  return (
    <div aria-labelledby={labelledBy} className="inline-flex items-center border border-border bg-surface" role="group">
      <button
        aria-label={decrementLabel}
        className={`inline-flex h-11 ${controlWidthClassName} items-center justify-center text-text-primary transition-colors hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-50`}
        disabled={disabled || value <= 1}
        onClick={() => onChange(Math.max(1, value - 1))}
        type="button"
      >
        <Minus aria-hidden="true" className="h-4 w-4" />
      </button>
      <output aria-label="Số lượng hiện tại" aria-live="polite" className={`${compact ? 'min-w-8' : 'min-w-12'} text-center text-sm`}>
        {value}
      </output>
      <button
        aria-label={incrementLabel}
        className={`inline-flex h-11 ${controlWidthClassName} items-center justify-center text-text-primary transition-colors hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-50`}
        disabled={disabled}
        onClick={() => onChange(value + 1)}
        type="button"
      >
        <Plus aria-hidden="true" className="h-4 w-4" />
      </button>
    </div>
  );
};
