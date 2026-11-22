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
      <span className="text-sm font-medium text-text-secondary">Đang chọn:</span>
      {chips.map((chip) => (
        <button
          className="inline-flex min-h-11 items-center gap-2 border border-border bg-surface px-3 text-sm font-medium text-text-primary"
          aria-label={`Xóa bộ lọc ${chip.label}`}
          key={chip.key}
          onClick={() => onRemove(chip.key)}
          type="button"
        >
          {chip.label}
          <X aria-hidden="true" className="h-4 w-4" />
        </button>
      ))}
      <button className="min-h-11 text-sm font-medium text-text-secondary underline-offset-4 hover:underline" onClick={onClear} type="button">
        Xóa tất cả
      </button>
    </div>
  );
};
