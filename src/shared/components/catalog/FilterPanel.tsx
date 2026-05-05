import type { Brand, Category, ProductFilters } from '@/shared/types/catalog.types';

type FilterPanelProps = {
  brands: Brand[];
  categories: Category[];
  filters: ProductFilters;
  onChange: (key: keyof ProductFilters, value: string) => void;
  onReset: () => void;
};

const sectionTitleClass = 'mb-6 text-[11px] font-bold uppercase tracking-[0.18em] text-text-primary';
const itemClass = 'block py-1 text-sm uppercase tracking-[0.14em] text-text-secondary transition-colors hover:text-text-primary';

export const FilterPanel = ({ brands, categories, filters, onChange, onReset }: FilterPanelProps) => (
  <div className="space-y-12">
    <div>
      <label className="mb-3 block text-[11px] font-bold uppercase tracking-[0.18em] text-text-primary" htmlFor="product-search">
        Search
      </label>
      <input
        className="h-12 w-full border-0 border-b border-border bg-transparent px-0 text-sm tracking-[0.12em] text-text-primary placeholder:text-border focus:border-brand-primary focus:outline-none focus:ring-0"
        id="product-search"
        onChange={(event) => onChange('keyword', event.target.value)}
        placeholder="Search the collection"
        value={filters.keyword}
      />
    </div>

    <section>
      <h3 className={sectionTitleClass}>Category</h3>
      <div className="space-y-3">
        <button
          className={filters.category ? itemClass : `${itemClass} text-text-primary`}
          onClick={() => onChange('category', '')}
          type="button"
        >
          All Collections
        </button>
        {categories.map((category) => (
          <button
            className={filters.category === category.slug ? `${itemClass} text-text-primary` : itemClass}
            key={category.id}
            onClick={() => onChange('category', category.slug)}
            type="button"
          >
            {category.name}
          </button>
        ))}
      </div>
    </section>

    <section>
      <h3 className={sectionTitleClass}>Brand</h3>
      <div className="space-y-3">
        <button
          className={filters.brand ? itemClass : `${itemClass} text-text-primary`}
          onClick={() => onChange('brand', '')}
          type="button"
        >
          All Brands
        </button>
        {brands.map((brand) => (
          <button
            className={filters.brand === brand.slug ? `${itemClass} text-text-primary` : itemClass}
            key={brand.id}
            onClick={() => onChange('brand', brand.slug)}
            type="button"
          >
            {brand.name}
          </button>
        ))}
      </div>
    </section>

    <section>
      <h3 className={sectionTitleClass}>Investment</h3>
      <div className="space-y-4">
        <input
          className="h-11 w-full border border-border bg-transparent px-4 text-sm uppercase tracking-[0.12em] text-text-primary placeholder:text-border focus:border-brand-primary focus:outline-none focus:ring-0"
          inputMode="numeric"
          onChange={(event) => onChange('minPrice', event.target.value)}
          placeholder="Min Price"
          value={filters.minPrice}
        />
        <input
          className="h-11 w-full border border-border bg-transparent px-4 text-sm uppercase tracking-[0.12em] text-text-primary placeholder:text-border focus:border-brand-primary focus:outline-none focus:ring-0"
          inputMode="numeric"
          onChange={(event) => onChange('maxPrice', event.target.value)}
          placeholder="Max Price"
          value={filters.maxPrice}
        />
      </div>
    </section>

    <button
      className="border-b border-text-primary pb-1 text-[11px] font-bold uppercase tracking-[0.18em] text-text-primary transition-opacity hover:opacity-70"
      onClick={onReset}
      type="button"
    >
      Clear All
    </button>
  </div>
);
