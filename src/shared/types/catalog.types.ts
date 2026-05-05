import type { PaginatedItems } from '@/shared/types/api.types';
import type { ProductSort } from '@/shared/types/enums';

export interface Category {
  id: string;
  parentId?: string | null;
  slug: string;
  name: string;
  description: string;
  imageUrl: string;
  imageAlt: string;
  status?: string;
  sortOrder?: number;
  createdAt?: string;
  itemCount: number;
}

export interface Brand {
  id: string;
  slug: string;
  name: string;
  description: string;
  logoUrl?: string | null;
  status?: string;
  sortOrder?: number;
  createdAt?: string;
}

export interface ProductImage {
  id: string;
  src: string;
  alt: string;
  width: number;
  height: number;
}

export interface ProductSummary {
  id: string;
  slug: string;
  name: string;
  subtitle: string;
  brandId: string;
  brandName: string;
  categoryIds: string[];
  categorySlugs: string[];
  price: number;
  compareAtPrice?: number;
  badges: string[];
  rating: number;
  reviewCount: number;
  primaryImage: ProductImage;
  secondaryImage: ProductImage;
  featured: boolean;
  newArrival: boolean;
  createdAt?: string;
}

export interface ProductVariant {
  id: string;
  sku: string;
  color: string;
  size: string;
  stock: number;
  price: number;
  compareAtPrice?: number;
  swatch: string;
  image: ProductImage;
}

export interface ProductReview {
  id: string;
  author: string;
  rating: number;
  title: string;
  comment: string;
  createdAt: string;
  verifiedPurchase: boolean;
}

export interface ProductDetail extends ProductSummary {
  description: string;
  story: string;
  materials: string[];
  care: string[];
  media: ProductImage[];
  variants: ProductVariant[];
  reviews: ProductReview[];
}

export interface CategoryResponse {
  id: string;
  parentId: string | null;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  status: string;
  sortOrder: number;
  createdAt: string;
}

export interface BrandResponse {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  description: string | null;
  sortOrder: number;
  status: string;
  createdAt: string;
}

export interface ProductListItemResponse {
  id: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  thumbnailUrl: string | null;
  minPrice: number;
  maxPrice: number;
  status: string;
  featured: boolean;
  brandName: string | null;
  categoryNames: string[];
  createdAt: string;
}

export interface ProductAttributeResponse {
  name?: string | null;
  value?: string | null;
  attributeCode?: string | null;
  displayValue?: string | null;
}

export interface ProductVariantResponse {
  id: string;
  sku?: string | null;
  barcode: string | null;
  variantName?: string | null;
  basePrice?: number | null;
  salePrice: number | null;
  compareAtPrice: number | null;
  weightGram: number | null;
  status?: string | null;
  attributes?: ProductAttributeResponse[] | null;
}

export interface ProductMediaResponse {
  id: string;
  mediaUrl?: string | null;
  mediaType?: string | null;
  sortOrder?: number | null;
  primary?: boolean | null;
  variantId?: string | null;
}

export interface ProductReferenceResponse {
  id: string;
  name: string;
  slug?: string | null;
}

export interface ProductDetailResponse {
  id: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  description: string | null;
  status: string;
  featured: boolean;
  brand: ProductReferenceResponse | null;
  categories?: ProductReferenceResponse[] | null;
  variants?: ProductVariantResponse[] | null;
  media?: ProductMediaResponse[] | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProductFilters {
  keyword: string;
  category: string;
  brand: string;
  minPrice: string;
  maxPrice: string;
  sort: ProductSort;
}

export interface ProductListQuery extends ProductFilters {
  page: number;
}

export interface ProductListRequest {
  page?: number;
  size?: number;
  sort?: string;
  keyword?: string;
  categoryId?: string;
  brandId?: string;
  minPrice?: number;
  maxPrice?: number;
  featured?: boolean;
}

export interface ProductListResponse extends PaginatedItems<ProductSummary> {
  appliedFilters: ProductListQuery;
}
