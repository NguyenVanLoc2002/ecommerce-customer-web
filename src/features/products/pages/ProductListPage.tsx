import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, Search, SlidersHorizontal } from 'lucide-react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';

import { catalogSearchId, routePaths, routes } from '@/constants/routes';
import { ProductListFeedback } from '@/features/products/components/ProductListFeedback';
import { useBrands, useCategories, useProductList } from '@/features/products/hooks/useProductDiscovery';
import { ActiveFilterChips } from '@/shared/components/catalog/ActiveFilterChips';
import { FilterPanel } from '@/shared/components/catalog/FilterPanel';
import { ProductGrid } from '@/shared/components/catalog/ProductGrid';
import { SortDropdown } from '@/shared/components/catalog/SortDropdown';
import { SkeletonCard } from '@/shared/components/feedback/SkeletonCard';
import { FilterDrawer } from '@/shared/components/overlays/FilterDrawer';
import { JsonLd } from '@/shared/components/seo/JsonLd';
import { PageSEO } from '@/shared/components/seo/PageSEO';
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue';
import {
  DEFAULT_PRODUCT_PAGE,
  getProductListQueryFromSearchParams,
  trimProductKeyword,
} from '@/shared/lib/productSearch';
import type { Brand, Category, ProductFilters } from '@/shared/types/catalog.types';
import { createCanonicalUrl } from '@/shared/utils/seo';

const priceFormatter = new Intl.NumberFormat('vi-VN');
const EMPTY_CATEGORIES: Category[] = [];
const EMPTY_BRANDS: Brand[] = [];

export const ProductListPage = () => {
  const { hash, key } = useLocation();
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (hash !== `#${catalogSearchId}`) return;
    searchInputRef.current?.focus();
  }, [hash, key]);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = useMemo(() => getProductListQueryFromSearchParams(searchParams), [searchParams]);
  const [searchInput, setSearchInput] = useState({ urlKeyword: filters.keyword, value: filters.keyword });
  const keywordDraft = searchInput.urlKeyword === filters.keyword ? searchInput.value : filters.keyword;
  const debouncedKeyword = useDebouncedValue(keywordDraft, 350);

  useEffect(() => {
    setSearchInput({ urlKeyword: filters.keyword, value: filters.keyword });
  }, [filters.keyword]);

  const setKeywordDraft = (value: string) => setSearchInput({ urlKeyword: filters.keyword, value });

  useEffect(() => {
    const trimmedKeyword = trimProductKeyword(debouncedKeyword);

    if (trimmedKeyword === filters.keyword || trimmedKeyword !== trimProductKeyword(keywordDraft)) return;

    const next = new URLSearchParams(searchParams);
    if (trimmedKeyword) next.set('q', trimmedKeyword);
    else next.delete('q');
    next.delete('page');
    setSearchParams(next, { replace: true });
  }, [debouncedKeyword, filters.keyword, keywordDraft, searchParams, setSearchParams]);

  const categoriesQuery = useCategories();
  const brandsQuery = useBrands();
  const productsQuery = useProductList(filters);
  const categories = categoriesQuery.data ?? EMPTY_CATEGORIES;
  const brands = brandsQuery.data ?? EMPTY_BRANDS;

  const updateFilter = (key: keyof ProductFilters, value: string) => {
    const next = new URLSearchParams(searchParams);
    const nextValue = key === 'keyword' ? trimProductKeyword(value) : value;

    if (nextValue) next.set(key === 'keyword' ? 'q' : key, nextValue);
    else next.delete(key === 'keyword' ? 'q' : key);
    next.delete('page');
    setSearchParams(next, { replace: true });
  };

  const updatePage = (nextPage: number) => {
    const next = new URLSearchParams(searchParams);
    if (nextPage <= DEFAULT_PRODUCT_PAGE) next.delete('page');
    else next.set('page', String(nextPage));
    setSearchParams(next);
  };

  const clearFilters = () => {
    setKeywordDraft('');
    const next = new URLSearchParams(searchParams);
    ['q', 'category', 'brand', 'minPrice', 'maxPrice', 'page'].forEach((key) => next.delete(key));
    setSearchParams(next, { replace: true });
  };

  const retryFilterOptions = () => {
    void categoriesQuery.refetch();
    void brandsQuery.refetch();
  };

  const activeChips = useMemo(() => {
    const chips: Array<{ key: keyof ProductFilters; label: string }> = [];
    const selectedCategory = categories.find((category) => category.slug === filters.category);
    const selectedBrand = brands.find((brand) => brand.slug === filters.brand);
    if (selectedCategory) chips.push({ key: 'category', label: selectedCategory.name });
    if (selectedBrand) chips.push({ key: 'brand', label: selectedBrand.name });
    if (filters.minPrice) chips.push({ key: 'minPrice', label: `Từ ${priceFormatter.format(Number(filters.minPrice))} ₫` });
    if (filters.maxPrice) chips.push({ key: 'maxPrice', label: `Đến ${priceFormatter.format(Number(filters.maxPrice))} ₫` });
    if (filters.keyword) chips.push({ key: 'keyword', label: `Từ khóa: ${filters.keyword}` });
    return chips;
  }, [brands, categories, filters]);

  const removeChip = (key: string) => {
    if (key === 'keyword') setKeywordDraft('');
    if (key === 'category' || key === 'brand' || key === 'minPrice' || key === 'maxPrice' || key === 'keyword') {
      updateFilter(key, '');
    }
  };

  const applyPrice = (minPrice: string, maxPrice: string) => {
    if (minPrice === filters.minPrice && maxPrice === filters.maxPrice) return;
    const next = new URLSearchParams(searchParams);
    if (minPrice) next.set('minPrice', minPrice);
    else next.delete('minPrice');
    if (maxPrice) next.set('maxPrice', maxPrice);
    else next.delete('maxPrice');
    next.delete('page');
    setSearchParams(next, { replace: true });
  };

  const filterPanelProps = {
    brands,
    categories,
    filters,
    hasError: categoriesQuery.isError || brandsQuery.isError,
    isLoading: categoriesQuery.isLoading || brandsQuery.isLoading,
    onSelect: updateFilter,
    onReset: clearFilters,
    onRetry: retryFilterOptions,
  };
  const categoryDescription = categories.find((category) => category.slug === filters.category)?.description;
  const pageCount = productsQuery.data?.totalPages ?? 0;
  const firstVisiblePage = Math.max(0, Math.min(filters.page - 2, pageCount - 5));
  const visiblePages = Array.from({ length: Math.min(5, pageCount) }, (_, index) => firstVisiblePage + index);

  return (
    <>
      <PageSEO
        description="Khám phá trang phục và phụ kiện, lọc danh mục và thương hiệu theo lựa chọn của bạn."
        path={routes.products}
        title="Sản phẩm"
      />
      {productsQuery.data?.items.length ? (
        <JsonLd
          data={{
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            itemListElement: productsQuery.data.items.map((product, index) => ({
              '@type': 'ListItem',
              position: index + 1,
              url: createCanonicalUrl(routePaths.productDetail(product.slug)),
              name: product.name,
              image: product.primaryImage.src,
            })),
          }}
        />
      ) : null}
      <div className="pb-8 pt-14 lg:pb-16 lg:pt-16">
        <div className="mx-auto w-full max-w-layout px-5 pt-3 lg:px-12 lg:pt-8">
          <nav aria-label="Điều hướng breadcrumb" className="mb-2 flex items-center gap-1.5 text-xs text-text-secondary lg:mb-8 lg:gap-2 lg:text-sm">
            <Link className="hover:text-text-primary" to={routes.home}>Trang chủ</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page" className="font-medium text-text-primary">Sản phẩm</span>
          </nav>

          <header className="mb-4 grid gap-3 lg:mb-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-end lg:gap-6">
            <div>
              <p className="mb-2 hidden text-xs font-medium uppercase tracking-widest text-text-secondary lg:block">Bộ sưu tập chọn lọc</p>
              <h1 className="text-2xl font-semibold leading-tight tracking-tight text-text-primary lg:text-4xl lg:font-normal lg:leading-snug">
                <span className="lg:hidden">Sản phẩm</span>
                <span className="hidden lg:inline">Những món đồ bạn sẽ mặc mãi.</span>
              </h1>
              <p className="mt-1 text-xs text-text-secondary lg:hidden">Những món đồ bạn sẽ mặc mãi.</p>
              {categoryDescription ? <p className="mt-2 max-w-2xl text-xs leading-relaxed text-text-secondary lg:text-sm">{categoryDescription}</p> : null}
            </div>
            <form
              className="relative flex min-h-11 items-center rounded bg-surface focus-within:outline focus-within:outline-2 focus-within:outline-brand-primary"
              onSubmit={(event) => {
                event.preventDefault();
                updateFilter('keyword', keywordDraft);
              }}
              role="search"
            >
              <Search aria-hidden="true" className="pointer-events-none absolute left-3 size-5 text-text-secondary" />
              <label className="sr-only" htmlFor={catalogSearchId}>Tìm theo tên sản phẩm</label>
              <input
                autoComplete="off"
                className="min-h-11 w-full min-w-0 scroll-mt-24 rounded bg-transparent pl-10 pr-4 text-sm text-text-primary !outline-none placeholder:text-text-secondary lg:pl-11"
                id={catalogSearchId}
                ref={searchInputRef}
                onChange={(event) => setKeywordDraft(event.target.value)}
                placeholder="Tìm theo tên sản phẩm"
                type="search"
                value={keywordDraft}
              />
            </form>
          </header>

          <div className="mb-3 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 lg:mb-[4.5rem] lg:flex lg:flex-row-reverse lg:flex-wrap lg:items-center lg:justify-between lg:gap-4 lg:rounded lg:bg-[rgb(var(--discovery-panel))] lg:px-4 lg:py-3">
            <div className="col-span-2 grid grid-cols-2 gap-3 lg:ml-auto lg:flex lg:items-center lg:gap-4">
              {productsQuery.data ? (
                <p className="hidden border-r border-border pr-4 text-sm text-text-secondary lg:block">
                  Hiển thị <strong className="font-medium text-text-primary">{productsQuery.data.totalItems}</strong> sản phẩm
                </p>
              ) : null}
              <button
                aria-expanded={drawerOpen}
                className="flex h-11 items-center justify-between gap-1 rounded bg-surface px-3 text-xs font-medium text-text-primary hover:bg-surface-soft lg:hidden"
                onClick={() => setDrawerOpen(true)}
                type="button"
              >
                <span className="inline-flex items-center gap-2">
                  <SlidersHorizontal aria-hidden="true" className="size-[18px] text-text-secondary" />
                  Bộ lọc
                </span>
                {activeChips.length ? <span className="rounded-full bg-surface-soft px-2 py-0.5 text-[11px]">{activeChips.length}</span> : null}
              </button>
              <SortDropdown onChange={(value) => updateFilter('sort', value)} value={filters.sort} />
            </div>
            <div className="min-w-0">
              <ActiveFilterChips chips={activeChips} onClear={clearFilters} onRemove={removeChip} />
            </div>
            {productsQuery.data ? <p className="text-right text-xs text-text-secondary lg:hidden">Hiển thị {productsQuery.data.totalItems} sản phẩm</p> : null}
          </div>

          <div className="grid gap-10 lg:grid-cols-[224px_minmax(0,1fr)]">
            <aside aria-label="Bộ lọc sản phẩm" className="hidden lg:block">
              <div className="sticky top-24 max-h-[calc(100dvh-7rem)] overflow-y-auto rounded bg-surface p-5">
                <FilterPanel {...filterPanelProps} onApply={applyPrice} />
              </div>
            </aside>

            <section aria-busy={productsQuery.isFetching} aria-label="Kết quả sản phẩm" aria-live="polite" className="min-w-0">
              {productsQuery.isLoading ? (
                <div aria-label="Đang tải sản phẩm" className="grid grid-cols-2 gap-x-3.5 gap-y-7 lg:grid-cols-3 lg:gap-x-6 lg:gap-y-10" role="status">
                  {Array.from({ length: 6 }).map((_, index) => <SkeletonCard appearance="catalog" key={index} />)}
                </div>
              ) : null}

              {productsQuery.isError ? (
                <ProductListFeedback onAction={() => void productsQuery.refetch()} status="error" />
              ) : null}

              {productsQuery.data && productsQuery.data.items.length === 0 ? (
                <ProductListFeedback onAction={clearFilters} status="empty" />
              ) : null}

              {productsQuery.data && productsQuery.data.items.length > 0 ? (
                <>
                  {productsQuery.isFetching ? <p className="sr-only" role="status">Đang cập nhật kết quả…</p> : null}
                  <ProductGrid products={productsQuery.data.items} />
                  {pageCount > 1 ? (
                    <nav aria-label="Phân trang sản phẩm" className="mt-6 flex items-center justify-between gap-1 rounded bg-[rgb(var(--discovery-panel))] px-2 py-4 text-xs lg:mt-14 lg:gap-4 lg:bg-surface lg:p-4">
                      <p className="order-2 whitespace-nowrap text-text-secondary lg:order-first">Trang {productsQuery.data.page + 1} / {pageCount}</p>
                      <button aria-label="Trang trước" className="order-1 flex h-11 min-w-11 items-center justify-center gap-1.5 rounded px-2 hover:bg-surface-soft disabled:cursor-not-allowed disabled:opacity-40 lg:order-2 lg:ml-auto" disabled={!productsQuery.data.hasPrevious} onClick={() => updatePage(filters.page - 1)} type="button">
                        <ArrowLeft aria-hidden="true" className="size-[18px] lg:hidden" />
                        <ChevronLeft aria-hidden="true" className="hidden size-[18px] lg:block" />
                        <span className="lg:sr-only">Trước</span>
                      </button>
                      <div className="order-3 hidden gap-1.5 lg:flex">
                        {visiblePages.map((page) => (
                          <button
                            aria-current={page === filters.page ? 'page' : undefined}
                            aria-label={`Trang ${page + 1}`}
                            className={`h-11 w-11 rounded font-medium ${page === filters.page ? 'bg-[rgb(var(--discovery-control))] text-white' : 'text-text-primary hover:bg-surface-soft'}`}
                            key={page}
                            onClick={() => updatePage(page)}
                            type="button"
                          >
                            {page + 1}
                          </button>
                        ))}
                      </div>
                      <button aria-label="Trang tiếp theo" className="order-4 flex h-11 min-w-11 items-center justify-center gap-1.5 rounded px-2 font-medium hover:bg-surface-soft disabled:cursor-not-allowed disabled:opacity-40" disabled={!productsQuery.data.hasNext} onClick={() => updatePage(filters.page + 1)} type="button">
                        <span className="lg:sr-only">Tiếp</span>
                        <ArrowRight aria-hidden="true" className="size-[18px] lg:hidden" />
                        <ChevronRight aria-hidden="true" className="hidden size-[18px] lg:block" />
                      </button>
                    </nav>
                  ) : null}
                </>
              ) : null}
            </section>
          </div>
        </div>

        <FilterDrawer onClose={closeDrawer} open={drawerOpen}>
          <FilterPanel
            {...filterPanelProps}
            isDrawer
            totalItems={productsQuery.isFetching ? undefined : productsQuery.data?.totalItems}
            onApply={(minPrice, maxPrice) => {
              applyPrice(minPrice, maxPrice);
              closeDrawer();
            }}
          />
        </FilterDrawer>
      </div>
    </>
  );
};

export default ProductListPage;
