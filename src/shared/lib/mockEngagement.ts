import { config } from '@/constants/config';
import { mockCommerce } from '@/shared/lib/mockCommerce';
import { createServiceError } from '@/shared/lib/serviceError';
import { mockCatalog } from '@/shared/lib/mockCatalog';
import { useAuthStore } from '@/shared/stores/authStore';
import type { Notification } from '@/shared/types/notification.types';
import { NOTIFICATION_STATUSES, NOTIFICATION_TYPES } from '@/shared/types/notification.types';
import type { Review, ReviewCreateRequest, ReviewListItem } from '@/shared/types/review.types';
import { REVIEW_STATUSES } from '@/shared/types/review.types';
import { ORDER_STATUSES } from '@/shared/types/enums';

type StoredReview = ReviewListItem;
type StoredNotification = Notification;

type UserEngagementState = {
  reviews: StoredReview[];
  notifications: StoredNotification[];
};

type EngagementStorage = {
  users: Record<string, UserEngagementState>;
};

const defaultStorage: EngagementStorage = {
  users: {},
};

const getStorage = () => (typeof window === 'undefined' ? null : window.localStorage);

const readStorage = (): EngagementStorage => {
  const storage = getStorage();
  if (!storage) {
    return defaultStorage;
  }

  const raw = storage.getItem(config.mockEngagementKey);
  if (!raw) {
    return defaultStorage;
  }

  return JSON.parse(raw) as EngagementStorage;
};

const writeStorage = (value: EngagementStorage) => {
  const storage = getStorage();
  storage?.setItem(config.mockEngagementKey, JSON.stringify(value));
};

const getCurrentUser = () => {
  const user = useAuthStore.getState().user;
  if (!user) {
    throw createServiceError('UNAUTHORIZED', 'You must be signed in to access customer engagement data.');
  }

  return user;
};

const createSeedNotifications = (): StoredNotification[] => {
  const deliveredProduct = mockCatalog.getAllProductDetails()[0];
  const pendingProduct = mockCatalog.getAllProductDetails()[1];

  return [
    {
      id: 'notif-payment-001',
      type: NOTIFICATION_TYPES.PAYMENT,
      title: 'Payment needs your attention',
      body: 'Your latest online order is still awaiting payment confirmation. Return to the payment result page to complete the transaction.',
      referenceId: 'ord-pending-001',
      referenceType: 'ORDER',
      read: false,
      status: NOTIFICATION_STATUSES.UNREAD,
      readAt: null,
      createdAt: '2026-04-18T14:36:00Z',
      previewImage: pendingProduct?.primaryImage,
      actionLabel: 'Complete payment',
    },
    {
      id: 'notif-shipment-001',
      type: NOTIFICATION_TYPES.SHIPMENT,
      title: 'Shipment delivered successfully',
      body: 'Your delivered order reached the concierge desk. Open tracking to review the full handoff timeline and delivery details.',
      referenceId: 'ord-completed-001',
      referenceType: 'ORDER',
      read: false,
      status: NOTIFICATION_STATUSES.UNREAD,
      readAt: null,
      createdAt: '2026-04-11T09:10:00Z',
      previewImage: deliveredProduct?.primaryImage,
      actionLabel: 'Track shipment',
    },
    {
      id: 'notif-promo-001',
      type: NOTIFICATION_TYPES.PROMOTION,
      title: 'Private collection preview',
      body: 'A new tailoring edit is available in the archive. Discover the latest silhouettes and limited atelier finishes now.',
      referenceId: null,
      referenceType: null,
      read: true,
      status: NOTIFICATION_STATUSES.READ,
      readAt: '2026-04-09T08:30:00Z',
      createdAt: '2026-04-09T08:00:00Z',
      previewImage: deliveredProduct?.secondaryImage,
      actionLabel: 'Explore collection',
    },
    {
      id: 'notif-security-001',
      type: NOTIFICATION_TYPES.SECURITY,
      title: 'New sign-in detected',
      body: 'A new sign-in was detected on a Safari browser from Paris, France. If this was not you, review your account security.',
      referenceId: null,
      referenceType: null,
      read: true,
      status: NOTIFICATION_STATUSES.READ,
      readAt: '2026-04-07T06:20:00Z',
      createdAt: '2026-04-07T06:00:00Z',
      actionLabel: 'Review activity',
    },
  ];
};

const ensureUserState = (userId: string, storage: EngagementStorage): UserEngagementState => {
  const existing = storage.users[userId];
  if (existing) {
    return existing;
  }

  const next: UserEngagementState = {
    reviews: [],
    notifications: createSeedNotifications(),
  };

  storage.users[userId] = next;
  writeStorage(storage);

  return next;
};

const sortByCreatedAtDescending = <T extends { createdAt: string }>(items: T[]) =>
  [...items].sort((firstItem, secondItem) => new Date(secondItem.createdAt).getTime() - new Date(firstItem.createdAt).getTime());

const toPublicReview = (review: StoredReview): Review => ({
  id: review.id,
  productId: review.productId,
  rating: review.rating,
  comment: review.comment,
  createdAt: review.createdAt,
  status: review.status,
  authorName: review.authorName,
  verifiedPurchase: review.verifiedPurchase,
  title: review.title,
});

const toNotificationStatus = (read: boolean) => (read ? NOTIFICATION_STATUSES.READ : NOTIFICATION_STATUSES.UNREAD);

export const mockEngagement = {
  async getProductReviews(productId: string) {
    const product = await mockCatalog.getProductById(productId);
    if (!product) {
      throw createServiceError('PRODUCT_NOT_FOUND', 'This product could not be located.');
    }

    const publicReviews: Review[] = product.reviews.map((review) => ({
      id: review.id,
      productId,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt,
      status: REVIEW_STATUSES.APPROVED,
      authorName: review.author,
      verifiedPurchase: review.verifiedPurchase,
      title: review.title,
    }));

    const storage = readStorage();
    const approvedUserReviews = Object.values(storage.users)
      .flatMap((userState) => userState.reviews)
      .filter((review) => review.productId === productId && review.status === REVIEW_STATUSES.APPROVED)
      .map(toPublicReview);

    return sortByCreatedAtDescending([...publicReviews, ...approvedUserReviews]);
  },
  async getMyReviews() {
    const storage = readStorage();
    const user = getCurrentUser();
    const userState = ensureUserState(user.id, storage);

    return sortByCreatedAtDescending(userState.reviews);
  },
  async createReview(input: ReviewCreateRequest) {
    const storage = readStorage();
    const user = getCurrentUser();
    const userState = ensureUserState(user.id, storage);
    const orders = await mockCommerce.getOrders();

    const matchingOrder = orders.find((order) => order.items.some((item) => item.id === input.orderItemId));
    if (!matchingOrder) {
      throw createServiceError('ORDER_NOT_FOUND', 'The order item for this review could not be found.');
    }

    if (!(matchingOrder.status === ORDER_STATUSES.DELIVERED || matchingOrder.status === ORDER_STATUSES.COMPLETED)) {
      throw createServiceError('REVIEW_NOT_ELIGIBLE', 'Reviews are only available after an eligible order is delivered or completed.');
    }

    if (userState.reviews.some((review) => review.orderItemId === input.orderItemId)) {
      throw createServiceError('REVIEW_ALREADY_EXISTS', 'A review already exists for this order item.');
    }

    if (input.rating < 1 || input.rating > 5) {
      throw createServiceError('VALIDATION_ERROR', 'Select a rating before you submit the review.', {
        rating: 'Select a rating between 1 and 5.',
      });
    }

    const trimmedComment = input.comment.trim();
    if (trimmedComment.length < 12) {
      throw createServiceError('VALIDATION_ERROR', 'Review feedback is too short.', {
        comment: 'Write at least 12 characters of feedback.',
      });
    }

    const orderItem = matchingOrder.items.find((item) => item.id === input.orderItemId);
    if (!orderItem) {
      throw createServiceError('ORDER_NOT_FOUND', 'The order item for this review could not be found.');
    }

    const review: StoredReview = {
      id: `review-${crypto.randomUUID()}`,
      orderId: matchingOrder.id,
      orderItemId: orderItem.id,
      productId: orderItem.productId,
      productSlug: orderItem.productSlug,
      productName: orderItem.productName,
      brandName: orderItem.brandName,
      productImage: orderItem.primaryImage,
      rating: input.rating,
      comment: trimmedComment,
      createdAt: new Date().toISOString(),
      status: REVIEW_STATUSES.PENDING,
      authorName: `${user.firstName} ${user.lastName}`.trim(),
      verifiedPurchase: true,
    };

    userState.reviews.unshift(review);
    writeStorage(storage);

    return review;
  },
  async getNotifications() {
    const storage = readStorage();
    const user = getCurrentUser();
    const userState = ensureUserState(user.id, storage);

    return sortByCreatedAtDescending(userState.notifications);
  },
  async getUnreadNotificationCount() {
    const notifications = await this.getNotifications();
    return notifications.filter((notification) => !notification.read).length;
  },
  async markNotificationRead(notificationId: string) {
    const storage = readStorage();
    const user = getCurrentUser();
    const userState = ensureUserState(user.id, storage);
    const notification = userState.notifications.find((item) => item.id === notificationId);

    if (!notification) {
      throw createServiceError('NOTIFICATION_NOT_FOUND', 'This notification could not be found.');
    }

    if (!notification.read) {
      notification.read = true;
      notification.status = toNotificationStatus(true);
      notification.readAt = new Date().toISOString();
      writeStorage(storage);
    }

    return notification;
  },
  async markAllNotificationsRead() {
    const storage = readStorage();
    const user = getCurrentUser();
    const userState = ensureUserState(user.id, storage);
    const readAt = new Date().toISOString();

    userState.notifications = userState.notifications.map((notification) =>
      notification.read
        ? notification
        : {
            ...notification,
            read: true,
            status: toNotificationStatus(true),
            readAt,
          },
    );

    writeStorage(storage);
    return null;
  },
};
