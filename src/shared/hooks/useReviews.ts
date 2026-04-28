import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/constants/queryKeys';
import { reviewService } from '@/shared/services/reviewService';
import { useAuthStore } from '@/shared/stores/authStore';
import type { ReviewCreateRequest } from '@/shared/types/review.types';

export const useProductReviews = (productId: string) =>
  useQuery({
    queryKey: queryKeys.reviews.product(productId),
    queryFn: () => reviewService.getProductReviews(productId),
    enabled: Boolean(productId),
  });

export const useMyReviews = () => {
  const user = useAuthStore((state) => state.user);

  return useQuery({
    queryKey: queryKeys.reviews.mine,
    queryFn: reviewService.getMyReviews,
    enabled: Boolean(user),
  });
};

export const useCreateReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ReviewCreateRequest) => reviewService.createReview(payload),
    onSuccess: (review) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.reviews.mine });
      void queryClient.invalidateQueries({ queryKey: queryKeys.reviews.product(review.productId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.orders.detail(review.orderId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.orders.list });
    },
  });
};
