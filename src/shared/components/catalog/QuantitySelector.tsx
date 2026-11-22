import { Minus, Plus } from 'lucide-react';

type QuantitySelectorProps = {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  label?: string;
};

export const QuantitySelector = ({ disabled = false, label = 'quantity', onChange, value }: QuantitySelectorProps) => (
  <div className="inline-flex items-center border border-border bg-white">
    <button
      aria-label={`Decrease ${label}`}
      className="inline-flex h-11 w-11 items-center justify-center text-text-primary transition-colors hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-50"
      disabled={disabled || value <= 1}
      onClick={() => onChange(Math.max(1, value - 1))}
      type="button"
    >
      <Minus className="h-4 w-4" />
    </button>
    <span className="min-w-12 text-center text-sm">{value}</span>
    <button
      aria-label={`Increase ${label}`}
      className="inline-flex h-11 w-11 items-center justify-center text-text-primary transition-colors hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-50"
      disabled={disabled}
      onClick={() => onChange(value + 1)}
      type="button"
    >
      <Plus className="h-4 w-4" />
    </button>
  </div>
);
