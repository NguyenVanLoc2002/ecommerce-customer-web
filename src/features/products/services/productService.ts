import { config } from '@/constants/config';
import { catalogLookupService } from '@/shared/services/catalogLookupService';
import { toBrand, toCategory, toProductDetail, toProductSummary } from '@/shared/lib/apiMappers';
import { isProductMissingError } from '@/shared/lib/productDetailErrors';
import { buildProductListRequest } from '@/shared/lib/productSearch';
import { mockCatalog } from '@/shared/lib/mockCatalog';
import type { ProductListQuery, ProductListResponse } from '@/shared/types/catalog.types';

const buildCategoryCounts = async () => {
  const categories = await catalogLookupService.getCategories();

  const counts = await Promise.all(
    categories.map(async (category) => {
      const response = await catalogLookupService.listProducts({
        categoryId: category.id,
        size: 1,
        sort: 'createdAt,desc',
      });

      return [category.id, response.totalItems] as const;
    }),
  );

  return new Map<string, number>(counts);
};

export const productService = {
  async getCategories() {
    if (config.useMockData) {
      return mockCatalog.getCategories();
    }

    const [categories, categoryCounts] = await Promise.all([
      catalogLookupService.getCategories(),
      buildCategoryCounts(),
    ]);

    return categories.map((category) => toCategory(category, categoryCounts.get(category.id) ?? 0));
  },
  async getBrands() {
    if (config.useMockData) {
      return mockCatalog.getBrands();
    }

    const brands = await catalogLookupService.getBrands();
    return brands.map(toBrand);
  },
  async getProducts(filters: ProductListQuery): Promise<ProductListResponse> {
    if (config.useMockData) {
      return mockCatalog.getProducts(filters);
    }

    const [category, brand] = await Promise.all([
      filters.category ? catalogLookupService.getCategoryBySlug(filters.category) : Promise.resolve(null),
      filters.brand ? catalogLookupService.getBrandBySlug(filters.brand) : Promise.resolve(null),
    ]);

    const response = await catalogLookupService.listProducts(
      buildProductListRequest(filters, {
        categoryId: category?.id ?? undefined,
        brandId: brand?.id ?? undefined,
      }),
    );

    return {
      ...response,
      items: response.items.map(toProductSummary),
      appliedFilters: filters,
    };
  },
  async getProductBySlug(slug: string) {
    if (config.useMockData) {
      return mockCatalog.getProductBySlug(slug);
    }

    let response;

    try {
      response = await catalogLookupService.getProductDetailBySlug(slug);
    } catch (error) {
      if (isProductMissingError(error)) {
        return null;
      }

      throw error;
    }

    if (!response) {
      return null;
    }

    return toProductDetail(response);
  },
  async getRelatedProducts(slug: string) {
    if (config.useMockData) {
      return mockCatalog.getRelatedProducts(slug);
    }

    const currentProduct = await catalogLookupService.getProductDetailBySlug(slug);

    if (!currentProduct) {
      return [];
    }

    const relatedCategoryId = currentProduct.categories?.[0]?.id;
    const response = await catalogLookupService.listProducts({
      categoryId: relatedCategoryId,
      size: 8,
      sort: 'createdAt,desc',
    });

    return response.items.filter((item) => item.id !== currentProduct.id).slice(0, 4).map(toProductSummary);
  },
};
