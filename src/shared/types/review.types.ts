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
