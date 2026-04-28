import type { ReviewStatus } from '@/shared/types/review.types';
import { REVIEW_STATUSES } from '@/shared/types/review.types';

const statusClasses: Record<ReviewStatus, string> = {
  [REVIEW_STATUSES.PENDING]: 'border-warning/20 bg-warning/10 text-warning',
  [REVIEW_STATUSES.APPROVED]: 'border-success/20 bg-success/10 text-success',
  [REVIEW_STATUSES.REJECTED]: 'border-danger/20 bg-danger/10 text-danger',
};

export const ReviewStatusBadge = ({ status }: { status: ReviewStatus }) => (
  <span className={`inline-flex items-center border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] ${statusClasses[status]}`}>
    {status.replace(/_/g, ' ')}
  </span>
);
