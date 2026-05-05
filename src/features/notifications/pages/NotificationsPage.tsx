import { useMemo, useState } from 'react';
import { Bell, Shield, Sparkles, Truck, Wallet } from 'lucide-react';
import { Link } from 'react-router-dom';

import { routePaths, routes } from '@/constants/routes';
import { EmptyState } from '@/shared/components/feedback/EmptyState';
import { ErrorCard } from '@/shared/components/feedback/ErrorCard';
import { Container } from '@/shared/components/layout/Container';
import { PageSEO } from '@/shared/components/seo/PageSEO';
import { Button } from '@/shared/components/ui/Button';
import { useMarkAllNotificationsRead, useMarkNotificationRead, useNotifications } from '@/shared/hooks/useNotifications';
import { NOTIFICATION_TYPES, type Notification, type NotificationType } from '@/shared/types/notification.types';
import { formatDate } from '@/shared/utils/formatDate';

type NotificationFilter = 'ALL' | 'ORDERS' | 'PROMOTIONS' | 'SECURITY';

const filterItems: Array<{ key: NotificationFilter; label: string }> = [
  { key: 'ALL', label: 'All Activity' },
  { key: 'ORDERS', label: 'Orders' },
  { key: 'PROMOTIONS', label: 'Promotions' },
  { key: 'SECURITY', label: 'Security' },
];

const iconMap: Record<NotificationType, typeof Bell> = {
  [NOTIFICATION_TYPES.ORDER]: Bell,
  [NOTIFICATION_TYPES.PAYMENT]: Wallet,
  [NOTIFICATION_TYPES.SHIPMENT]: Truck,
  [NOTIFICATION_TYPES.PROMOTION]: Sparkles,
  [NOTIFICATION_TYPES.SECURITY]: Shield,
};

const filterNotification = (notification: Notification, filter: NotificationFilter) => {
  if (filter === 'ALL') {
    return true;
  }

  if (filter === 'ORDERS') {
    return (
      notification.type === NOTIFICATION_TYPES.ORDER ||
      notification.type === NOTIFICATION_TYPES.PAYMENT ||
      notification.type === NOTIFICATION_TYPES.SHIPMENT
    );
  }

  if (filter === 'PROMOTIONS') {
    return notification.type === NOTIFICATION_TYPES.PROMOTION;
  }

  return notification.type === NOTIFICATION_TYPES.SECURITY;
};

const getNotificationLink = (notification: Notification) => {
  if (notification.type === NOTIFICATION_TYPES.PAYMENT && notification.referenceId) {
    return routePaths.paymentResult(notification.referenceId);
  }

  if (notification.type === NOTIFICATION_TYPES.SHIPMENT && notification.referenceId) {
    return routePaths.orderTracking(notification.referenceId);
  }

  if (notification.referenceType === 'ORDER' && notification.referenceId) {
    return routePaths.orderDetail(notification.referenceId);
  }

  if (notification.type === NOTIFICATION_TYPES.PROMOTION) {
    return routes.products;
  }

  return routes.notifications;
};

const getNotificationActionLabel = (notification: Notification) => {
  if (notification.actionLabel) {
    return notification.actionLabel;
  }

  if (notification.type === NOTIFICATION_TYPES.PROMOTION) {
    return 'Explore collection';
  }

  return 'Open';
};

export const NotificationsPage = () => {
  const notificationsQuery = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const [activeFilter, setActiveFilter] = useState<NotificationFilter>('ALL');
  const notifications = useMemo(() => notificationsQuery.data?.items ?? [], [notificationsQuery.data]);
  const filteredNotifications = useMemo(
    () => notifications.filter((notification) => filterNotification(notification, activeFilter)),
    [activeFilter, notifications],
  );
  const unreadCount = notifications.filter((notification) => !notification.read).length;

  return (
    <>
      <PageSEO description="Review order, payment, shipment, promotion, and security updates." noIndex path={routes.notifications} title="Notifications" />
      <Container className="space-y-10 pb-16 pt-28 md:space-y-12 md:pb-20 md:pt-32">
        <section className="border-b border-border pb-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-outline">Your activity</p>
              <h1 className="mt-3 font-display text-[3rem] leading-none text-text-primary md:text-[4rem]">Notifications</h1>
            </div>
            <div className="flex gap-3">
              <Button disabled={markAllRead.isPending || unreadCount === 0} onClick={() => markAllRead.mutate()} variant="ghost">
                {markAllRead.isPending ? 'Marking...' : 'Mark all as read'}
              </Button>
            </div>
          </div>
        </section>

        {notificationsQuery.isLoading ? (
          <div className="space-y-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <div className="grid gap-6 border border-border bg-surface px-5 py-5 md:grid-cols-[80px_minmax(0,1fr)] md:px-8 md:py-8" key={index}>
                <div className="h-24 w-20 bg-surface-soft shimmer animate-shimmer" />
                <div className="shimmer animate-shimmer space-y-4">
                  <div className="h-3 w-24 bg-surface-soft" />
                  <div className="h-8 w-72 bg-surface-soft" />
                  <div className="h-4 w-full bg-surface-soft" />
                  <div className="h-4 w-4/5 bg-surface-soft" />
                  <div className="h-4 w-40 bg-surface-soft" />
                </div>
              </div>
            ))}
          </div>
        ) : null}
        {notificationsQuery.isError ? (
          <ErrorCard
            action={<Button onClick={() => void notificationsQuery.refetch()}>Retry</Button>}
            className="border-border bg-surface"
            description="The notification archive could not be loaded from the current service."
            title="Notifications unavailable"
          />
        ) : null}
        {!notificationsQuery.isLoading && !notificationsQuery.isError && notifications.length === 0 ? (
          <EmptyState
            className="border-border bg-surface px-6 py-16"
            description="Order, payment, shipment, and editorial updates will appear here as soon as activity begins."
            title="No notifications yet."
          />
        ) : null}

        {!notificationsQuery.isLoading && !notificationsQuery.isError && notifications.length > 0 ? (
          <section className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            <aside className="hidden lg:col-span-3 lg:block">
              <div className="sticky top-[140px] space-y-4">
                <ul className="space-y-4">
                  {filterItems.map((item) => (
                    <li key={item.key}>
                      <button
                        className={`block w-full border-b pb-2 text-left text-[11px] font-bold uppercase tracking-[0.18em] transition-colors ${activeFilter === item.key ? 'border-text-primary text-text-primary' : 'border-transparent text-text-secondary hover:border-border hover:text-text-primary'}`}
                        onClick={() => setActiveFilter(item.key)}
                        type="button"
                      >
                        {item.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>

            <div className="flex gap-3 overflow-x-auto lg:hidden">
              {filterItems.map((item) => (
                <button
                  className={`shrink-0 border px-4 py-2 text-[11px] font-bold uppercase tracking-[0.16em] ${activeFilter === item.key ? 'border-text-primary bg-surface text-text-primary' : 'border-border bg-surface text-text-secondary'}`}
                  key={item.key}
                  onClick={() => setActiveFilter(item.key)}
                  type="button"
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="space-y-6 lg:col-span-9">
              {filteredNotifications.length === 0 ? (
                <EmptyState
                  className="border-border bg-surface px-6 py-16"
                  description="No notifications match the current category filter."
                  title="Nothing in this category."
                />
              ) : (
                filteredNotifications.map((notification) => {
                  const Icon = iconMap[notification.type];

                  return (
                    <article className={`group relative border px-5 py-5 transition-colors duration-300 md:px-8 md:py-8 ${notification.read ? 'border-border bg-surface' : 'border-text-primary/20 bg-surface'}`} key={notification.id}>
                      {!notification.read ? <span className="absolute right-5 top-5 h-2.5 w-2.5 rounded-full bg-text-primary" /> : null}
                      <div className="flex flex-col gap-6 md:flex-row">
                        {notification.previewImage ? (
                          <div className="h-24 w-20 shrink-0 overflow-hidden bg-surface-soft">
                            <img
                              alt={notification.previewImage.alt}
                              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                              height={notification.previewImage.height}
                              loading="lazy"
                              src={notification.previewImage.src}
                              width={notification.previewImage.width}
                            />
                          </div>
                        ) : (
                          <div className="flex h-20 w-20 shrink-0 items-center justify-center bg-surface-soft text-text-primary">
                            <Icon className="h-6 w-6" strokeWidth={1.6} />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                            <div>
                              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-outline">{notification.type}</p>
                              <h2 className="mt-2 font-display text-[1.65rem] leading-none text-text-primary">{notification.title}</h2>
                            </div>
                            <p className="text-sm text-text-secondary">{formatDate(notification.createdAt)}</p>
                          </div>
                          <p className="mt-4 max-w-2xl text-sm leading-7 text-text-secondary">{notification.body}</p>
                          <div className="mt-6 flex flex-wrap gap-6">
                            <Link className="border-b border-text-primary pb-1 text-[11px] font-bold uppercase tracking-[0.16em] text-text-primary" onClick={() => !notification.read && markRead.mutate(notification.id)} to={getNotificationLink(notification)}>
                              {getNotificationActionLabel(notification)}
                            </Link>
                            {!notification.read ? (
                              <button
                                className="border-b border-transparent pb-1 text-[11px] font-bold uppercase tracking-[0.16em] text-text-secondary transition-colors hover:border-border hover:text-text-primary"
                                onClick={() => markRead.mutate(notification.id)}
                                type="button"
                              >
                                Mark read
                              </button>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })
              )}
            </div>
          </section>
        ) : null}
      </Container>
    </>
  );
};

export default NotificationsPage;
