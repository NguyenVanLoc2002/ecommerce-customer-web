import { Minus, Plus } from 'lucide-react';

type QuantitySelectorProps = {
  value: number;
  onChange: (value: number) => void;
  labelledBy?: string;
};

export const QuantitySelector = ({ labelledBy, onChange, value }: QuantitySelectorProps) => (
  <div aria-labelledby={labelledBy} className="inline-flex items-center border border-border bg-surface" role="group">
    <button
      aria-label="Giảm số lượng"
      className="inline-flex h-11 w-11 items-center justify-center text-text-primary transition-colors hover:bg-surface-muted"
      onClick={() => onChange(Math.max(1, value - 1))}
      type="button"
    >
      <Minus className="h-4 w-4" />
    </button>
    <output aria-live="polite" className="min-w-12 text-center text-sm" aria-label="Số lượng hiện tại">{value}</output>
    <button
      aria-label="Tăng số lượng"
      className="inline-flex h-11 w-11 items-center justify-center text-text-primary transition-colors hover:bg-surface-muted"
      onClick={() => onChange(value + 1)}
      type="button"
    >
      <Plus className="h-4 w-4" />
    </button>
  </div>
);
