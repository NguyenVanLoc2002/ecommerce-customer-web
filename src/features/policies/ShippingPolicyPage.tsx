import { useShippingPolicy } from '@/features/policies/useShippingPolicy';
import { EmptyState } from '@/shared/components/feedback/EmptyState';
import { ErrorCard } from '@/shared/components/feedback/ErrorCard';
import { Container } from '@/shared/components/layout/Container';
import { PageWrapper } from '@/shared/components/layout/PageWrapper';
import { PageSEO } from '@/shared/components/seo/PageSEO';
import { Button } from '@/shared/components/ui/Button';
import { routes } from '@/constants/routes';

const dateFormatter = new Intl.DateTimeFormat('vi-VN', {
  dateStyle: 'long',
  timeZone: 'Asia/Ho_Chi_Minh',
});

export default function ShippingPolicyPage() {
  const policy = useShippingPolicy();

  return (
    <PageWrapper>
      <PageSEO title={policy.data?.title ?? 'Chính sách giao hàng'}
        description="Thông tin giao hàng đang có hiệu lực của cửa hàng." path={routes.shippingPolicy} />
      <Container>
        <div className="mx-auto max-w-[70ch]">
          {policy.isPending ? <p role="status">Đang tải chính sách giao hàng…</p> : null}
          {policy.isError ? (
            <ErrorCard title="Không tải được chính sách giao hàng" description="Vui lòng thử lại."
              action={<Button onClick={() => void policy.refetch()}>Tải lại</Button>} />
          ) : null}
          {policy.isSuccess && !policy.data ? (
            <EmptyState title="Chính sách giao hàng" description="Hiện chưa có phiên bản công bố có hiệu lực." />
          ) : null}
          {policy.isSuccess && policy.data ? (
            <article>
              <h1 className="text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl">{policy.data.title}</h1>
              <p className="mt-3 text-sm text-text-secondary">
                Hiệu lực từ <time dateTime={policy.data.effectiveFrom}>{dateFormatter.format(new Date(policy.data.effectiveFrom))}</time>
              </p>
              <div className="mt-8 whitespace-pre-wrap break-words border-t border-border-subtle pt-6 leading-7 text-text-primary">
                {policy.data.content}
              </div>
            </article>
          ) : null}
        </div>
      </Container>
    </PageWrapper>
  );
}
