import test from 'node:test';
import assert from 'node:assert/strict';

import { mapProductDetailResponse } from './productDetailMapper';
import { isProductMissingError } from './productDetailErrors';
import { createServiceError } from './serviceError';
import { unwrapApiResponseData } from './unwrapApiResponseData';
import type { ApiResponse } from '../types/api.types';
import type { ProductDetailResponse, ProductVariantResponse } from '../types/catalog.types';

const baseProductDetailResponse: ProductDetailResponse = {
  id: 'product-1',
  name: 'Local Brand VN Canvas Bag 083',
  slug: 'local-brand-vn-canvas-bag-083',
  shortDescription: 'Structured canvas carryall.',
  description: 'A utility-led tote with reinforced handles.',
  status: 'PUBLISHED',
  featured: true,
  brand: {
    id: 'brand-1',
    name: 'Local Brand VN',
    slug: 'local-brand-vn',
  },
  categories: [
    {
      id: 'category-1',
      name: 'Accessories',
      slug: 'accessories',
    },
  ],
  variants: [
    {
      id: 'variant-1',
      sku: 'LVB-083-BLK',
      barcode: null,
      variantName: 'Black / Large',
      basePrice: 1500000,
      salePrice: 1200000,
      compareAtPrice: 1700000,
      weightGram: 1000,
      status: 'ACTIVE',
      attributes: [
        {
          attributeCode: 'COLOR',
          displayValue: 'Black',
          value: 'black',
        },
        {
          attributeCode: 'SIZE',
          displayValue: 'Large',
          value: 'L',
        },
      ],
    },
    {
      id: 'variant-2',
      sku: 'LVB-083-WHT',
      barcode: null,
      variantName: 'White / Medium',
      basePrice: 1100000,
      salePrice: null,
      compareAtPrice: 1000000,
      weightGram: 800,
      status: 'ACTIVE',
      attributes: [
        {
          name: 'COLOR',
          value: 'White',
        },
        {
          name: 'SIZE',
          value: 'Medium',
        },
      ],
    },
  ],
  media: [
    {
      id: 'media-2',
      mediaUrl: 'https://cdn.example.com/detail-secondary.jpg',
      mediaType: 'IMAGE',
      sortOrder: 2,
      primary: false,
      variantId: null,
    },
    {
      id: 'media-1',
      mediaUrl: 'https://cdn.example.com/detail-primary.jpg',
      mediaType: 'IMAGE',
      sortOrder: 10,
      primary: true,
      variantId: null,
    },
    {
      id: 'media-3',
      mediaUrl: 'https://cdn.example.com/variant-black.jpg',
      mediaType: 'IMAGE',
      sortOrder: 1,
      primary: false,
      variantId: 'variant-1',
    },
  ],
  createdAt: '2026-05-05T00:00:00Z',
  updatedAt: '2026-05-05T01:00:00Z',
};

test('unwrapApiResponseData returns payload.data from ApiResponse envelopes', () => {
  const envelope: ApiResponse<{ id: string }> = {
    success: true,
    code: 'SUCCESS',
    message: 'Request processed successfully',
    data: {
      id: 'product-1',
    },
    timestamp: '2026-05-05T00:00:00Z',
  };

  assert.deepEqual(unwrapApiResponseData(envelope), { id: 'product-1' });
});

test('mapProductDetailResponse tolerates extra backend fields and maps primary media first', () => {
  const [firstVariant] = baseProductDetailResponse.variants ?? [];
  assert.ok(firstVariant);

  const variantWithExtraField: ProductVariantResponse & { unknownNestedField: string } = {
    ...firstVariant,
    unknownNestedField: 'ignored',
  };

  const mapped = mapProductDetailResponse({
    ...baseProductDetailResponse,
    variants: [variantWithExtraField],
    extraField: 'ignored',
  } as ProductDetailResponse & { extraField: string });

  assert.equal(mapped.slug, 'local-brand-vn-canvas-bag-083');
  assert.equal(mapped.primaryImage.src, 'https://cdn.example.com/detail-primary.jpg');
  assert.equal(mapped.media[0].src, 'https://cdn.example.com/detail-primary.jpg');
  assert.equal(mapped.media[1].src, 'https://cdn.example.com/variant-black.jpg');
});

test('mapProductDetailResponse uses salePrice first and compareAtPrice only when greater', () => {
  const mapped = mapProductDetailResponse(baseProductDetailResponse);

  assert.equal(mapped.price, 1200000);
  assert.equal(mapped.compareAtPrice, 1700000);
  assert.equal(mapped.variants[0].price, 1200000);
  assert.equal(mapped.variants[0].compareAtPrice, 1700000);
  assert.equal(mapped.variants[1].price, 1100000);
  assert.equal(mapped.variants[1].compareAtPrice, undefined);
});

test('mapProductDetailResponse reads COLOR and SIZE from attributeCode or name', () => {
  const mapped = mapProductDetailResponse(baseProductDetailResponse);

  assert.equal(mapped.variants[0].color, 'Black');
  assert.equal(mapped.variants[0].size, 'Large');
  assert.equal(mapped.variants[1].color, 'White');
  assert.equal(mapped.variants[1].size, 'Medium');
});

test('isProductMissingError identifies 404-style catalog misses for page fallback', () => {
  assert.equal(isProductMissingError(createServiceError('PRODUCT_NOT_FOUND', 'Missing')), true);
  assert.equal(isProductMissingError(createServiceError('PRODUCT_INACTIVE', 'Inactive')), true);
  assert.equal(isProductMissingError(createServiceError('REQUEST_FAILED', 'Other error')), false);
});
