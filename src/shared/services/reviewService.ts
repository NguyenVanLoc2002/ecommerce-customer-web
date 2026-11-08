import { apiClient } from '@/shared/lib/axios';
import { toReview, toReviewListItem } from '@/shared/lib/apiMappers';
import type { ApiResponse, PagedResponse } from '@/shared/types/api.types';
import type { ReviewCreateRequest, ReviewResponse } from '@/shared/types/review.types';

const DEFAULT_PAGE_SIZE = 20;

export const reviewService = {
  async getProductReviews(productId: string) {
    const response = await apiClient.get<ApiResponse<PagedResponse<ReviewResponse>>, PagedResponse<ReviewResponse>>(
      `/reviews/product/${productId}?page=0&size=${DEFAULT_PAGE_SIZE}&sort=createdAt,desc`,
    );

    return {
      ...response,
      items: response.items.map(toReview),
    };
  },
  async getMyReviews() {
    const response = await apiClient.get<ApiResponse<PagedResponse<ReviewResponse>>, PagedResponse<ReviewResponse>>(
      `/reviews/my?page=0&size=${DEFAULT_PAGE_SIZE}&sort=createdAt,desc`,
    );

    return {
      ...response,
      items: response.items.map(toReviewListItem),
    };
  },
  async createReview(payload: ReviewCreateRequest) {
    const response = await apiClient.post<ApiResponse<ReviewResponse>, ReviewResponse>('/reviews', payload);
    return toReviewListItem(response);
  },
};
