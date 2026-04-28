import { config } from '@/constants/config';
import { apiClient } from '@/shared/lib/axios';
import { mockEngagement } from '@/shared/lib/mockEngagement';
import { normalizeApiError } from '@/shared/lib/normalizeApiError';
import type { Notification } from '@/shared/types/notification.types';

export const notificationService = {
  async getNotifications() {
    try {
      if (config.useMockData) {
        return await mockEngagement.getNotifications();
      }

      const response = await apiClient.get<Notification[]>('/notifications');
      return response.data;
    } catch (error) {
      throw normalizeApiError(error);
    }
  },
  async getUnreadCount() {
    try {
      if (config.useMockData) {
        return await mockEngagement.getUnreadNotificationCount();
      }

      const response = await apiClient.get<number>('/notifications/unread-count');
      return response.data;
    } catch (error) {
      throw normalizeApiError(error);
    }
  },
  async markRead(notificationId: string) {
    try {
      if (config.useMockData) {
        return await mockEngagement.markNotificationRead(notificationId);
      }

      const response = await apiClient.patch<Notification>(`/notifications/${notificationId}/read`, {});
      return response.data;
    } catch (error) {
      throw normalizeApiError(error);
    }
  },
  async markAllRead() {
    try {
      if (config.useMockData) {
        return await mockEngagement.markAllNotificationsRead();
      }

      await apiClient.patch('/notifications/read-all', {});
      return null;
    } catch (error) {
      throw normalizeApiError(error);
    }
  },
};
