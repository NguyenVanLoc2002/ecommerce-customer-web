import { useEffect, useMemo, useRef, useState } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';

import { catalogSearchId, routePaths, routes } from '@/constants/routes';
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
import { JsonLd } from '@/shared/components/seo/JsonLd';
import { PageSEO } from '@/shared/components/seo/PageSEO';
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue';
import {
  DEFAULT_PRODUCT_PAGE,
  getProductListQueryFromSearchParams,
  trimProductKeyword,
} from '@/shared/lib/productSearch';
import type { Brand, Category, ProductFilters } from '@/shared/types/catalog.types';
import { Button } from '@/shared/components/ui/Button';
import { buttonStyles } from '@/shared/components/ui/buttonStyles';
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
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = useMemo(() => getProductListQueryFromSearchParams(searchParams), [searchParams]);
  const [keywordDraft, setKeywordDraft] = useState(filters.keyword);
  const debouncedKeyword = useDebouncedValue(keywordDraft, 350);

  useEffect(() => {
    setKeywordDraft(filters.keyword);
  }, [filters.keyword]);

  useEffect(() => {
    const trimmedKeyword = trimProductKeyword(debouncedKeyword);

    if (trimmedKeyword === filters.keyword) return;

    const next = new URLSearchParams(searchParams);
    if (trimmedKeyword) next.set('q', trimmedKeyword);
    else next.delete('q');
    next.delete('page');
    setSearchParams(next, { replace: true });
  }, [debouncedKeyword, filters.keyword, searchParams, setSearchParams]);

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

  const selectedCategory = categories.find((category) => category.slug === filters.category);
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
      <PageWrapper className="pb-20 pt-[68px] lg:pt-24">
        <Container>
          <nav aria-label="Điều hướng breadcrumb" className="mb-5 flex items-center gap-2 text-xs lg:mb-8 lg:text-sm text-text-secondary">
            <Link className="hover:text-text-primary" to={routes.home}>Trang chủ</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page" className="font-medium text-text-primary">Sản phẩm</span>
          </nav>

          <header className="mb-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-end">
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wider text-text-secondary">Bộ sưu tập chọn lọc</p>
              <h1 className="max-w-[30ch] text-2xl font-medium leading-tight tracking-tight text-text-primary lg:text-4xl lg:leading-[1.25]">
                {selectedCategory?.name ?? 'Những món đồ bạn sẽ mặc mãi.'}
              </h1>
              {selectedCategory?.description ? <p className="mt-3 max-w-2xl text-base leading-7 text-text-secondary">{selectedCategory.description}</p> : null}
            </div>
            <form
              className="flex min-h-11 items-center gap-3 rounded-card bg-surface px-4 focus-within:border-brand-primary focus-within:ring-2 focus-within:ring-brand-primary/20"
              onSubmit={(event) => {
                event.preventDefault();
                updateFilter('keyword', keywordDraft);
              }}
              role="search"
            >
              <Search aria-hidden="true" className="h-5 w-5 shrink-0 text-text-secondary" />
              <label className="sr-only" htmlFor={catalogSearchId}>Tìm theo tên sản phẩm</label>
              <input
                autoComplete="off"
                className="min-w-0 flex-1 scroll-mt-24 bg-transparent py-3 text-base text-text-primary outline-none placeholder:text-text-secondary"
                id={catalogSearchId}
                ref={searchInputRef}
                onChange={(event) => setKeywordDraft(event.target.value)}
                placeholder="Tìm theo tên sản phẩm"
                type="search"
                value={keywordDraft}
              />
              <button aria-label="Tìm sản phẩm" className="text-sm font-medium text-text-primary underline underline-offset-4" type="submit">Tìm</button>
            </form>
          </header>

          <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-card bg-surface-muted px-4 py-2 lg:mb-16">
            <ActiveFilterChips chips={activeChips} onClear={clearFilters} onRemove={removeChip} />
            <div className="ml-auto flex flex-wrap items-center justify-end gap-3">
              {productsQuery.data ? (
                <p className="hidden border-r border-border pr-4 text-sm text-text-secondary lg:block">
                  Hiển thị <strong className="font-semibold text-text-primary">{productsQuery.data.totalItems}</strong> sản phẩm
                </p>
              ) : null}
              <Button aria-expanded={drawerOpen} className="lg:hidden" onClick={() => setDrawerOpen(true)} variant="secondary">
                <SlidersHorizontal aria-hidden="true" className="h-4 w-4" />
                Bộ lọc{activeChips.length ? ` (${activeChips.length})` : ''}
              </Button>
              <SortDropdown onChange={(value) => updateFilter('sort', value)} value={filters.sort} />
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-[224px_minmax(0,1fr)] xl:gap-10">
            <aside className="hidden lg:block">
              <div className="sticky top-24 rounded-card bg-surface p-5">
                <FilterPanel
                  brands={brands}
                  categories={categories}
                  filters={{ ...filters, keyword: keywordDraft }}
                  hasError={categoriesQuery.isError || brandsQuery.isError}
                  isLoading={categoriesQuery.isLoading || brandsQuery.isLoading}
                  onChange={(key, value) => key === 'keyword' ? setKeywordDraft(value) : updateFilter(key, value)}
                  onRetry={retryFilterOptions}
                  onReset={clearFilters}
                />
              </div>
            </aside>

            <section aria-label="Kết quả sản phẩm" aria-live="polite" className="min-w-0">
              {productsQuery.isLoading ? (
                <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 md:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, index) => <SkeletonCard key={index} />)}
                </div>
              ) : null}

              {productsQuery.isError ? (
                <ErrorCard
                  action={<Button onClick={() => void productsQuery.refetch()}>Thử lại</Button>}
                  description="Vui lòng kiểm tra kết nối rồi thử tải danh sách thêm lần nữa."
                  title="Không thể tải danh sách sản phẩm lúc này"
                />
              ) : null}

              {productsQuery.data && productsQuery.data.items.length === 0 ? (
                <EmptyState
                  action={<button className={buttonStyles({ variant: 'secondary' })} onClick={clearFilters} type="button">Xóa bộ lọc</button>}
                  description="Thử bỏ bớt bộ lọc hoặc chọn khoảng giá rộng hơn."
                  title="Không tìm thấy sản phẩm phù hợp"
                />
              ) : null}

              {productsQuery.data && productsQuery.data.items.length > 0 ? (
                <div className="space-y-6">
                  <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-text-secondary lg:contents">
                    <p className="lg:sr-only">
                      Hiển thị {(productsQuery.data.page * productsQuery.data.size) + 1}–{Math.min((productsQuery.data.page + 1) * productsQuery.data.size, productsQuery.data.totalItems)} trong {productsQuery.data.totalItems} sản phẩm
                    </p>
                    {productsQuery.isFetching && !productsQuery.isLoading ? <p role="status">Đang cập nhật kết quả…</p> : null}
                  </div>
                  <ProductGrid products={productsQuery.data.items} />
                  {pageCount > 1 ? (
                    <nav aria-label="Phân trang sản phẩm" className="flex flex-wrap items-center justify-between gap-4 border-t border-border pt-5">
                      <p className="text-sm text-text-secondary">Trang {productsQuery.data.page + 1} / {pageCount}</p>
                      <div className="flex flex-wrap items-center gap-2">
                        <Button disabled={!productsQuery.data.hasPrevious} onClick={() => updatePage(filters.page - 1)} variant="ghost">Trước</Button>
                        {visiblePages.map((page) => (
                          <Button
                            aria-current={page === filters.page ? 'page' : undefined}
                            aria-label={`Trang ${page + 1}`}
                            key={page}
                            onClick={() => updatePage(page)}
                            variant={page === filters.page ? 'primary' : 'ghost'}
                          >
                            {page + 1}
                          </Button>
                        ))}
                        <Button disabled={!productsQuery.data.hasNext} onClick={() => updatePage(filters.page + 1)} variant="ghost">Tiếp</Button>
                      </div>
                    </nav>
                  ) : null}
                </div>
              ) : null}
            </section>
          </div>
        </Container>

        <FilterDrawer onClose={() => setDrawerOpen(false)} open={drawerOpen}>
          <FilterPanel
            brands={brands}
            categories={categories}
            filters={{ ...filters, keyword: keywordDraft }}
            hasError={categoriesQuery.isError || brandsQuery.isError}
            isLoading={categoriesQuery.isLoading || brandsQuery.isLoading}
            onChange={(key, value) => key === 'keyword' ? setKeywordDraft(value) : updateFilter(key, value)}
            onRetry={retryFilterOptions}
            onReset={() => {
              clearFilters();
              setDrawerOpen(false);
            }}
          />
        </FilterDrawer>
      </PageWrapper>
    </>
  );
};

export default ProductListPage;
