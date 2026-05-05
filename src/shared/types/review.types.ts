import type { ProductImage } from '@/shared/types/catalog.types';

export const REVIEW_STATUSES = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
} as const;

export type ReviewStatus = (typeof REVIEW_STATUSES)[keyof typeof REVIEW_STATUSES];

export interface Review {
  id: string;
  productId: string;
  rating: number;
  comment: string;
  createdAt: string;
  status: ReviewStatus;
  authorName: string;
  verifiedPurchase: boolean;
  variantId?: string;
  variantName?: string;
  sku?: string;
  orderItemId?: string;
  title?: string;
}

export interface ReviewListItem extends Review {
  orderId: string;
  orderItemId: string;
  productSlug: string;
  productName: string;
  brandName: string;
  productImage: ProductImage;
}

export interface ReviewCreateRequest {
  orderItemId: string;
  rating: number;
  comment: string;
}

export interface ReviewResponse {
  id: string;
  customerId: string;
  customerName: string;
  productId: string;
  productName: string;
  variantId: string | null;
  variantName: string | null;
  sku: string | null;
  orderItemId: string;
  rating: number;
  comment: string | null;
  status: ReviewStatus;
  adminNote: string | null;
  moderatedAt: string | null;
  moderatedBy: string | null;
  createdAt: string;
  updatedAt: string;
}
