import { apiClient } from '@/shared/lib/axios';
import { toProductDetail, toReview, toReviewListItem } from '@/shared/lib/apiMappers';
import { catalogLookupService } from '@/shared/services/catalogLookupService';
import type { ApiResponse, PagedResponse } from '@/shared/types/api.types';
import type { OrderResponse, OrderListItemResponse } from '@/shared/types/commerce.types';
import type { ReviewCreateRequest, ReviewListItem, ReviewResponse } from '@/shared/types/review.types';

const DEFAULT_PAGE_SIZE = 20;

const getOrdersPage = () =>
  apiClient.get<ApiResponse<PagedResponse<OrderListItemResponse>>, PagedResponse<OrderListItemResponse>>(
    `/orders?page=0&size=${DEFAULT_PAGE_SIZE}&sort=createdAt,desc`,
  );

const getOrderById = (orderId: string) => apiClient.get<ApiResponse<OrderResponse>, OrderResponse>(`/orders/${orderId}`);

const buildOrderItemMap = async () => {
  const orders = await getOrdersPage();
  const orderDetails = await Promise.all(orders.items.map((order) => getOrderById(order.id)));

  return new Map<string, string>(
    orderDetails.flatMap((order) => order.items.map((item) => [item.id, order.id] as const)),
  );
};

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
    const [response, orderItemMap] = await Promise.all([
      apiClient.get<ApiResponse<PagedResponse<ReviewResponse>>, PagedResponse<ReviewResponse>>(
        `/reviews/my?page=0&size=${DEFAULT_PAGE_SIZE}&sort=createdAt,desc`,
      ),
      buildOrderItemMap(),
    ]);

    const items = await Promise.all(
      response.items.map(async (review): Promise<ReviewListItem> => {
        const product = await catalogLookupService.getProductDetailById(review.productId);
        const mappedProduct = toProductDetail(product);

        return toReviewListItem(
          review,
          {
            productId: mappedProduct.id,
            productSlug: mappedProduct.slug,
            brandName: mappedProduct.brandName,
            primaryImage: mappedProduct.primaryImage,
          },
          orderItemMap.get(review.orderItemId) ?? '',
        );
      }),
    );

    return {
      ...response,
      items,
    };
  },
  async createReview(payload: ReviewCreateRequest) {
    const response = await apiClient.post<ApiResponse<ReviewResponse>, ReviewResponse>('/reviews', payload);
    const orderItemMap = await buildOrderItemMap();
    const product = await catalogLookupService.getProductDetailById(response.productId);
    const mappedProduct = toProductDetail(product);

    return toReviewListItem(
      response,
      {
        productId: mappedProduct.id,
        productSlug: mappedProduct.slug,
        brandName: mappedProduct.brandName,
        primaryImage: mappedProduct.primaryImage,
      },
      orderItemMap.get(response.orderItemId) ?? '',
    );
  },
};
