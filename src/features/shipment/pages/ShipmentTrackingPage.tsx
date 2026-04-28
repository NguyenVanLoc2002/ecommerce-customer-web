import { ArrowLeft } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

import { routePaths } from '@/constants/routes';
import { ShipmentAlertBanner } from '@/features/shipment/components/ShipmentAlertBanner';
import { ShipmentProgressBar } from '@/features/shipment/components/ShipmentProgressBar';
import { ShipmentTimeline } from '@/features/shipment/components/ShipmentTimeline';
import { SkeletonTimeline } from '@/features/shipment/components/SkeletonTimeline';
import { useShipmentByOrderId } from '@/features/shipment/hooks/useShipment';
import { EmptyState } from '@/shared/components/feedback/EmptyState';
import { ErrorCard } from '@/shared/components/feedback/ErrorCard';
import { Container } from '@/shared/components/layout/Container';
import { PageSEO } from '@/shared/components/seo/PageSEO';
import { Button } from '@/shared/components/ui/Button';
import { buttonStyles } from '@/shared/components/ui/buttonStyles';
import { useUiStore } from '@/shared/stores/uiStore';
import { formatDate } from '@/shared/utils/formatDate';
import { formatVnd } from '@/shared/utils/formatVnd';

const codeButtonClassName =
  'inline-flex items-center border border-border px-4 py-2 font-mono text-sm text-text-primary transition-colors hover:border-text-primary';

const shipmentToneClasses: Record<string, string> = {
  PENDING: 'border-warning/20 bg-warning/10 text-warning',
  IN_TRANSIT: 'border-info/20 bg-info/10 text-info',
  OUT_FOR_DELIVERY: 'border-info/20 bg-info/10 text-info',
  DELIVERED: 'border-success/20 bg-success/10 text-success',
  FAILED: 'border-warning/20 bg-warning/10 text-warning',
  RETURNED: 'border-danger/20 bg-danger/10 text-danger',
};

export const ShipmentTrackingPage = () => {
  const { orderId = '' } = useParams();
  const shipmentQuery = useShipmentByOrderId(orderId);
  const addToast = useUiStore((state) => state.addToast);
  const shipment = shipmentQuery.data;

  const copyCode = async (value: string, label: string) => {
    await navigator.clipboard.writeText(value);
    addToast({
      tone: 'success',
      title: 'Copied',
      description: `${label} copied to clipboard.`,
    });
  };

  const errorCode =
    shipmentQuery.error instanceof Error && 'code' in shipmentQuery.error ? String((shipmentQuery.error as { code?: string }).code) : '';

  const isShipmentMissing = errorCode === 'SHIPMENT_NOT_FOUND';
  const isOrderMissing = errorCode === 'ORDER_NOT_FOUND';

  return (
    <>
      <PageSEO description="Track the current shipment timeline and delivery progress for your order." noIndex path={routePaths.orderTracking(orderId || 'order')} title="Shipment Tracking" />
      <Container className="space-y-8 pb-16 pt-28 md:space-y-10 md:pb-20 md:pt-32">
        <div className="border-b border-border pb-8">
          <Link className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-text-primary" to={routePaths.orderDetail(orderId)}>
            <ArrowLeft className="h-4 w-4" />
            Back to order
          </Link>
          <p className="mt-6 text-[11px] font-bold uppercase tracking-[0.18em] text-outline">Shipment tracking</p>
          <h1 className="mt-3 font-display text-[3.5rem] leading-none text-text-primary md:text-[4.5rem]">Track Shipment</h1>
        </div>

        {shipmentQuery.isLoading ? <SkeletonTimeline /> : null}
        {shipmentQuery.isError && !isShipmentMissing && !isOrderMissing ? (
          <ErrorCard
            action={<Button onClick={() => void shipmentQuery.refetch()}>Retry</Button>}
            className="border-border bg-surface"
            description="The shipment record could not be loaded from the current service."
            title="Shipment lookup failed"
          />
        ) : null}
        {shipmentQuery.isError && isOrderMissing ? (
          <EmptyState
            action={
              <Link className={buttonStyles({})} to={routePaths.orderDetail(orderId)}>
                Return to order
              </Link>
            }
            className="border-border bg-surface px-6 py-16"
            description="This order reference could not be matched to your customer archive."
            title="Order not found."
          />
        ) : null}
        {shipmentQuery.isError && isShipmentMissing ? (
          <EmptyState
            action={
              <Link className={buttonStyles({})} to={routePaths.orderDetail(orderId)}>
                Back to order detail
              </Link>
            }
            className="border-border bg-surface px-6 py-16"
            description="A shipment has not been created for this order yet. Tracking will appear here after fulfillment begins."
            title="Shipment not created yet."
          />
        ) : null}

        {shipment ? (
          <div className="grid gap-10 xl:grid-cols-[minmax(0,1fr)_380px]">
            <section className="space-y-6">
              <div className="border border-border bg-surface px-6 py-8 md:px-8 md:py-10">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-outline">Shipment summary</p>
                    <h2 className="mt-4 font-display text-[3rem] leading-none text-text-primary md:text-[4rem]">{shipment.carrier}</h2>
                  </div>
                  <div className={`inline-flex items-center border px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] ${shipmentToneClasses[shipment.status]}`}>
                    {shipment.status.replace(/_/g, ' ')}
                  </div>
                </div>

                <div className="mt-8 flex flex-wrap gap-3">
                  <button className={codeButtonClassName} onClick={() => void copyCode(shipment.shipmentCode, 'Shipment code')} type="button">
                    {shipment.shipmentCode}
                  </button>
                  <button className={codeButtonClassName} onClick={() => void copyCode(shipment.trackingNumber, 'Tracking number')} type="button">
                    {shipment.trackingNumber}
                  </button>
                </div>

                <div className="mt-8">
                  <ShipmentProgressBar status={shipment.status} />
                </div>
              </div>

              <ShipmentAlertBanner shipment={shipment} />

              <section className="space-y-4">
                <div className="border border-border bg-surface px-5 py-5 md:px-6">
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-outline">Timeline</p>
                  <h2 className="mt-3 font-display text-[2rem] leading-none text-text-primary">Shipment events</h2>
                </div>
                <ShipmentTimeline events={shipment.events} />
              </section>
            </section>

            <aside className="space-y-4">
              <section className="border border-border bg-surface px-5 py-5 md:px-6">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-outline">Delivery</p>
                <p className="mt-3 font-display text-[2rem] leading-none text-text-primary">
                  {shipment.deliveredAt ? 'Delivered' : shipment.estimatedDeliveryDate ? 'Estimated arrival' : 'Awaiting update'}
                </p>
                <p className="mt-4 text-sm leading-7 text-text-secondary">
                  {shipment.deliveredAt
                    ? formatDate(shipment.deliveredAt, { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                    : shipment.estimatedDeliveryDate
                      ? formatDate(shipment.estimatedDeliveryDate, { month: 'long', day: 'numeric', year: 'numeric' })
                      : 'The carrier has not confirmed an estimated delivery window yet.'}
                </p>
              </section>

              <section className="border border-border bg-surface px-5 py-5 md:px-6">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-outline">Shipment note</p>
                <p className="mt-4 text-sm leading-7 text-text-secondary">{shipment.note ?? 'No shipment note available.'}</p>
                <p className="mt-4 text-sm leading-7 text-text-secondary">Shipping fee {formatVnd(shipment.shippingFee)}</p>
              </section>

              <Link className={buttonStyles({ fullWidth: true, variant: 'ghost' })} to={routePaths.orderDetail(orderId)}>
                Back to order detail
              </Link>
            </aside>
          </div>
        ) : null}
      </Container>
    </>
  );
};

export default ShipmentTrackingPage;
