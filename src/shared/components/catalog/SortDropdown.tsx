import type { ChangeEvent } from 'react';

import { SORT_OPTIONS } from '@/shared/types/enums';

type SortDropdownProps = {
  value: string;
  onChange: (value: string) => void;
};

const options = [
  { value: SORT_OPTIONS.FEATURED, label: 'Featured' },
  { value: SORT_OPTIONS.NEWEST, label: 'Newest' },
  { value: SORT_OPTIONS.PRICE_ASC, label: 'Price: Low to High' },
  { value: SORT_OPTIONS.PRICE_DESC, label: 'Price: High to Low' },
  { value: SORT_OPTIONS.RATING, label: 'Top Rated' },
];

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
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
};
