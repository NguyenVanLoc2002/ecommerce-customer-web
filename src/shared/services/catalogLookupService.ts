import { apiClient } from '@/shared/lib/axios';
import { buildProductListSearchParams } from '@/shared/lib/productSearch';
import type { ApiResponse, PagedResponse } from '@/shared/types/api.types';
import type {
  BrandResponse,
  CategoryResponse,
  ProductListRequest,
  ProductDetailResponse,
  ProductListItemResponse,
} from '@/shared/types/catalog.types';

const productDetailByIdCache = new Map<string, Promise<ProductDetailResponse>>();
const productDetailBySlugCache = new Map<string, Promise<ProductDetailResponse | null>>();

let categoriesPromise: Promise<CategoryResponse[]> | null = null;
let brandsPromise: Promise<BrandResponse[]> | null = null;

const fetchCategories = async () =>
  apiClient.get<ApiResponse<CategoryResponse[]>, CategoryResponse[]>('/categories');

const fetchBrands = async () =>
  apiClient.get<ApiResponse<BrandResponse[]>, BrandResponse[]>('/brands');

export const catalogLookupService = {
  async getCategories() {
    categoriesPromise ??= fetchCategories();
    return categoriesPromise;
  },
  async getBrands() {
    brandsPromise ??= fetchBrands();
    return brandsPromise;
  },
  async getCategoryBySlug(slug: string) {
    const categories = await this.getCategories();
    return categories.find((category) => category.slug === slug) ?? null;
  },
  async getBrandBySlug(slug: string) {
    const brands = await this.getBrands();
    return brands.find((brand) => brand.slug === slug) ?? null;
  },
  async listProducts(params: ProductListRequest) {
    const searchParams = buildProductListSearchParams(params);
    const query = searchParams.toString();

    return apiClient.get<ApiResponse<PagedResponse<ProductListItemResponse>>, PagedResponse<ProductListItemResponse>>(
      query ? `/products?${query}` : '/products',
    );
  },
  async getProductDetailById(productId: string) {
    if (!productDetailByIdCache.has(productId)) {
      productDetailByIdCache.set(
        productId,
        apiClient.get<ApiResponse<ProductDetailResponse>, ProductDetailResponse>(`/products/${productId}`),
      );
    }

    return productDetailByIdCache.get(productId)!;
  },
  async getProductDetailBySlug(slug: string) {
    if (!productDetailBySlugCache.has(slug)) {
      productDetailBySlugCache.set(
        slug,
        (async () => {
          let page = 0;
          const size = 100;
          let hasNext = true;

          while (hasNext) {
            const response = await this.listProducts({
              page,
              size,
              sort: 'createdAt,desc',
            });

            const match = response.items.find((item) => item.slug === slug);
            if (match) {
              return this.getProductDetailById(match.id);
            }

            hasNext = response.hasNext;
            page += 1;
          }

          return null;
        })(),
      );
    }

    return productDetailBySlugCache.get(slug)!;
  },
};
