import { config } from '@/constants/config';
import { catalogLookupService } from '@/shared/services/catalogLookupService';
import { toCategory, toProductSummary } from '@/shared/lib/apiMappers';
import { mockCatalog } from '@/shared/lib/mockCatalog';

const HOME_PRODUCT_LIMIT = 4;

export const homeService = {
  async getCategories() {
    if (config.useMockData) {
      return mockCatalog.getCategories();
    }

    const categories = await catalogLookupService.getCategories();

    return categories.filter((category) => !category.parentId).map(toCategory);
  },
  async getFeaturedProducts() {
    if (config.useMockData) {
      return mockCatalog.getFeaturedProducts();
    }

    const response = await catalogLookupService.listProducts({
      featured: true,
      size: HOME_PRODUCT_LIMIT,
      sort: 'createdAt,desc',
    });

    return response.items.map(toProductSummary);
  },
  async getNewArrivals() {
    if (config.useMockData) {
      return mockCatalog.getNewArrivals();
    }

    const response = await catalogLookupService.listProducts({
      size: HOME_PRODUCT_LIMIT,
      sort: 'createdAt,desc',
    });

    return response.items.map(toProductSummary);
  },
};
