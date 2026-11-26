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
    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
      <span className="hidden text-xs font-medium uppercase tracking-wide text-text-secondary lg:inline">Đang chọn:</span>
      {chips.map((chip) => (
        <button
          className="inline-flex min-h-8 max-w-full items-center gap-1.5 rounded-[3px] bg-surface-soft px-2.5 py-1 text-left text-xs font-medium text-text-primary lg:bg-canvas"
          aria-label={`Xóa bộ lọc ${chip.label}`}
          key={chip.key}
          onClick={() => onRemove(chip.key)}
          type="button"
        >
          <span className="min-w-0 [overflow-wrap:anywhere]">{chip.label}</span>
          <X aria-hidden="true" className="size-3.5 shrink-0" />
        </button>
      ))}
      <button className="min-h-11 text-xs text-text-secondary underline underline-offset-4 hover:text-text-primary" onClick={onClear} type="button">
        Xóa bộ lọc
      </button>
    </div>
  );
};
