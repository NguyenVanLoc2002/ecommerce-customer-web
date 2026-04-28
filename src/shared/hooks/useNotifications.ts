import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/constants/queryKeys';
import { notificationService } from '@/shared/services/notificationService';
import { useAuthStore } from '@/shared/stores/authStore';
import type { Notification } from '@/shared/types/notification.types';

const countUnread = (notifications: Notification[]) =>
  notifications.filter((notification) => !notification.read).length;

export const useNotifications = () => {
  const user = useAuthStore((state) => state.user);

  return useQuery({
    queryKey: queryKeys.notifications.list,
    queryFn: notificationService.getNotifications,
    enabled: Boolean(user),
  });
};

export const useUnreadNotificationCount = () => {
  const user = useAuthStore((state) => state.user);

  return useQuery({
    queryKey: queryKeys.notifications.unreadCount,
    queryFn: notificationService.getUnreadCount,
    enabled: Boolean(user),
  });
};

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) => notificationService.markRead(notificationId),
    onMutate: async (notificationId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.notifications.list });
      await queryClient.cancelQueries({ queryKey: queryKeys.notifications.unreadCount });

      const previousNotifications = queryClient.getQueryData<Notification[]>(queryKeys.notifications.list);
      const previousUnreadCount = queryClient.getQueryData<number>(queryKeys.notifications.unreadCount);
      const target = previousNotifications?.find((notification) => notification.id === notificationId);

      if (previousNotifications && target && !target.read) {
        const nextNotifications = previousNotifications.map((notification) =>
          notification.id === notificationId
            ? { ...notification, read: true, status: 'READ' as const, readAt: new Date().toISOString() }
            : notification,
        );

        queryClient.setQueryData(queryKeys.notifications.list, nextNotifications);
        queryClient.setQueryData(
          queryKeys.notifications.unreadCount,
          Math.max((previousUnreadCount ?? countUnread(previousNotifications)) - 1, 0),
        );
      }

      return {
        previousNotifications,
        previousUnreadCount,
      };
    },
    onError: (_error, _notificationId, context) => {
      if (context?.previousNotifications) {
        queryClient.setQueryData(queryKeys.notifications.list, context.previousNotifications);
      }

      if (typeof context?.previousUnreadCount === 'number') {
        queryClient.setQueryData(queryKeys.notifications.unreadCount, context.previousUnreadCount);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.notifications.list });
      void queryClient.invalidateQueries({ queryKey: queryKeys.notifications.unreadCount });
    },
  });
};

export const useMarkAllNotificationsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: notificationService.markAllRead,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: queryKeys.notifications.list });
      await queryClient.cancelQueries({ queryKey: queryKeys.notifications.unreadCount });

      const previousNotifications = queryClient.getQueryData<Notification[]>(queryKeys.notifications.list);
      const previousUnreadCount = queryClient.getQueryData<number>(queryKeys.notifications.unreadCount);

      if (previousNotifications) {
        const readAt = new Date().toISOString();
        queryClient.setQueryData(
          queryKeys.notifications.list,
          previousNotifications.map((notification) => ({
            ...notification,
            read: true,
            status: 'READ' as const,
            readAt: notification.readAt ?? readAt,
          })),
        );
      }

      queryClient.setQueryData(queryKeys.notifications.unreadCount, 0);

      return {
        previousNotifications,
        previousUnreadCount,
      };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousNotifications) {
        queryClient.setQueryData(queryKeys.notifications.list, context.previousNotifications);
      }

      if (typeof context?.previousUnreadCount === 'number') {
        queryClient.setQueryData(queryKeys.notifications.unreadCount, context.previousUnreadCount);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.notifications.list });
      void queryClient.invalidateQueries({ queryKey: queryKeys.notifications.unreadCount });
    },
  });
};
