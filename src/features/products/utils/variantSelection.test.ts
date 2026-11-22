import { describe, expect, it } from 'vitest';

import type { ProductVariant } from '@/shared/types/catalog.types';
import { getVariantAttributeGroups, getVariantValueStatus, resolveVariantSelection } from './variantSelection';

const variants: ProductVariant[] = [
  {
    id: 'variant-gray-m', sku: 'GRAY-M', color: 'Xám', size: 'M', status: 'ACTIVE', price: 1290000, swatch: '',
    image: { id: 'image-gray', src: '/gray.jpg', alt: 'Áo blazer màu xám', width: 800, height: 1000 },
    attributes: [
      { attributeId: 'color', attributeName: 'Màu sắc', attributeCode: 'COLOR', valueId: 'gray', value: 'gray', displayValue: 'Xám' },
      { attributeId: 'size', attributeName: 'Kích cỡ', attributeCode: 'SIZE', valueId: 'm', value: 'M', displayValue: 'M' },
    ],
  },
  {
    id: 'variant-gray-l', sku: 'GRAY-L', color: 'Xám', size: 'L', status: 'INACTIVE', price: 1290000, swatch: '',
    image: { id: 'image-gray', src: '/gray.jpg', alt: 'Áo blazer màu xám', width: 800, height: 1000 },
    attributes: [
      { attributeId: 'color', attributeName: 'Màu sắc', attributeCode: 'COLOR', valueId: 'gray', value: 'gray', displayValue: 'Xám' },
      { attributeId: 'size', attributeName: 'Kích cỡ', attributeCode: 'SIZE', valueId: 'l', value: 'L', displayValue: 'L' },
    ],
  },
  {
    id: 'variant-sand-s', sku: 'SAND-S', color: 'Be', size: 'S', status: 'ACTIVE', price: 1290000, swatch: '',
    image: { id: 'image-sand', src: '/sand.jpg', alt: 'Áo blazer màu be', width: 800, height: 1000 },
    attributes: [
      { attributeId: 'color', attributeName: 'Màu sắc', attributeCode: 'COLOR', valueId: 'sand', value: 'sand', displayValue: 'Be' },
      { attributeId: 'size', attributeName: 'Kích cỡ', attributeCode: 'SIZE', valueId: 's', value: 'S', displayValue: 'S' },
    ],
  },
];

describe('resolveVariantSelection', () => {
  const groups = getVariantAttributeGroups(variants);

  it('requires every catalog-backed attribute before resolving a variant', () => {
    expect(resolveVariantSelection(variants, groups, {}).status).toBe('unselected');
    expect(resolveVariantSelection(variants, groups, { color: 'gray' }).status).toBe('incomplete');
  });

  it('matches the exact attribute and value IDs', () => {
    expect(resolveVariantSelection(variants, groups, { color: 'gray', size: 'm' })).toMatchObject({
      status: 'active',
      variant: { id: 'variant-gray-m' },
    });
  });

  it('distinguishes missing combinations from inactive variants', () => {
    expect(resolveVariantSelection(variants, groups, { color: 'gray', size: 'xl' }).status).toBe('unavailable');
    expect(resolveVariantSelection(variants, groups, { color: 'gray', size: 'l' })).toMatchObject({
      status: 'inactive',
      variant: { id: 'variant-gray-l' },
    });
  });

  it('marks options unavailable or inactive against the other selected catalog values', () => {
    expect(getVariantValueStatus(variants, groups, { size: 'm' }, 'color', 'sand')).toBe('unavailable');
    expect(getVariantValueStatus(variants, groups, { color: 'gray' }, 'size', 'l')).toBe('inactive');
  });
});
