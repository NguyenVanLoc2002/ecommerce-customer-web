import type { PaginatedItems } from '@/shared/types/api.types';
import type { ProductSort } from '@/shared/types/enums';

export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string;
  imageUrl: string;
  imageAlt: string;
  itemCount: number;
}

export interface Brand {
  id: string;
  slug: string;
  name: string;
  description: string;
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

export interface ProductFilters {
  keyword: string;
  category: string;
  brand: string;
  minPrice: string;
  maxPrice: string;
  sort: ProductSort;
}

export interface ProductListResponse extends PaginatedItems<ProductSummary> {
  appliedFilters: ProductFilters;
}

