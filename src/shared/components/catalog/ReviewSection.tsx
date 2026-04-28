import { Divider } from '@/shared/components/ui/Divider';
import { formatDate } from '@/shared/utils/formatDate';
import type { ProductReview } from '@/shared/types/catalog.types';

type ReviewSectionProps = {
  reviews: ProductReview[];
};

export const ReviewSection = ({ reviews }: ReviewSectionProps) => (
  <section className="border-t border-border pt-10">
    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-text-secondary">Customer Notes</p>
    <h2 className="mt-3 font-display text-[2rem] leading-tight text-text-primary">Reviews</h2>
    <div className="mt-8 space-y-8">
      {reviews.length === 0 ? (
        <p className="max-w-2xl text-sm leading-7 text-text-secondary">Review submissions and moderation-aware lists are planned for a later phase.</p>
      ) : (
        reviews.map((review, index) => (
          <div key={review.id}>
            {index > 0 ? <Divider /> : null}
            <div className="pt-6 first:pt-0">
              <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                <div>
                  <h3 className="font-display text-xl text-text-primary">{review.title}</h3>
                  <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.16em] text-text-secondary">
                    {review.author} / {review.rating}/5 / {review.verifiedPurchase ? 'Verified Purchase' : 'Community Review'}
                  </p>
                </div>
                <span className="text-sm text-text-secondary">{formatDate(review.createdAt)}</span>
              </div>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-text-secondary">{review.comment}</p>
            </div>
          </div>
        ))
      )}
    </div>
  </section>
);
