import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildProductListRequest,
  buildProductListSearchParams,
  getProductListQueryFromSearchParams,
  getProductSortParam,
  trimProductKeyword,
} from './productSearch';
import { SORT_OPTIONS } from '../types/enums';
import type { ProductDetailResponse, ProductListItemResponse } from '../types/catalog.types';

test('trimProductKeyword preserves accented Vietnamese text and trims outer whitespace only', () => {
  assert.equal(trimProductKeyword('  áo thun  '), 'áo thun');
  assert.equal(trimProductKeyword('đầm'), 'đầm');
  assert.equal(trimProductKeyword('váy nữ'), 'váy nữ');
});

test('buildProductListSearchParams omits blank keyword and unsupported admin params', () => {
  const searchParams = buildProductListSearchParams({
    keyword: '   ',
    categoryId: 'category-1',
    brandId: 'brand-1',
    minPrice: 100000,
    maxPrice: 500000,
    sort: 'createdAt,desc',
  });

  assert.equal(searchParams.get('keyword'), null);
  assert.equal(searchParams.get('categoryId'), 'category-1');
  assert.equal(searchParams.get('brandId'), 'brand-1');
  assert.equal(searchParams.get('minPrice'), '100000');
  assert.equal(searchParams.get('maxPrice'), '500000');
  assert.equal(searchParams.get('isDeleted'), null);
  assert.equal(searchParams.get('includeDeleted'), null);
});

test('buildProductListRequest keeps keyword filters and resets to backend-compatible sort values', () => {
  const request = buildProductListRequest(
    {
      keyword: ' giày trắng ',
      category: 'accessories',
      brand: 'atelier-selene',
      minPrice: '200000',
      maxPrice: '900000',
      page: 2,
      sort: SORT_OPTIONS.NAME_ASC,
    },
    {
      categoryId: 'category-1',
      brandId: 'brand-1',
    },
  );

  assert.deepEqual(request, {
    keyword: 'giày trắng',
    categoryId: 'category-1',
    brandId: 'brand-1',
    minPrice: 200000,
    maxPrice: 900000,
    page: 2,
    size: 20,
    sort: 'name,asc',
  });
});

test('getProductListQueryFromSearchParams falls back from stale unsupported sort values', () => {
  const query = getProductListQueryFromSearchParams(
    new URLSearchParams('q=%C4%91%E1%BA%A7m&sort=price-asc&page=3&category=womenswear'),
  );

  assert.equal(query.keyword, 'đầm');
  assert.equal(query.page, 3);
  assert.equal(query.category, 'womenswear');
  assert.equal(query.sort, SORT_OPTIONS.FEATURED);
});

test('getProductSortParam maps only backend-compatible customer sort fields', () => {
  assert.equal(getProductSortParam(SORT_OPTIONS.FEATURED), 'featured,desc');
  assert.equal(getProductSortParam(SORT_OPTIONS.NEWEST), 'createdAt,desc');
  assert.equal(getProductSortParam(SORT_OPTIONS.UPDATED), 'updatedAt,desc');
  assert.equal(getProductSortParam(SORT_OPTIONS.NAME_ASC), 'name,asc');
});

test('customer product response types do not expose backend-internal searchText fields', () => {
  type ListItemHasSearchText = 'searchText' extends keyof ProductListItemResponse ? true : false;
  type ListItemHasSearchTextSnake = 'search_text' extends keyof ProductListItemResponse ? true : false;
  type DetailHasSearchText = 'searchText' extends keyof ProductDetailResponse ? true : false;
  type DetailHasSearchTextSnake = 'search_text' extends keyof ProductDetailResponse ? true : false;

  const assertions: [ListItemHasSearchText, ListItemHasSearchTextSnake, DetailHasSearchText, DetailHasSearchTextSnake] = [
    false,
    false,
    false,
    false,
  ];

  assert.deepEqual(assertions, [false, false, false, false]);
});
