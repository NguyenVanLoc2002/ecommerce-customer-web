import { Link } from 'react-router-dom';

import { routePaths, routes } from '@/constants/routes';
import { EmptyState } from '@/shared/components/feedback/EmptyState';
import { ErrorCard } from '@/shared/components/feedback/ErrorCard';
import { AccountShell } from '@/shared/components/layout/AccountShell';
import { Container } from '@/shared/components/layout/Container';
import { PageSEO } from '@/shared/components/seo/PageSEO';
import { ReviewStatusBadge } from '@/shared/components/reviews/ReviewStatusBadge';
import { StarRatingDisplay } from '@/shared/components/reviews/StarRatingDisplay';
import { Button } from '@/shared/components/ui/Button';
import { useMyReviews } from '@/shared/hooks/useReviews';
import { formatDate } from '@/shared/utils/formatDate';

export const MyReviewsPage = () => {
  const myReviewsQuery = useMyReviews();
  const reviews = myReviewsQuery.data ?? [];

  return (
    <>
      <PageSEO description="Review your submitted customer feedback and moderation status." noIndex path={routes.profileReviews} title="My Reviews" />
      <Container className="pb-16 pt-28 md:pb-20 md:pt-32">
        <AccountShell
          activeTab="reviews"
          description="Review the status of your submitted product feedback and revisit any completed order notes."
          eyebrow="Customer archive"
          title="My Reviews"
        >
          {myReviewsQuery.isLoading ? (
            <div className="space-y-6">
              {Array.from({ length: 3 }).map((_, index) => (
                <div className="grid gap-6 border border-border bg-surface px-5 py-5 md:grid-cols-[112px_minmax(0,1fr)_auto] md:px-6" key={index}>
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
              title="Review history unavailable"
            />
          ) : null}
          {!myReviewsQuery.isLoading && !myReviewsQuery.isError && reviews.length === 0 ? (
            <EmptyState
              action={
                <Link className="inline-flex border-b border-text-primary pb-1 text-[11px] font-bold uppercase tracking-[0.18em] text-text-primary" to={routes.orders}>
                  Browse orders
                </Link>
              }
              className="border-border bg-surface px-6 py-16"
              description="You have not submitted any product feedback yet. Delivered orders can open a review form directly from the order archive."
              title="No reviews yet."
            />
          ) : null}
          {!myReviewsQuery.isLoading && !myReviewsQuery.isError && reviews.length > 0 ? (
            <div className="space-y-6">
              {reviews.map((review) => (
                <article className="grid gap-6 border border-border bg-surface px-5 py-5 md:grid-cols-[112px_minmax(0,1fr)_auto] md:px-6" key={review.id}>
                  <Link className="overflow-hidden bg-surface-soft" to={routePaths.productDetail(review.productSlug)}>
                    <img
                      alt={review.productImage.alt}
                      className="aspect-[4/5] h-full w-full object-cover"
                      height={review.productImage.height}
                      loading="lazy"
                      src={review.productImage.src}
                      width={review.productImage.width}
                    />
                  </Link>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-outline">{review.brandName}</p>
                    <Link className="mt-3 inline-block font-display text-[1.7rem] leading-none text-text-primary" to={routePaths.productDetail(review.productSlug)}>
                      {review.productName}
                    </Link>
                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      <StarRatingDisplay rating={review.rating} />
                      <ReviewStatusBadge status={review.status} />
                    </div>
                    <p className="mt-4 max-w-2xl text-sm leading-7 text-text-secondary">{review.comment}</p>
                  </div>
                  <div className="text-left md:text-right">
                    <p className="text-sm text-text-secondary">{formatDate(review.createdAt)}</p>
                    <Link className="mt-4 inline-flex border-b border-text-primary pb-1 text-[11px] font-bold uppercase tracking-[0.16em] text-text-primary" to={routePaths.orderDetail(review.orderId)}>
                      View order
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          ) : null}
        </AccountShell>
      </Container>
    </>
  );
};

export default MyReviewsPage;
