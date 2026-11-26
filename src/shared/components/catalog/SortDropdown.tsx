import { ChevronDown } from 'lucide-react';

import { PRODUCT_SORT_OPTIONS } from '@/shared/lib/productSearch';

type SortDropdownProps = {
  value: string;
  onChange: (value: string) => void;
};

export const SortDropdown = ({ onChange, value }: SortDropdownProps) => (
  <label className="relative flex min-w-0 items-center gap-1.5 rounded bg-surface px-3 text-xs text-text-secondary focus-within:outline focus-within:outline-2 focus-within:outline-brand-primary lg:gap-2 lg:bg-transparent lg:px-0">
    <span className="shrink-0">Sắp xếp:</span>
    <select
      className="min-h-11 min-w-0 flex-1 cursor-pointer appearance-none bg-transparent pr-5 font-medium text-text-primary focus:outline-none lg:min-h-9 lg:rounded lg:bg-surface lg:pl-2.5 lg:pr-8 lg:text-sm"
      onChange={(event) => onChange(event.target.value)}
      value={value}
    >
      {PRODUCT_SORT_OPTIONS.map((option) => (
        <option key={option.value} value={option.value}>{option.label}</option>
      ))}
    </select>
    <ChevronDown aria-hidden="true" className="pointer-events-none absolute right-2 size-4" />
  </label>
);
