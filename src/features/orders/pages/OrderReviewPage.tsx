import { useEffect, useMemo, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { BadgeCheck, MessageSquare } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Link, useParams } from 'react-router-dom';

import { routePaths, routes } from '@/constants/routes';
import { useOrderDetail } from '@/features/orders/hooks/useOrders';
import { orderReviewSchema, type OrderReviewSchemaInput } from '@/features/orders/services/orderReviewSchema';
import { EmptyState } from '@/shared/components/feedback/EmptyState';
import { ErrorCard } from '@/shared/components/feedback/ErrorCard';
import { LoadingOverlay } from '@/shared/components/feedback/LoadingOverlay';
import { BreadcrumbNav } from '@/shared/components/layout/BreadcrumbNav';
import { Container } from '@/shared/components/layout/Container';
import { PageSEO } from '@/shared/components/seo/PageSEO';
import { StarRatingInput } from '@/shared/components/reviews/StarRatingInput';
import { Button } from '@/shared/components/ui/Button';
import { buttonStyles } from '@/shared/components/ui/buttonStyles';
import { formatVnd } from '@/shared/utils/formatVnd';
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
    formState: { errors, isSubmitting },
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
    order?.status === ORDER_STATUSES.COMPLETED;

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
        description: 'Đánh giá đã gửi và đang chờ duyệt.',
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
      <Container className="space-y-8 pb-16 pt-28 md:space-y-10 md:pb-20 md:pt-32">
        <BreadcrumbNav items={[
          { label: 'Trang chủ', href: routes.home },
          { label: 'Đơn hàng', href: routes.orders },
          { label: order?.code ?? 'Chi tiết đơn', href: routePaths.orderDetail(orderId) },
          { label: 'Đánh giá' },
        ]} />
        {order ? (
          <div className="flex flex-wrap items-center justify-between gap-4 bg-surface-soft p-5 md:p-6">
            <div className="flex items-center gap-3">
              <BadgeCheck aria-hidden="true" className="size-5 shrink-0 text-brand-primary" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide">Xác thực trạng thái đơn hàng</p>
                <p className="mt-1 text-sm text-text-secondary">Áp dụng cho sản phẩm thuộc đơn hàng đã hoàn tất.</p>
              </div>
            </div>
            <span className="rounded bg-surface-muted px-3 py-2 text-sm font-medium">Mã đơn #{order.code}</span>
          </div>
        ) : null}
        <header>
          <p className="text-xs font-semibold uppercase tracking-widest text-text-secondary">Trải nghiệm chất liệu và phom dáng</p>
          <h1 className="mt-2 text-2xl font-normal tracking-tight md:text-3xl">Đánh giá sản phẩm đã mua</h1>
        </header>

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
            title="Không tìm thấy đơn hàng."
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
            description="Bạn có thể đánh giá sau khi đơn hàng chuyển sang trạng thái Hoàn tất."
            title="Đơn hàng chưa đủ điều kiện đánh giá."
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
                  Về chi tiết đơn hàng
                </Link>
              </div>
            }
            className="border-border bg-surface px-6 py-16"
            description="Đánh giá đã được ghi nhận và đang chờ duyệt."
            title="Review submitted."
          />
        ) : null}

        {order && orderEligible && myReviewsQuery.isSuccess && eligibleItems.length > 0 && !submittedReviewId ? (
          <div className="grid items-start gap-8 lg:grid-cols-12">
            <aside className="min-w-0 space-y-5 lg:col-span-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-sm font-bold uppercase tracking-wide">Sản phẩm trong đơn</h2>
                <p className="text-sm text-text-secondary">{order.items.length} sản phẩm</p>
              </div>
              {order.items.map((item) => {
                const reviewed = !eligibleItems.some((entry) => entry.id === item.id);
                const isSelected = item.id === selectedItem?.id;
                return (
                  <button
                    aria-pressed={isSelected}
                    className={isSelected
                      ? 'flex w-full items-center gap-4 bg-surface p-4 text-left shadow-sm ring-1 ring-brand-primary md:p-5'
                      : 'flex w-full items-center gap-4 bg-surface-soft p-4 text-left md:p-5'}
                    disabled={reviewed || isSubmitting || createReview.isPending}
                    key={item.id}
                    onClick={() => setSelectedOrderItemId(item.id)}
                    type="button"
                  >
                    <img alt={item.primaryImage.alt} className="aspect-[3/4] w-20 shrink-0 object-cover md:w-24" height={item.primaryImage.height} loading="lazy" src={item.primaryImage.src} width={item.primaryImage.width} />
                    <div className="min-w-0 space-y-1 break-words">
                      <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary">{item.brandName}</p>
                      <p className="font-semibold">{item.productName}</p>
                      <p className="text-sm text-text-secondary">{item.color} · {item.size}</p>
                      <p className="text-sm font-medium">{formatVnd(item.subtotal)}</p>
                      <span className="inline-block rounded bg-surface-muted px-2 py-1 text-xs text-text-secondary">
                        {reviewed ? 'Đã đánh giá' : isSelected ? 'Đang chọn' : 'Chưa đánh giá'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </aside>

            <form className="min-w-0 space-y-8 bg-surface p-5 shadow-sm md:p-8 lg:col-span-7" onSubmit={onSubmit}>
              <div className="flex items-center gap-3 bg-surface-soft p-4">
                <MessageSquare aria-hidden="true" className="size-5 shrink-0 text-text-secondary" />
                <div className="min-w-0 break-words">
                  <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">Viết nhận xét cho</p>
                  <h2 className="mt-1 font-semibold">{selectedItem?.productName}</h2>
                </div>
              </div>
              <section className="space-y-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-outline">Mức độ hài lòng</p>
                <StarRatingInput
                  error={errors.rating?.message}
                  onChange={(nextValue) => setValue('rating', nextValue, { shouldDirty: true, shouldValidate: true })}
                  value={selectedRating}
                />
              </section>

              <section className="space-y-4">
                <div className="flex items-end justify-between gap-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-outline">Nội dung đánh giá</p>
                  <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-outline">{selectedComment.length} / 1000</span>
                </div>
                <Textarea
                  error={errors.comment?.message}
                  id="comment"
                  label="Nhận xét"
                  placeholder="Chia sẻ trải nghiệm về chất liệu và phom dáng."
                  rows={6}
                  variant="transaction"
                  {...register('comment')}
                />
              </section>

              {submitError ? <p className="text-sm text-danger" role="alert">{submitError}</p> : null}

              <div className="flex flex-wrap gap-3 border-t border-border pt-6">
                <Button disabled={isSubmitting || createReview.isPending} size="lg" type="submit">
                  {createReview.isPending ? 'Đang gửi đánh giá…' : 'Gửi đánh giá'}
                </Button>
                <Link className={buttonStyles({ variant: 'secondary', size: 'lg' })} to={routePaths.orderDetail(orderId)}>Hủy bỏ</Link>
              </div>
            </form>
          </div>
        ) : null}
      </Container>
    </>
  );
};

export default OrderReviewPage;
