import { X } from 'lucide-react';

type ActiveFilterChip = {
  key: string;
  label: string;
};

type ActiveFilterChipsProps = {
  chips: ActiveFilterChip[];
  onRemove: (key: string) => void;
  onClear: () => void;
};

export const ActiveFilterChips = ({ chips, onClear, onRemove }: ActiveFilterChipsProps) => {
  if (chips.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-text-secondary">Active Filters:</span>
      {chips.map((chip) => (
        <button
          className="inline-flex items-center gap-2 border border-border bg-surface-muted px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-text-primary"
          key={chip.key}
          onClick={() => onRemove(chip.key)}
          type="button"
        >
          {chip.label}
          <X className="h-4 w-4" />
        </button>
      ))}
      <button className="text-[10px] font-bold uppercase tracking-[0.18em] text-text-secondary underline-offset-4 hover:underline" onClick={onClear} type="button">
        Clear all
      </button>
    </div>
  );
};
