import type { ProductListQuery, ProductListRequest } from '../types/catalog.types';
import { SORT_OPTIONS, type ProductSort } from '../types/enums';

export const DEFAULT_PRODUCT_PAGE = 0;
export const DEFAULT_PRODUCT_PAGE_SIZE = 20;

export const PRODUCT_SORT_OPTIONS: Array<{ label: string; value: ProductSort }> = [
  { value: SORT_OPTIONS.FEATURED, label: 'Featured' },
  { value: SORT_OPTIONS.NEWEST, label: 'Newest' },
  { value: SORT_OPTIONS.UPDATED, label: 'Recently Updated' },
  { value: SORT_OPTIONS.NAME_ASC, label: 'Name: A to Z' },
];

const supportedProductSorts = new Set<ProductSort>(PRODUCT_SORT_OPTIONS.map((option) => option.value));

export const trimProductKeyword = (keyword: string) => keyword.trim();

export const hasProductKeyword = (keyword: string) => trimProductKeyword(keyword).length > 0;

export const parseProductPrice = (value: string) => {
  const trimmed = value.trim();

  if (!trimmed) {
    return undefined;
  }

  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : undefined;
};

export const parseProductPage = (value: string | null) => {
  if (!value) {
    return DEFAULT_PRODUCT_PAGE;
  }

  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= DEFAULT_PRODUCT_PAGE ? parsed : DEFAULT_PRODUCT_PAGE;
};

export const normalizeProductSort = (value: string | null | undefined): ProductSort => {
  if (!value) {
    return SORT_OPTIONS.FEATURED;
  }

  return supportedProductSorts.has(value as ProductSort) ? (value as ProductSort) : SORT_OPTIONS.FEATURED;
};

export const getProductSortParam = (sort: ProductSort) => {
  switch (sort) {
    case SORT_OPTIONS.NEWEST:
      return 'createdAt,desc';
    case SORT_OPTIONS.UPDATED:
      return 'updatedAt,desc';
    case SORT_OPTIONS.NAME_ASC:
      return 'name,asc';
    case SORT_OPTIONS.FEATURED:
    default:
      return 'featured,desc';
  }
};

export const getProductListQueryFromSearchParams = (searchParams: URLSearchParams): ProductListQuery => ({
  keyword: searchParams.get('q') ?? '',
  category: searchParams.get('category') ?? '',
  brand: searchParams.get('brand') ?? '',
  minPrice: searchParams.get('minPrice') ?? '',
  maxPrice: searchParams.get('maxPrice') ?? '',
  page: parseProductPage(searchParams.get('page')),
  sort: normalizeProductSort(searchParams.get('sort')),
});

export const buildProductListRequest = (
  filters: ProductListQuery,
  ids: {
    brandId?: string;
    categoryId?: string;
  } = {},
): ProductListRequest => {
  const keyword = trimProductKeyword(filters.keyword);

  return {
    page: filters.page,
    size: DEFAULT_PRODUCT_PAGE_SIZE,
    sort: getProductSortParam(filters.sort),
    keyword: keyword || undefined,
    categoryId: ids.categoryId || undefined,
    brandId: ids.brandId || undefined,
    minPrice: parseProductPrice(filters.minPrice),
    maxPrice: parseProductPrice(filters.maxPrice),
  };
};

export const buildProductListSearchParams = (params: ProductListRequest) => {
  const searchParams = new URLSearchParams();
  const keyword = params.keyword ? trimProductKeyword(params.keyword) : '';

  if (typeof params.page === 'number' && Number.isInteger(params.page) && params.page >= DEFAULT_PRODUCT_PAGE) {
    searchParams.set('page', String(params.page));
  }

  if (typeof params.size === 'number' && Number.isInteger(params.size) && params.size > 0) {
    searchParams.set('size', String(params.size));
  }

  if (params.sort) {
    searchParams.set('sort', params.sort);
  }

  if (keyword) {
    searchParams.set('keyword', keyword);
  }

  if (params.categoryId) {
    searchParams.set('categoryId', params.categoryId);
  }

  if (params.brandId) {
    searchParams.set('brandId', params.brandId);
  }

  if (typeof params.minPrice === 'number' && Number.isFinite(params.minPrice)) {
    searchParams.set('minPrice', String(params.minPrice));
  }

  if (typeof params.maxPrice === 'number' && Number.isFinite(params.maxPrice)) {
    searchParams.set('maxPrice', String(params.maxPrice));
  }

  if (typeof params.featured === 'boolean') {
    searchParams.set('featured', String(params.featured));
  }

  return searchParams;
};
