import { mockCatalog } from '@/shared/lib/mockCatalog';

export const homeService = {
  getCategories: () => mockCatalog.getCategories(),
  getFeaturedProducts: () => mockCatalog.getFeaturedProducts(),
  getNewArrivals: () => mockCatalog.getNewArrivals(),
};

