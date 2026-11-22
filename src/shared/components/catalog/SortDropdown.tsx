import type { ChangeEvent } from 'react';

import { PRODUCT_SORT_OPTIONS } from '@/shared/lib/productSearch';

type SortDropdownProps = {
  value: string;
  onChange: (value: string) => void;
};

export const SortDropdown = ({ onChange, value }: SortDropdownProps) => {
  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    onChange(event.target.value);
  };

  return (
    <label className="flex items-center gap-2 text-sm text-text-secondary">
      <span>Sắp xếp</span>
      <select
        className="min-h-11 max-w-[180px] border border-border bg-surface px-3 text-sm font-medium text-text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
        onChange={handleChange}
        value={value}
      >
        {PRODUCT_SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
};
