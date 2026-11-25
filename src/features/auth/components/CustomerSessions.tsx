import { useState } from 'react';
import { Monitor, Smartphone } from 'lucide-react';

import { useCustomerSessions, useRevokeCustomerSession } from '@/features/auth/hooks/useCustomerSessions';
import { ErrorCard } from '@/shared/components/feedback/ErrorCard';
import { LoadingOverlay } from '@/shared/components/feedback/LoadingOverlay';
import { ConfirmDialog } from '@/shared/components/overlays/ConfirmDialog';
import { Badge } from '@/shared/components/ui/Badge';
import { Button } from '@/shared/components/ui/Button';
import type { ServiceError } from '@/shared/lib/serviceError';

const refreshedAt = new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short', timeStyle: 'short' });

const deviceLabel = (agent = '') => {
  const operatingSystem = /Android/i.test(agent) ? 'Android'
    : /iPhone|iPad|iPod/i.test(agent) ? 'iOS'
      : /Windows/i.test(agent) ? 'Windows'
        : /Macintosh|Mac OS/i.test(agent) ? 'macOS'
          : /Linux/i.test(agent) ? 'Linux' : '';
  const browser = /Edg/i.test(agent) ? 'Edge'
    : /Firefox|FxiOS/i.test(agent) ? 'Firefox'
      : /Chrome|CriOS/i.test(agent) ? 'Chrome'
        : /Safari/i.test(agent) ? 'Safari' : '';
  return [browser, operatingSystem].filter(Boolean).join(' · ') || 'Thiết bị chưa xác định';
};

export const CustomerSessions = () => {
  const query = useCustomerSessions();
  const revoke = useRevokeCustomerSession();
  const [selection, setSelection] = useState<{ id: string | null } | null>(null);
  const [announcement, setAnnouncement] = useState('');
  const sessions = query.data ?? [];
  const currentRecognized = sessions.some((session) => session.current);
  const otherSessions = sessions.some((session) => !session.current);

  // Allows deployment of Customer Web before the session endpoints exist.
  if ((query.error as ServiceError | null)?.status === 404) return null;

  return (
    <section aria-labelledby="customer-sessions-title" className="mt-8 max-w-2xl space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold" id="customer-sessions-title">Phiên đăng nhập đang hoạt động</h2>
          <p className="mt-1 text-sm leading-6 text-text-secondary">Quản lý các thiết bị đang đăng nhập vào tài khoản.</p>
        </div>
        {currentRecognized && otherSessions ? (
          <Button className="account-secondary-action" onClick={() => setSelection({ id: null })} variant="secondary">
            Đăng xuất khỏi thiết bị khác
          </Button>
        ) : null}
      </div>
      {announcement ? <p className="text-sm text-brand-primary" role="status">{announcement}</p> : null}
      {revoke.isError ? <p className="text-sm text-danger" role="alert">{revoke.error.message}</p> : null}
      {query.isLoading ? <LoadingOverlay inline label="Đang tải phiên đăng nhập…" /> : null}
      {query.isError ? (
        <ErrorCard
          action={<Button onClick={() => void query.refetch()}>Thử lại</Button>}
          description="Tải lại để xem các phiên đang hoạt động."
          title="Không thể tải phiên đăng nhập"
        />
      ) : null}
      {query.isSuccess && sessions.length === 0 ? (
        <p className="rounded-card border border-border bg-surface p-5 text-sm text-text-secondary">Chưa tìm thấy phiên đăng nhập đang hoạt động.</p>
      ) : null}
      {sessions.length > 0 && !currentRecognized ? (
        <p className="text-sm text-text-secondary">Đăng nhập lại để xác định thiết bị này và quản lý các phiên khác.</p>
      ) : null}
      {query.isSuccess && sessions.length > 0 ? (
        <ul className="divide-y divide-border rounded-card border border-border bg-surface">
          {sessions.map((session) => {
            const Icon = /Android|iPhone|iPad|Mobile/i.test(session.userAgent ?? '') ? Smartphone : Monitor;
            const device = deviceLabel(session.userAgent ?? '');

            return (
              <li className="flex flex-wrap items-center justify-between gap-3 p-4 sm:p-5" key={session.id}>
                <div className="flex min-w-0 items-start gap-3">
                  <Icon aria-hidden="true" className="mt-1 h-5 w-5 shrink-0 text-brand-primary" />
                  <div>
                    <div className="flex flex-wrap items-center gap-2 font-medium">
                      <p>{device}</p>
                      {session.current ? <Badge>Thiết bị này</Badge> : null}
                    </div>
                    <p className="mt-1 text-sm text-text-secondary">
                      Làm mới phiên <time dateTime={session.lastRefreshedAt}>{refreshedAt.format(new Date(session.lastRefreshedAt))}</time>
                    </p>
                  </div>
                </div>
                {!session.current && currentRecognized ? (
                  <Button aria-label={`Thu hồi phiên ${device}`} className="!text-sm !tracking-normal !text-danger" onClick={() => setSelection({ id: session.id })} variant="ghost">
                    Thu hồi
                  </Button>
                ) : null}
              </li>
            );
          })}
        </ul>
      ) : null}
      <ConfirmDialog
        cancelLabel="Hủy"
        confirmLabel="Thu hồi"
        confirmLoading={revoke.isPending}
        description="Thiết bị bị thu hồi sẽ cần đăng nhập lại để truy cập tài khoản."
        onClose={() => { if (!revoke.isPending) setSelection(null); }}
        onConfirm={() => {
          if (!selection || revoke.isPending) return;
          setAnnouncement('');
          revoke.mutate(selection.id, {
            onSuccess: () => { setSelection(null); setAnnouncement('Đã thu hồi phiên đăng nhập.'); },
            onError: () => setSelection(null),
          });
        }}
        open={selection !== null}
        title={selection?.id ? 'Thu hồi phiên đăng nhập?' : 'Đăng xuất khỏi các thiết bị khác?'}
      />
    </section>
  );
};
