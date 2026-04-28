import { useEffect, useMemo, useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

import { routes } from '@/constants/routes';
import { useBrands, useCategories, useProductList } from '@/features/products/hooks/useProductDiscovery';
import { ActiveFilterChips } from '@/shared/components/catalog/ActiveFilterChips';
import { FilterPanel } from '@/shared/components/catalog/FilterPanel';
import { ProductGrid } from '@/shared/components/catalog/ProductGrid';
import { SortDropdown } from '@/shared/components/catalog/SortDropdown';
import { EmptyState } from '@/shared/components/feedback/EmptyState';
import { ErrorCard } from '@/shared/components/feedback/ErrorCard';
import { SkeletonCard } from '@/shared/components/feedback/SkeletonCard';
import { FilterDrawer } from '@/shared/components/overlays/FilterDrawer';
import { Container } from '@/shared/components/layout/Container';
import { PageWrapper } from '@/shared/components/layout/PageWrapper';
import { PageSEO } from '@/shared/components/seo/PageSEO';
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue';
import type { ProductFilters } from '@/shared/types/catalog.types';
import { SORT_OPTIONS } from '@/shared/types/enums';
import { buttonStyles } from '@/shared/components/ui/buttonStyles';
import { Button } from '@/shared/components/ui/Button';

const normalizeFilters = (searchParams: URLSearchParams): ProductFilters => ({
  keyword: searchParams.get('q') ?? '',
  category: searchParams.get('category') ?? '',
  brand: searchParams.get('brand') ?? '',
  minPrice: searchParams.get('minPrice') ?? '',
  maxPrice: searchParams.get('maxPrice') ?? '',
  sort: (searchParams.get('sort') as ProductFilters['sort']) ?? SORT_OPTIONS.FEATURED,
});

export const ProductListPage = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = useMemo(() => normalizeFilters(searchParams), [searchParams]);
  const [keywordDraft, setKeywordDraft] = useState(filters.keyword);
  const debouncedKeyword = useDebouncedValue(keywordDraft, 350);

  useEffect(() => {
    setKeywordDraft(filters.keyword);
  }, [filters.keyword]);

  useEffect(() => {
    if (debouncedKeyword === filters.keyword) {
      return;
    }

    const next = new URLSearchParams(searchParams);
    if (debouncedKeyword) {
      next.set('q', debouncedKeyword);
    } else {
      next.delete('q');
    }
    setSearchParams(next, { replace: true });
  }, [debouncedKeyword, filters.keyword, searchParams, setSearchParams]);

  const categoriesQuery = useCategories();
  const brandsQuery = useBrands();
  const productsQuery = useProductList(filters);

  const updateFilter = (key: keyof ProductFilters, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) {
      next.set(key === 'keyword' ? 'q' : key, value);
    } else {
      next.delete(key === 'keyword' ? 'q' : key);
    }
    setSearchParams(next, { replace: true });
  };

  const clearFilters = () => {
    setSearchParams(new URLSearchParams(), { replace: true });
  };

  const activeChips = useMemo(() => {
    const chips = [];
    if (filters.category) {
      chips.push({ key: 'category', label: filters.category });
    }
    if (filters.brand) {
      chips.push({ key: 'brand', label: filters.brand });
    }
    if (filters.minPrice) {
      chips.push({ key: 'minPrice', label: `Min ${filters.minPrice}` });
    }
    if (filters.maxPrice) {
      chips.push({ key: 'maxPrice', label: `Max ${filters.maxPrice}` });
    }
    if (filters.keyword) {
      chips.push({ key: 'keyword', label: filters.keyword });
    }
    return chips;
  }, [filters]);

  const onRemoveChip = (key: string) => {
    if (key === 'keyword') {
      setKeywordDraft('');
    }
    updateFilter(key as keyof ProductFilters, '');
  };

  return (
    <>
      <PageSEO
        description="Browse womenswear, menswear, and accessories with URL-synced filters and editorial product cards."
        path={routes.products}
        title="Products"
      />
      <PageWrapper className="pb-24">
        <Container className="space-y-16">
          <header className="space-y-5">
            <h1 className="font-display text-[3.5rem] leading-[0.95] text-text-primary md:text-[4.5rem]">The Permanent Collection</h1>
            <p className="max-w-xl text-lg leading-8 text-text-secondary">
              Architectural silhouettes and noble materials. A curation of essential pieces designed to endure beyond the seasonal cycle.
            </p>
          </header>

          <div className="flex gap-12 xl:gap-20">
            <aside className="hidden w-64 shrink-0 lg:block">
              <div className="sticky top-32">
                <FilterPanel
                  brands={brandsQuery.data ?? []}
                  categories={categoriesQuery.data ?? []}
                  filters={{ ...filters, keyword: keywordDraft }}
                  onChange={(key, value) => {
                    if (key === 'keyword') {
                      setKeywordDraft(value);
                      return;
                    }
                    updateFilter(key, value);
                  }}
                  onReset={clearFilters}
                />
              </div>
            </aside>

            <section className="min-w-0 flex-1 space-y-10">
              <div className="flex flex-wrap items-center justify-between gap-6">
                <ActiveFilterChips chips={activeChips} onClear={clearFilters} onRemove={onRemoveChip} />
                <div className="flex items-center gap-4">
                  <Button className="lg:hidden" onClick={() => setDrawerOpen(true)} variant="ghost">
                    <SlidersHorizontal className="h-4 w-4" />
                    Refine
                  </Button>
                  <SortDropdown onChange={(value) => updateFilter('sort', value)} value={filters.sort} />
                </div>
              </div>

              {productsQuery.isLoading ? (
                <div className="grid grid-cols-2 gap-x-6 gap-y-12 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8 xl:gap-y-16">
                  {Array.from({ length: 8 }).map((_, index) => (
                    <SkeletonCard key={index} />
                  ))}
                </div>
              ) : null}

              {productsQuery.isError ? (
                <ErrorCard
                  action={<Button onClick={() => void productsQuery.refetch()}>Retry</Button>}
                  description="The product listing could not be assembled from the current catalog source."
                  title="Product discovery is temporarily unavailable"
                />
              ) : null}

              {productsQuery.data && productsQuery.data.items.length === 0 ? (
                <EmptyState
                  action={
                    <button className={buttonStyles({})} onClick={clearFilters} type="button">
                      Reset Filters
                    </button>
                  }
                  description="Try broadening the query or resetting a few filters."
                  title="No products match this edit"
                />
              ) : null}

              {productsQuery.data && productsQuery.data.items.length > 0 ? <ProductGrid products={productsQuery.data.items} /> : null}
            </section>
          </div>
        </Container>
        <FilterDrawer onClose={() => setDrawerOpen(false)} open={drawerOpen}>
          <FilterPanel
            brands={brandsQuery.data ?? []}
            categories={categoriesQuery.data ?? []}
            filters={{ ...filters, keyword: keywordDraft }}
            onChange={(key, value) => {
              if (key === 'keyword') {
                setKeywordDraft(value);
                return;
              }
              updateFilter(key, value);
            }}
            onReset={clearFilters}
          />
        </FilterDrawer>
      </PageWrapper>
    </>
  );
};

export default ProductListPage;
