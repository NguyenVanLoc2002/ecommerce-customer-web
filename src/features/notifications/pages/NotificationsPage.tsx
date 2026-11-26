import { useState } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

import { routes } from '@/constants/routes';
import { EmptyState } from '@/shared/components/feedback/EmptyState';
import { ErrorCard } from '@/shared/components/feedback/ErrorCard';
import { Container } from '@/shared/components/layout/Container';
import { PageSEO } from '@/shared/components/seo/PageSEO';
import { Button } from '@/shared/components/ui/Button';
import { useMarkAllNotificationsRead, useMarkNotificationRead, useNotifications, useUnreadNotificationCount } from '@/shared/hooks/useNotifications';
import { cn } from '@/shared/utils/cn';
import { NotificationRow } from '../components/NotificationRow';
import { categories, getCategory, groupNotifications, type Category } from '../notificationPresentation';

const filters: { key: 'all' | Category; label: string }[] = [
  { key: 'all', label: 'Tất cả' },
  { key: 'order', label: categories.order.label },
  { key: 'payment', label: categories.payment.label },
  { key: 'shipping', label: categories.shipping.label },
  { key: 'promo', label: categories.promo.label },
  { key: 'security', label: categories.security.label },
];

export const NotificationsPage = () => {
  const notificationsQuery = useNotifications();
  const unreadQuery = useUnreadNotificationCount();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const [activeFilter, setActiveFilter] = useState<'all' | Category>('all');
  const [onlyUnread, setOnlyUnread] = useState(false);
  const [feedback, setFeedback] = useState<{ error?: boolean; message: string }>();
  const notifications = notificationsQuery.data?.items ?? [];
  const unreadCount = unreadQuery.data ?? notifications.filter(({ read }) => !read).length;
  const busy = markRead.isPending || markAllRead.isPending;
  const groups = groupNotifications(notifications.filter((item) =>
    (activeFilter === 'all' || getCategory(item.type) === activeFilter)
    && (!onlyUnread || !item.read || (markRead.isPending && markRead.variables === item.id)),
  ));

  const markAsRead = (id?: string) => {
    if (busy) return;
    setFeedback(undefined);
    if (id !== undefined) {
      markRead.mutate(id, {
        onSuccess: () => setFeedback({ message: 'Đã đánh dấu thông báo là đã đọc.' }),
        onError: () => setFeedback({ error: true, message: 'Không thể đánh dấu thông báo. Vui lòng thử lại.' }),
      });
    } else {
      markAllRead.mutate(undefined, {
        onSuccess: () => setFeedback({ message: 'Đã đánh dấu tất cả thông báo là đã đọc.' }),
        onError: () => setFeedback({ error: true, message: 'Không thể đánh dấu tất cả thông báo. Vui lòng thử lại.' }),
      });
    }
  };

  return (
    <>
      <PageSEO description="Cập nhật đơn hàng, thanh toán, vận chuyển và tài khoản Fashion Shop." noIndex path={routes.notifications} title="Trung tâm thông báo" />
      <div className="bg-surface-muted pt-[72px] md:pt-20">
        <Container>
          <nav aria-label="Đường dẫn" className="flex flex-wrap items-center gap-2 py-4 text-xs text-text-secondary">
            <Link className="hover:underline" to={routes.home}>Trang chủ</Link>
            <span aria-hidden="true">/</span>
            <Link className="hover:underline" to={routes.profile}>Tài khoản</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page" className="font-medium text-text-primary">Trung tâm thông báo</span>
          </nav>
        </Container>
      </div>
      <Container className="space-y-8 pb-16 pt-8 md:space-y-10 md:pb-24 md:pt-16">
        <header className="flex flex-col gap-5 pb-2 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-2">
            <h1 className="text-3xl font-semibold leading-tight tracking-tight md:text-4xl">Trung tâm thông báo</h1>
            <p className="text-sm leading-relaxed text-text-secondary md:text-base">
              Cập nhật về đơn hàng, thanh toán, vận chuyển và tài khoản của bạn.
            </p>
          </div>
          <Button
            className="self-start !border-transparent !bg-surface-soft !px-5 !text-xs !tracking-wide hover:!bg-surface-muted lg:self-end"
            disabled={busy || unreadCount === 0 || notificationsQuery.isLoading || notificationsQuery.isError}
            loading={markAllRead.isPending}
            onClick={() => markAsRead()}
            variant="ghost"
          >
            {!markAllRead.isPending ? <CheckCheck aria-hidden="true" className="size-4" /> : null}
            {markAllRead.isPending ? 'Đang đánh dấu…' : 'Đánh dấu đã đọc tất cả'}
          </Button>
        </header>

        <div className="flex flex-col gap-2 rounded-feature border border-border bg-surface p-3 shadow-sm sm:p-4 lg:flex-row lg:items-center lg:justify-between">
          <div aria-label="Loại thông báo" className="flex flex-wrap gap-1.5" role="group">
            {filters.map(({ key, label }) => (
              <button
                aria-pressed={activeFilter === key}
                className={cn('min-h-11 rounded-button px-3 text-xs font-medium uppercase tracking-wide transition-colors sm:px-4',
                  activeFilter === key ? 'bg-text-primary text-white' : 'text-text-secondary hover:bg-surface-muted hover:text-text-primary')}
                key={key}
                onClick={() => setActiveFilter(key)}
                type="button"
              >
                {label}
              </button>
            ))}
          </div>
          <label className="flex min-h-11 shrink-0 cursor-pointer items-center gap-2.5 px-2 text-xs font-medium">
            <input checked={onlyUnread} className="size-4 accent-brand-primary" onChange={(event) => setOnlyUnread(event.target.checked)} type="checkbox" />
            Chỉ hiện chưa đọc
            <span className="rounded-chip bg-brand-subtle px-2 py-0.5 text-brand-primary">{unreadCount}</span>
          </label>
        </div>

        <div className="space-y-8 lg:w-2/3">
          <p className={feedback && !feedback.error ? 'rounded-card border border-border bg-brand-subtle px-4 py-3 text-sm text-brand-primary' : 'sr-only'} role="status">
            {feedback && !feedback.error ? feedback.message : null}
          </p>
          {feedback?.error ? <p className="rounded-card border border-danger/30 bg-surface px-4 py-3 text-sm text-danger" role="alert">{feedback.message}</p> : null}

          {notificationsQuery.isLoading ? (
            <div className="space-y-3" role="status">
              <span className="sr-only">Đang tải thông báo</span>
              {[1, 2, 3].map((row) => (
                <div aria-hidden="true" className="flex gap-4 rounded-feature border border-border bg-surface p-6 motion-safe:animate-pulse" key={row}>
                  <div className="size-10 shrink-0 rounded-full bg-surface-soft" />
                  <div className="flex-1 space-y-3 py-1">
                    <div className="h-3 w-24 rounded-chip bg-surface-soft" />
                    <div className="h-4 w-2/3 rounded-chip bg-surface-soft" />
                    <div className="h-3 w-full rounded-chip bg-surface-muted" />
                  </div>
                </div>
              ))}
            </div>
          ) : notificationsQuery.isError ? (
            <ErrorCard
              action={<Button loading={notificationsQuery.isFetching} onClick={() => void notificationsQuery.refetch()}>Thử lại</Button>}
              className="rounded-feature"
              description="Vui lòng kiểm tra kết nối và thử lại."
              title="Không thể tải thông báo"
            />
          ) : groups.length === 0 ? (
            <div className="relative">
              <Bell aria-hidden="true" className="absolute left-1/2 top-6 size-6 -translate-x-1/2 text-brand-primary" />
              <EmptyState
                className="rounded-feature pt-16"
                description={notifications.length === 0 ? 'Cập nhật về đơn hàng và tài khoản sẽ xuất hiện tại đây.' : 'Hãy chọn bộ lọc khác để xem thêm thông báo.'}
                title={notifications.length === 0 ? 'Bạn chưa có thông báo' : 'Không có thông báo phù hợp'}
              />
            </div>
          ) : (
            groups.map(({ label, items }) => (
              <section aria-label={label} className="space-y-3" key={label}>
                <div className="flex items-center justify-between gap-3 px-1 text-text-secondary">
                  <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em]">
                    <span aria-hidden="true" className="size-1.5 rounded-full bg-brand-primary" />{label}
                  </h2>
                  <span className="text-xs">{items.length} thông báo</span>
                </div>
                {items.map((notification) => (
                  <NotificationRow
                    busy={busy}
                    key={notification.id}
                    marking={markRead.isPending && markRead.variables === notification.id}
                    notification={notification}
                    onMarkRead={markAsRead}
                  />
                ))}
              </section>
            ))
          )}
        </div>
      </Container>
    </>
  );
};

export default NotificationsPage;
