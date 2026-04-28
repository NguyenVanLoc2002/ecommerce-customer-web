import { config } from '@/constants/config';
import { apiClient } from '@/shared/lib/axios';
import { mockEngagement } from '@/shared/lib/mockEngagement';
import { normalizeApiError } from '@/shared/lib/normalizeApiError';
import type { Review, ReviewCreateRequest, ReviewListItem } from '@/shared/types/review.types';

export const reviewService = {
  async getProductReviews(productId: string) {
    try {
      if (config.useMockData) {
        return await mockEngagement.getProductReviews(productId);
      }

      const response = await apiClient.get<Review[]>(`/reviews/product/${productId}`);
      return response.data;
    } catch (error) {
      throw normalizeApiError(error);
    }
  },
  async getMyReviews() {
    try {
      if (config.useMockData) {
        return await mockEngagement.getMyReviews();
      }

      const response = await apiClient.get<ReviewListItem[]>('/reviews/my');
      return response.data;
    } catch (error) {
      throw normalizeApiError(error);
    }
  },
  async createReview(payload: ReviewCreateRequest) {
    try {
      if (config.useMockData) {
        return await mockEngagement.createReview(payload);
      }

      // Contract note: current API docs list POST /reviews and a 200 OK response, but do not
      // document the full response body shape beyond the request payload semantics.
      const response = await apiClient.post<ReviewListItem>('/reviews', payload);
      return response.data;
    } catch (error) {
      throw normalizeApiError(error);
    }
  },
};
