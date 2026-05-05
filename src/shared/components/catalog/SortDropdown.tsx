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
    <label className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-[0.18em] text-text-secondary">
      <span>Sort By</span>
      <select
        className="h-11 border-0 bg-transparent px-0 text-[10px] font-bold uppercase tracking-[0.18em] text-text-primary focus:outline-none focus:ring-0"
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
