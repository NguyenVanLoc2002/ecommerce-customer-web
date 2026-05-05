import { apiClient } from '@/shared/lib/axios';
import { toNotification } from '@/shared/lib/apiMappers';
import type { ApiResponse, PagedResponse } from '@/shared/types/api.types';
import type { NotificationResponse, UnreadCountResponse } from '@/shared/types/notification.types';

const DEFAULT_PAGE_SIZE = 20;

export const notificationService = {
  async getNotifications() {
    const response = await apiClient.get<ApiResponse<PagedResponse<NotificationResponse>>, PagedResponse<NotificationResponse>>(
      `/notifications?page=0&size=${DEFAULT_PAGE_SIZE}&sort=createdAt,desc`,
    );

    return {
      ...response,
      items: response.items.map(toNotification),
    };
  },
  async getUnreadCount() {
    return apiClient.get<ApiResponse<UnreadCountResponse>, UnreadCountResponse>('/notifications/unread-count');
  },
  async markRead(notificationId: string) {
    const response = await apiClient.patch<ApiResponse<NotificationResponse>, NotificationResponse>(
      `/notifications/${notificationId}/read`,
      {},
    );

    return toNotification(response);
  },
  async markAllRead() {
    await apiClient.patch<ApiResponse<null>, null>('/notifications/read-all', {});
    return null;
  },
};
