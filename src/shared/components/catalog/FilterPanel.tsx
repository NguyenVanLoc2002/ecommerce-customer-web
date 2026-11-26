import { useEffect, useId, useState } from 'react';

import type { Brand, Category, ProductFilters } from '@/shared/types/catalog.types';
import { Button } from '@/shared/components/ui/Button';

type FilterPanelProps = {
  brands: Brand[];
  categories: Category[];
  filters: ProductFilters;
  hasError?: boolean;
  isLoading?: boolean;
  isDrawer?: boolean;
  totalItems?: number;
  onSelect: (key: 'category' | 'brand', value: string) => void;
  onApply: (minPrice: string, maxPrice: string) => void;
  onRetry: () => void;
  onReset: () => void;
};

const filterHeading = 'text-xs font-semibold uppercase tracking-wider text-text-primary';

export const FilterPanel = ({
  brands, categories, filters, hasError, isLoading, isDrawer, totalItems, onSelect, onApply, onReset, onRetry,
}: FilterPanelProps) => {
  const priceId = useId();
  const [minPrice, setMinPrice] = useState(filters.minPrice);
  const [maxPrice, setMaxPrice] = useState(filters.maxPrice);

  useEffect(() => {
    setMinPrice(filters.minPrice);
    setMaxPrice(filters.maxPrice);
  }, [filters.minPrice, filters.maxPrice]);

  const groups = [
    { key: 'category' as const, title: 'Danh mục', options: categories },
    { key: 'brand' as const, title: 'Thương hiệu', options: brands },
  ];

  const hasPendingPrice = minPrice !== filters.minPrice || maxPrice !== filters.maxPrice;
  const applyLabel = isDrawer
    ? hasPendingPrice || totalItems === undefined ? 'Xem sản phẩm' : `Xem ${totalItems} sản phẩm`
    : 'Áp dụng';

  return (
    <form
      className="space-y-5 lg:space-y-8"
      onSubmit={(event) => {
        event.preventDefault();
        onApply(minPrice, maxPrice);
      }}
    >
      {isLoading ? <p className="text-sm text-text-secondary" role="status">Đang tải bộ lọc…</p> : null}
      {hasError ? (
        <div className="text-sm text-text-secondary" role="alert">
          <p>Không thể tải danh mục hoặc thương hiệu.</p>
          <button className="min-h-11 underline underline-offset-4" onClick={onRetry} type="button">Thử tải lại bộ lọc</button>
        </div>
      ) : null}
      {groups.map(({ key, title, options }) => (
        <fieldset className="min-w-0 border-b border-border pb-4" key={key}>
          <legend className={filterHeading}>{title}</legend>
          <div className="mt-3 flex flex-col lg:gap-2.5">
            {options.map(({ id, name, slug }) => {
              const selected = filters[key] === slug;
              return (
                <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm text-text-secondary hover:text-text-primary lg:min-h-0" key={id}>
                  <input
                    checked={selected}
                    className="size-4 shrink-0 cursor-pointer accent-[rgb(var(--discovery-control))]"
                    onChange={() => onSelect(key, selected ? '' : slug)}
                    type="checkbox"
                  />
                  <span className={selected ? 'break-words font-medium text-text-primary' : 'break-words'}>{name}</span>
                </label>
              );
            })}
          </div>
        </fieldset>
      ))}

      <fieldset className="min-w-0">
        <legend className={filterHeading}>Khoảng giá (VND)</legend>
        <div className={`mt-3 grid gap-2.5 ${isDrawer ? 'grid-cols-2' : ''}`}>
          {[
            { key: 'min', label: 'Tối thiểu', value: minPrice, change: setMinPrice },
            { key: 'max', label: 'Tối đa', value: maxPrice, change: setMaxPrice },
          ].map(({ key, label, value, change }) => (
            <label className="min-w-0 text-xs text-text-secondary" htmlFor={`${priceId}-${key}`} key={key}>
              {label}
              <input
                className="mt-1 h-11 w-full rounded bg-canvas px-3 text-sm text-text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-primary"
                id={`${priceId}-${key}`}
                inputMode="numeric"
                min="0"
                onChange={(event) => change(event.target.value)}
                type="number"
                value={value}
              />
            </label>
          ))}
        </div>
      </fieldset>

      <div className="space-y-1">
        <Button className={`w-full !border-[rgb(var(--discovery-control))] !bg-[rgb(var(--discovery-control))] !px-3 !text-xs !tracking-normal hover:!bg-text-primary ${isDrawer ? '' : 'uppercase'}`} type="submit">
          {applyLabel}
        </Button>
        <button
          className={`min-h-11 w-full text-xs hover:text-text-primary ${isDrawer ? 'rounded bg-surface-soft font-medium' : 'text-text-secondary underline underline-offset-4'}`}
          onClick={() => {
            setMinPrice('');
            setMaxPrice('');
            onReset();
          }}
          type="button"
        >
          Xóa bộ lọc
        </button>
      </div>
    </form>
  );
};
