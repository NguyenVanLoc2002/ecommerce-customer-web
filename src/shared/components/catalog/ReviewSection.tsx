import { useEffect, useMemo, useState } from 'react';

import { useProductReviews } from '@/shared/hooks/useReviews';
import { StarRatingDisplay } from '@/shared/components/reviews/StarRatingDisplay';
import { Button } from '@/shared/components/ui/Button';
import { Divider } from '@/shared/components/ui/Divider';
import { EmptyState } from '@/shared/components/feedback/EmptyState';
import { ErrorCard } from '@/shared/components/feedback/ErrorCard';
import { formatDate } from '@/shared/utils/formatDate';

type ReviewSectionProps = {
  productId: string;
};

const REVIEW_PAGE_SIZE = 3;

const RatingBar = ({ count, rating, totalReviews }: { count: number; rating: number; totalReviews: number }) => {
  const width = totalReviews > 0 ? `${(count / totalReviews) * 100}%` : '0%';

  return (
    <div className="grid grid-cols-[44px_minmax(0,1fr)_36px] items-center gap-4">
      <span className="text-sm text-text-primary">{rating}</span>
      <div className="h-1.5 bg-surface-soft">
        <div className="h-full bg-text-primary transition-[width] duration-300" style={{ width }} />
      </div>
      <span className="text-sm text-text-secondary">{count}</span>
    </div>
  );
};

export const ReviewSection = ({ productId }: ReviewSectionProps) => {
  const reviewQuery = useProductReviews(productId);
  const [visibleCount, setVisibleCount] = useState(REVIEW_PAGE_SIZE);
  const reviews = useMemo(() => reviewQuery.data ?? [], [reviewQuery.data]);

  useEffect(() => {
    setVisibleCount(REVIEW_PAGE_SIZE);
  }, [productId]);

  const reviewSummary = useMemo(() => {
    const totalReviews = reviews.length;
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalReviews > 0 ? totalRating / totalReviews : 0;
    const distribution = Array.from({ length: 5 }, (_, index) => {
      const rating = 5 - index;
      return {
        rating,
        count: reviews.filter((review) => Math.round(review.rating) === rating).length,
      };
    });

    return {
      averageRating,
      totalReviews,
      distribution,
    };
  }, [reviews]);

  const visibleReviews = reviews.slice(0, visibleCount);

  return (
    <section className="border-t border-border pt-10">
      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-text-secondary">Customer Notes</p>
      <h2 className="mt-3 font-display text-[2rem] leading-tight text-text-primary">Reviews</h2>

      {reviewQuery.isLoading ? (
        <div className="mt-8 grid gap-10 lg:grid-cols-[280px_minmax(0,1fr)]">
          <div className="border border-border bg-surface px-5 py-6 md:px-6">
            <div className="shimmer animate-shimmer space-y-4">
              <div className="h-12 w-24 bg-surface-soft" />
              <div className="h-4 w-32 bg-surface-soft" />
              <div className="h-3 w-full bg-surface-soft" />
              <div className="h-3 w-full bg-surface-soft" />
              <div className="h-3 w-full bg-surface-soft" />
            </div>
          </div>
          <div className="space-y-6">
            {Array.from({ length: 3 }).map((_, index) => (
              <div className="border-b border-border pb-6" key={index}>
                <div className="shimmer animate-shimmer space-y-4">
                  <div className="h-4 w-40 bg-surface-soft" />
                  <div className="h-4 w-full bg-surface-soft" />
                  <div className="h-4 w-4/5 bg-surface-soft" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {reviewQuery.isError ? (
        <div className="mt-8">
          <ErrorCard
            action={<Button onClick={() => void reviewQuery.refetch()}>Retry</Button>}
            className="border-border bg-surface"
            description="Public review notes could not be loaded for this product."
            title="Review section unavailable"
          />
        </div>
      ) : null}

      {!reviewQuery.isLoading && !reviewQuery.isError ? (
        <div className="mt-8 grid gap-10 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="space-y-6 border border-border bg-surface px-5 py-6 md:px-6">
            <div>
              <p className="font-display text-[3rem] leading-none text-text-primary">{reviewSummary.averageRating.toFixed(1)}</p>
              <div className="mt-3 flex items-center gap-3">
                <StarRatingDisplay rating={reviewSummary.averageRating} />
                <span className="text-sm text-text-secondary">{reviewSummary.totalReviews} reviews</span>
              </div>
            </div>
            <div className="space-y-3">
              {reviewSummary.distribution.map((item) => (
                <RatingBar count={item.count} key={item.rating} rating={item.rating} totalReviews={reviewSummary.totalReviews} />
              ))}
            </div>
          </aside>

          <div className="space-y-8">
            {reviewSummary.totalReviews === 0 ? (
              <EmptyState
                className="border-border bg-surface px-6 py-16"
                description="There are no approved product reviews yet. Completed orders can submit feedback after delivery."
                title="No reviews yet."
              />
            ) : (
              <>
                {visibleReviews.map((review, index) => (
                  <div key={review.id}>
                    {index > 0 ? <Divider /> : null}
                    <article className="pt-6 first:pt-0">
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div>
                          <StarRatingDisplay rating={review.rating} />
                          <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.16em] text-text-secondary">
                            {review.authorName} / {review.verifiedPurchase ? 'Verified Purchase' : 'Community Review'}
                          </p>
                        </div>
                        <span className="text-sm text-text-secondary">{formatDate(review.createdAt)}</span>
                      </div>
                      {review.title ? <h3 className="mt-4 font-display text-xl text-text-primary">{review.title}</h3> : null}
                      <p className="mt-4 max-w-3xl text-sm leading-7 text-text-secondary">{review.comment}</p>
                    </article>
                  </div>
                ))}
                {visibleCount < reviews.length ? (
                  <Button onClick={() => setVisibleCount((currentValue) => currentValue + REVIEW_PAGE_SIZE)} variant="ghost">
                    Load more reviews
                  </Button>
                ) : null}
              </>
            )}
          </div>
        </div>
      ) : null}
    </section>
  );
};
