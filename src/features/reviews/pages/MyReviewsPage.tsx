import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

import { routePaths, routes } from '@/constants/routes';
import { EmptyState } from '@/shared/components/feedback/EmptyState';
import { ErrorCard } from '@/shared/components/feedback/ErrorCard';
import { BreadcrumbNav } from '@/shared/components/layout/BreadcrumbNav';
import { buttonStyles } from '@/shared/components/ui/buttonStyles';
import { useAuthStore } from '@/shared/stores/authStore';
import { Container } from '@/shared/components/layout/Container';
import { PageSEO } from '@/shared/components/seo/PageSEO';
import { ReviewStatusBadge } from '@/shared/components/reviews/ReviewStatusBadge';
import { StarRatingDisplay } from '@/shared/components/reviews/StarRatingDisplay';
import { Button } from '@/shared/components/ui/Button';
import { useMyReviews } from '@/shared/hooks/useReviews';
import { formatDate } from '@/shared/utils/formatDate';

export const MyReviewsPage = () => {
  const user = useAuthStore((state) => state.user);
  const myReviewsQuery = useMyReviews();
  const reviews = myReviewsQuery.data?.items ?? [];

  return (
    <>
      <PageSEO description="Review your submitted customer feedback and moderation status." noIndex path={routes.profileReviews} title="My Reviews" />
      <Container className="pb-16 pt-28 md:pb-20 md:pt-32">
        <div className="mb-8 rounded bg-surface-soft px-4 py-3 md:mb-10">
          <BreadcrumbNav items={[
            { label: 'Trang chủ', href: routes.home },
            { label: 'Tài khoản', href: routes.profile },
            { label: 'Đánh giá của tôi' },
          ]} />
        </div>
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,3.4fr)] lg:gap-10">
          <aside className="space-y-4">
            {user ? (
              <div className="flex items-center gap-4 rounded-lg bg-surface p-5 shadow-sm">
                <span aria-hidden="true" className="grid size-12 shrink-0 place-items-center rounded-full bg-surface-muted font-semibold text-brand-primary">{user.firstName?.[0]}{user.lastName?.[0]}</span>
                <div className="min-w-0 break-words">
                  <p className="font-semibold">{user.firstName} {user.lastName}</p>
                  <p className="mt-1 text-sm text-text-secondary">{user.email}</p>
                </div>
              </div>
            ) : null}
            <nav aria-label="Tài khoản" className="rounded-lg bg-surface p-3 shadow-sm">
              {[
                { label: 'Hồ sơ cá nhân', href: routes.profile },
                { label: 'Bảo mật tài khoản', href: routes.profileSecurity },
                { label: 'Sổ địa chỉ', href: routes.profileAddresses },
                { label: 'Đơn hàng của tôi', href: routes.orders },
                { label: 'Đánh giá của tôi', href: routes.profileReviews },
              ].map(({ href, label }) => (
                <Link
                  aria-current={href === routes.profileReviews ? 'page' : undefined}
                  className={href === routes.profileReviews
                    ? 'flex min-h-11 items-center justify-between gap-2 rounded bg-brand-primary px-3 text-sm font-semibold text-surface'
                    : 'flex min-h-11 items-center justify-between gap-2 rounded px-3 text-sm text-text-secondary hover:bg-surface-soft'}
                  key={href}
                  to={href}
                >
                  {label}<ChevronRight aria-hidden="true" className="size-4 shrink-0" />
                </Link>
              ))}
            </nav>
          </aside>
          <section className="min-w-0 space-y-6">
            <header className="rounded-lg bg-surface p-5 shadow-sm md:p-8">
              <p className="text-xs font-semibold uppercase tracking-widest text-brand-primary">Tài khoản và nhận xét</p>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">Đánh giá của tôi</h1>
              <p className="mt-2 text-sm text-text-secondary">Lịch sử nhận xét về các sản phẩm bạn đã mua.</p>
              {myReviewsQuery.data ? (
                <p className="mt-5 w-fit rounded bg-surface-soft px-4 py-2 text-sm font-semibold">{myReviewsQuery.data.totalItems} đánh giá</p>
              ) : null}
            </header>
          {myReviewsQuery.isLoading ? (
            <div className="space-y-6">
              {Array.from({ length: 3 }).map((_, index) => (
                <div className="grid grid-cols-[72px_minmax(0,1fr)] gap-4 rounded-md border border-border bg-surface p-5 md:grid-cols-[96px_minmax(0,1fr)_auto]" key={index}>
                  <div className="aspect-[4/5] bg-surface-soft shimmer animate-shimmer" />
                  <div className="shimmer animate-shimmer space-y-4">
                    <div className="h-3 w-24 bg-surface-soft" />
                    <div className="h-8 w-52 bg-surface-soft" />
                    <div className="h-4 w-28 bg-surface-soft" />
                    <div className="h-4 w-full bg-surface-soft" />
                    <div className="h-4 w-4/5 bg-surface-soft" />
                  </div>
                  <div className="shimmer animate-shimmer space-y-4">
                    <div className="h-4 w-24 bg-surface-soft" />
                    <div className="h-4 w-20 bg-surface-soft" />
                  </div>
                </div>
              ))}
            </div>
          ) : null}
          {myReviewsQuery.isError ? (
            <ErrorCard
              action={<Button onClick={() => void myReviewsQuery.refetch()}>Retry</Button>}
              className="border-border bg-surface"
              description="Your submitted reviews could not be loaded from the current service."
              title="Chưa tải được đánh giá"
            />
          ) : null}
          {!myReviewsQuery.isLoading && !myReviewsQuery.isError && reviews.length === 0 ? (
            <EmptyState
              action={
                <Link className="inline-flex border-b border-text-primary pb-1 text-[11px] font-bold uppercase tracking-[0.18em] text-text-primary" to={routes.orders}>
                  Xem đơn hàng
                </Link>
              }
              className="border-border bg-surface px-6 py-16"
              description="You have not submitted any product feedback yet. Delivered orders can open a review form directly from the order archive."
              title="Bạn chưa có đánh giá"
            />
          ) : null}
          {!myReviewsQuery.isLoading && !myReviewsQuery.isError && reviews.length > 0 ? (
            <div className="space-y-6">
              {reviews.map((review) => (
                <article className="space-y-4 rounded-lg bg-surface p-5 shadow-sm md:p-7" key={review.id}>
                  <div className="flex items-center gap-4 rounded bg-surface-soft p-3">
                    <Link className="w-16 shrink-0 overflow-hidden rounded bg-surface-muted" to={review.productSlug ? routePaths.productDetail(review.productSlug) : routes.products}>
                      <img alt={review.productImage.alt} className="aspect-[4/5] w-full object-cover" height={review.productImage.height} loading="lazy" src={review.productImage.src} width={review.productImage.width} />
                    </Link>
                    <div className="min-w-0 break-words">
                      <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary">{review.brandName}</p>
                      <h2 className="mt-1 font-semibold">
                        <Link to={review.productSlug ? routePaths.productDetail(review.productSlug) : routes.products}>{review.productName}</Link>
                      </h2>
                      {review.variantName ? <p className="mt-1 text-sm text-text-secondary">{review.variantName}</p> : null}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-text-secondary">
                    <div className="flex flex-wrap items-center gap-3">
                      <StarRatingDisplay rating={review.rating} />
                      <span>{review.rating} / 5</span>
                      <ReviewStatusBadge status={review.status} />
                    </div>
                    <span>{formatDate(review.createdAt)}</span>
                  </div>
                  <p className="max-w-prose whitespace-pre-wrap break-words text-sm leading-7">{review.comment}</p>
                  {review.orderId ? (
                    <div className="flex justify-end">
                      <Link className={buttonStyles({ variant: 'secondary' })} to={routePaths.orderDetail(review.orderId)}>Xem đơn hàng</Link>
                    </div>
                  ) : null}
                </article>
              ))}
            </div>
          ) : null}
        </section>
        </div>
      </Container>
    </>
  );
};

export default MyReviewsPage;
