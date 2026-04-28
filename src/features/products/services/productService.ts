import { mockCatalog } from '@/shared/lib/mockCatalog';
import type { ProductFilters } from '@/shared/types/catalog.types';

export const productService = {
  getCategories: () => mockCatalog.getCategories(),
  getBrands: () => mockCatalog.getBrands(),
  getProducts: (filters: ProductFilters) => mockCatalog.getProducts(filters),
  getProductBySlug: (slug: string) => mockCatalog.getProductBySlug(slug),
  getRelatedProducts: (slug: string) => mockCatalog.getRelatedProducts(slug),
};

