import { useEffect, useMemo, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Link, useParams } from 'react-router-dom';

import { routePaths, routes } from '@/constants/routes';
import { useOrderDetail } from '@/features/orders/hooks/useOrders';
import { orderReviewSchema, type OrderReviewSchemaInput } from '@/features/orders/services/orderReviewSchema';
import { EmptyState } from '@/shared/components/feedback/EmptyState';
import { ErrorCard } from '@/shared/components/feedback/ErrorCard';
import { LoadingOverlay } from '@/shared/components/feedback/LoadingOverlay';
import { Container } from '@/shared/components/layout/Container';
import { PageSEO } from '@/shared/components/seo/PageSEO';
import { StarRatingInput } from '@/shared/components/reviews/StarRatingInput';
import { Button } from '@/shared/components/ui/Button';
import { Textarea } from '@/shared/components/ui/Textarea';
import { useCreateReview, useMyReviews } from '@/shared/hooks/useReviews';
import type { ServiceError } from '@/shared/lib/serviceError';
import { useUiStore } from '@/shared/stores/uiStore';
import { ORDER_STATUSES } from '@/shared/types/enums';

export const OrderReviewPage = () => {
  const { orderId = '' } = useParams();
  const addToast = useUiStore((state) => state.addToast);
  const orderQuery = useOrderDetail(orderId);
  const myReviewsQuery = useMyReviews();
  const createReview = useCreateReview();
  const [selectedOrderItemId, setSelectedOrderItemId] = useState<string>('');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submittedReviewId, setSubmittedReviewId] = useState<string | null>(null);

  const {
    formState: { errors },
    handleSubmit,
    setError,
    setValue,
    watch,
    register,
  } = useForm<OrderReviewSchemaInput>({
    resolver: zodResolver(orderReviewSchema),
    defaultValues: {
      rating: 0,
      comment: '',
    },
  });

  const order = orderQuery.data;
  const selectedRating = watch('rating');
  const selectedComment = watch('comment');
  const eligibleItems = useMemo(
    () => {
      const existingReviews = myReviewsQuery.data?.items ?? [];
      const reviewedItemIds = new Set(existingReviews.map((review) => review.orderItemId));
      return order?.items.filter((item) => !reviewedItemIds.has(item.id)) ?? [];
    },
    [myReviewsQuery.data, order?.items],
  );
  const selectedItem = eligibleItems.find((item) => item.id === selectedOrderItemId) ?? eligibleItems[0];
  const orderEligible =
    order?.status === ORDER_STATUSES.DELIVERED || order?.status === ORDER_STATUSES.COMPLETED;

  useEffect(() => {
    register('rating', { valueAsNumber: true });
  }, [register]);

  useEffect(() => {
    if (!selectedOrderItemId && eligibleItems[0]) {
      setSelectedOrderItemId(eligibleItems[0].id);
    }
  }, [eligibleItems, selectedOrderItemId]);

  const onSubmit = handleSubmit(async (values) => {
    if (!selectedItem) {
      setSubmitError('Select an order item before you submit the review.');
      return;
    }

    setSubmitError(null);

    try {
      const review = await createReview.mutateAsync({
        orderItemId: selectedItem.id,
        rating: values.rating,
        comment: values.comment,
      });

      setSubmittedReviewId(review.id);
      addToast({
        tone: 'success',
        title: 'Review submitted',
        description: 'Your feedback is now pending moderation.',
      });
    } catch (error) {
      const serviceError = error as ServiceError;
      if (serviceError.fieldErrors) {
        Object.entries(serviceError.fieldErrors).forEach(([field, message]) => {
          setError(field as keyof OrderReviewSchemaInput, { message });
        });
      }

      setSubmitError(serviceError.message);
    }
  });

  return (
    <>
      <PageSEO description="Submit a review for a completed order item." noIndex path={routePaths.orderReview(orderId || 'order')} title="Write Review" />
      <Container className="max-w-[800px] space-y-8 pb-16 pt-28 md:space-y-10 md:pb-20 md:pt-32">
        <Link className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-text-primary" to={routePaths.orderDetail(orderId)}>
          <ArrowLeft className="h-4 w-4" />
          Back to order
        </Link>

        {orderQuery.isLoading || myReviewsQuery.isLoading ? <LoadingOverlay className="min-h-[320px] border-border bg-surface" inline label="Loading review form..." /> : null}
        {orderQuery.isError ? (
          <ErrorCard
            action={<Button onClick={() => void orderQuery.refetch()}>Retry</Button>}
            className="border-border bg-surface"
            description="The order context could not be loaded for review submission."
            title="Review form unavailable"
          />
        ) : null}
        {myReviewsQuery.isError ? (
          <ErrorCard
            action={<Button onClick={() => void myReviewsQuery.refetch()}>Retry</Button>}
            className="border-border bg-surface"
            description="Your current review history could not be verified."
            title="Review eligibility unavailable"
          />
        ) : null}

        {!orderQuery.isLoading && !order && !orderQuery.isError ? (
          <EmptyState
            className="border-border bg-surface px-6 py-16"
            description="This order could not be found in your archive."
            title="Order not found."
          />
        ) : null}

        {order && !orderEligible ? (
          <EmptyState
            action={
              <Link className="inline-flex border-b border-text-primary pb-1 text-[11px] font-bold uppercase tracking-[0.18em] text-text-primary" to={routePaths.orderDetail(order.id)}>
                Return to order detail
              </Link>
            }
            className="border-border bg-surface px-6 py-16"
            description="Reviews become available only after an eligible order is delivered or completed."
            title="Review not eligible yet."
          />
        ) : null}

        {order && orderEligible && eligibleItems.length === 0 && !submittedReviewId ? (
          <EmptyState
            action={
              <Link className="inline-flex border-b border-text-primary pb-1 text-[11px] font-bold uppercase tracking-[0.18em] text-text-primary" to={routes.profileReviews}>
                View my reviews
              </Link>
            }
            className="border-border bg-surface px-6 py-16"
            description="A review already exists for every item in this order."
            title="Review already submitted."
          />
        ) : null}

        {submittedReviewId ? (
          <EmptyState
            action={
              <div className="flex flex-wrap justify-center gap-3">
                <Link className="inline-flex border-b border-text-primary pb-1 text-[11px] font-bold uppercase tracking-[0.18em] text-text-primary" to={routes.profileReviews}>
                  View my reviews
                </Link>
                <Link className="inline-flex border-b border-text-primary pb-1 text-[11px] font-bold uppercase tracking-[0.18em] text-text-primary" to={routePaths.orderDetail(orderId)}>
                  Back to order
                </Link>
              </div>
            }
            className="border-border bg-surface px-6 py-16"
            description="Your feedback was captured successfully and is now pending moderation."
            title="Review submitted."
          />
        ) : null}

        {order && orderEligible && eligibleItems.length > 0 && !submittedReviewId ? (
          <>
            {selectedItem ? (
              <section className="flex flex-col items-center gap-6 border-b border-border pb-10 text-center md:flex-row md:text-left">
                <div className="h-40 w-32 overflow-hidden bg-surface-soft">
                  <img
                    alt={selectedItem.primaryImage.alt}
                    className="h-full w-full object-cover"
                    height={selectedItem.primaryImage.height}
                    loading="lazy"
                    src={selectedItem.primaryImage.src}
                    width={selectedItem.primaryImage.width}
                  />
                </div>
                <div className="flex-1">
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-outline">Your purchase</p>
                  <h1 className="mt-3 font-display text-[2rem] leading-none text-text-primary md:text-[2.4rem]">{selectedItem.productName}</h1>
                  <p className="mt-3 text-sm italic text-text-secondary">
                    {selectedItem.color} Edition / Size {selectedItem.size}
                  </p>
                </div>
              </section>
            ) : null}

            {eligibleItems.length > 1 ? (
              <section className="space-y-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-outline">Select item</p>
                <div className="grid gap-4 md:grid-cols-2">
                  {eligibleItems.map((item) => (
                    <button
                      className={`flex items-center gap-4 border px-4 py-4 text-left transition-colors ${item.id === selectedItem?.id ? 'border-text-primary bg-surface' : 'border-border bg-surface hover:border-text-primary'}`}
                      key={item.id}
                      onClick={() => setSelectedOrderItemId(item.id)}
                      type="button"
                    >
                      <img
                        alt={item.primaryImage.alt}
                        className="h-24 w-20 object-cover"
                        height={item.primaryImage.height}
                        loading="lazy"
                        src={item.primaryImage.src}
                        width={item.primaryImage.width}
                      />
                      <div>
                        <p className="font-display text-lg leading-none text-text-primary">{item.productName}</p>
                        <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.16em] text-outline">
                          {item.color} / {item.size}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            ) : null}

            <form className="space-y-10" onSubmit={onSubmit}>
              <section className="space-y-6 text-center">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-outline">Overall rating</p>
                <StarRatingInput
                  error={errors.rating?.message}
                  onChange={(nextValue) => setValue('rating', nextValue, { shouldDirty: true, shouldValidate: true })}
                  value={selectedRating}
                />
              </section>

              <section className="space-y-4">
                <div className="flex items-end justify-between gap-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-outline">Your feedback</p>
                  <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-outline">{selectedComment.length} / 1000</span>
                </div>
                <Textarea
                  error={errors.comment?.message}
                  id="comment"
                  label="Review comment"
                  placeholder="Describe the fit, material quality, and silhouette."
                  rows={6}
                  variant="transaction"
                  {...register('comment')}
                />
              </section>

              {submitError ? <p className="text-sm text-danger">{submitError}</p> : null}

              <div className="border-t border-border pt-8">
                <Button disabled={createReview.isPending} fullWidth size="lg" type="submit">
                  {createReview.isPending ? 'Publishing review...' : 'Publish review'}
                </Button>
                <p className="mt-4 text-center text-[10px] uppercase tracking-[0.16em] text-outline">By submitting, you agree to our content guidelines.</p>
              </div>
            </form>
          </>
        ) : null}
      </Container>
    </>
  );
};

export default OrderReviewPage;
