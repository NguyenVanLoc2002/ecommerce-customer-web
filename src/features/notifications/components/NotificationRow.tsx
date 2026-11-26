import { ArrowRight, Check, Clock3 } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Button } from '@/shared/components/ui/Button';
import { buttonStyles } from '@/shared/components/ui/buttonStyles';
import type { Notification } from '@/shared/types/notification.types';
import { cn } from '@/shared/utils/cn';
import { categories, formatNotificationDate, generalCategory, getCategory, getNotificationAction } from '../notificationPresentation';

type NotificationRowProps = {
  notification: Notification;
  busy: boolean;
  marking: boolean;
  onMarkRead: (id: string) => void;
};

export const NotificationRow = ({ busy, marking, notification, onMarkRead }: NotificationRowProps) => {
  const category = getCategory(notification.type);
  const { Icon, label } = category ? categories[category] : generalCategory;
  const action = getNotificationAction(notification);
  const date = formatNotificationDate(notification.createdAt);
  const { id, read } = notification;

  return (
    <article className={cn('flex flex-col gap-4 rounded-feature border bg-surface p-5 shadow-sm sm:flex-row sm:p-6', read ? 'border-border' : 'border-brand-primary/45')}>
      <span className={cn('flex size-10 shrink-0 items-center justify-center rounded-full', read ? 'bg-surface-muted text-text-secondary' : 'bg-brand-subtle text-brand-primary')}>
        <Icon aria-hidden="true" className="size-5" />
      </span>
      <div className="min-w-0 flex-1 space-y-2.5 [overflow-wrap:anywhere]">
        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-text-secondary">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-chip bg-surface-soft px-2 py-0.5 font-semibold uppercase tracking-wider text-text-primary">{label}</span>
            {date ? (
              <time className="inline-flex items-center gap-1" dateTime={notification.createdAt}>
                <Clock3 aria-hidden="true" className="size-3.5" />{date}
              </time>
            ) : null}
          </div>
          <span className={cn('flex items-center gap-1.5 font-medium', !read && 'text-brand-primary')}>
            {!read ? <span aria-hidden="true" className="size-2 rounded-full bg-brand-primary" /> : null}
            {read ? 'Đã đọc' : 'Chưa đọc'}
          </span>
        </div>
        <div>
          <h3 className={cn('text-base tracking-tight', read ? 'font-medium' : 'font-semibold')}>{notification.title}</h3>
          <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-text-secondary">{notification.body}</p>
        </div>
        {action || !read || marking ? (
          <div className="flex flex-wrap gap-2">
            {action ? (
              <Link className={buttonStyles({ className: cn('!text-xs !tracking-wide', !read && '!border-text-primary !bg-text-primary hover:!opacity-90'), size: 'sm', variant: read ? 'ghost' : 'primary' })} to={action.to}>
                {action.label}<ArrowRight aria-hidden="true" className="size-4" />
              </Link>
            ) : null}
            {!read || marking ? (
              <Button className="!px-3 !text-xs !tracking-normal" disabled={busy} loading={marking} onClick={() => onMarkRead(id)} size="sm" variant="ghost">
                {!marking ? <Check aria-hidden="true" className="size-4" /> : null}
                {marking ? 'Đang đánh dấu…' : 'Đánh dấu đã đọc'}
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>
    </article>
  );
};
