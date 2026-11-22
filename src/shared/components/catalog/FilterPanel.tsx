import { useId } from 'react';
import type { Brand, Category, ProductFilters } from '@/shared/types/catalog.types';

type FilterPanelProps = {
  brands: Brand[];
  categories: Category[];
  filters: ProductFilters;
  isLoading?: boolean;
  hasError?: boolean;
  onChange: (key: keyof ProductFilters, value: string) => void;
  onRetry?: () => void;
  onReset: () => void;
};

const legendClass = 'mb-3 text-sm font-semibold text-text-primary';
const optionClass = 'flex min-h-11 w-full items-center gap-3 py-2 text-left text-sm text-text-secondary transition-colors hover:text-text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary';

export const FilterPanel = ({ brands, categories, filters, hasError = false, isLoading = false, onChange, onReset, onRetry }: FilterPanelProps) => {
  const id = useId();
  const minPriceId = `${id}-min-price`;
  const maxPriceId = `${id}-max-price`;

  return (
  <div className="space-y-7">
    {isLoading ? <p className="text-sm text-text-secondary" role="status">Đang tải bộ lọc…</p> : null}
    {hasError ? (
      <div className="space-y-2 text-sm text-text-secondary" role="alert">
        <p>Không thể tải danh mục hoặc thương hiệu.</p>
        {onRetry ? <button className="min-h-11 font-medium text-text-primary underline underline-offset-4" onClick={onRetry} type="button">Thử tải lại bộ lọc</button> : null}
      </div>
    ) : null}
    <fieldset>
      <legend className={legendClass}>Danh mục</legend>
      <div className="space-y-1">
        <button aria-pressed={!filters.category} className={`${optionClass} ${!filters.category ? 'font-semibold text-text-primary' : ''}`} onClick={() => onChange('category', '')} type="button">
          <span aria-hidden="true" className={`grid h-5 w-5 place-items-center border ${!filters.category ? 'border-text-primary bg-text-primary text-white' : 'border-border'}`}>{!filters.category ? '✓' : ''}</span>
          Tất cả danh mục
        </button>
        {categories.map((category) => {
          const selected = filters.category === category.slug;
          return (
            <button aria-pressed={selected} className={`${optionClass} ${selected ? 'font-semibold text-text-primary' : ''}`} key={category.id} onClick={() => onChange('category', selected ? '' : category.slug)} type="button">
              <span aria-hidden="true" className={`grid h-5 w-5 place-items-center border ${selected ? 'border-text-primary bg-text-primary text-white' : 'border-border'}`}>{selected ? '✓' : ''}</span>
              {category.name}
            </button>
          );
        })}
      </div>
    </fieldset>

    <fieldset className="border-t border-border pt-6">
      <legend className={legendClass}>Thương hiệu</legend>
      <div className="space-y-1">
        <button aria-pressed={!filters.brand} className={`${optionClass} ${!filters.brand ? 'font-semibold text-text-primary' : ''}`} onClick={() => onChange('brand', '')} type="button">
          <span aria-hidden="true" className={`grid h-5 w-5 place-items-center border ${!filters.brand ? 'border-text-primary bg-text-primary text-white' : 'border-border'}`}>{!filters.brand ? '✓' : ''}</span>
          Tất cả thương hiệu
        </button>
        {brands.map((brand) => {
          const selected = filters.brand === brand.slug;
          return (
            <button aria-pressed={selected} className={`${optionClass} ${selected ? 'font-semibold text-text-primary' : ''}`} key={brand.id} onClick={() => onChange('brand', selected ? '' : brand.slug)} type="button">
              <span aria-hidden="true" className={`grid h-5 w-5 place-items-center border ${selected ? 'border-text-primary bg-text-primary text-white' : 'border-border'}`}>{selected ? '✓' : ''}</span>
              {brand.name}
            </button>
          );
        })}
      </div>
    </fieldset>

    <fieldset className="space-y-3 border-t border-border pt-6">
      <legend className={legendClass}>Khoảng giá (₫)</legend>
      <label className="block text-sm text-text-secondary" htmlFor={minPriceId}>Tối thiểu
        <input
          className="mt-2 h-12 w-full border border-border bg-surface px-3 text-base text-text-primary focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
          id={minPriceId}
          inputMode="numeric"
          min="0"
          onChange={(event) => onChange('minPrice', event.target.value)}
          placeholder="Không giới hạn"
          type="number"
          value={filters.minPrice}
        />
      </label>
      <label className="block text-sm text-text-secondary" htmlFor={maxPriceId}>Tối đa
        <input
          className="mt-2 h-12 w-full border border-border bg-surface px-3 text-base text-text-primary focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
          id={maxPriceId}
          inputMode="numeric"
          min="0"
          onChange={(event) => onChange('maxPrice', event.target.value)}
          placeholder="Không giới hạn"
          type="number"
          value={filters.maxPrice}
        />
      </label>
    </fieldset>

    <button className="min-h-11 text-sm font-medium text-text-primary underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary" onClick={onReset} type="button">
      Xóa bộ lọc
    </button>
  </div>
  );
};
