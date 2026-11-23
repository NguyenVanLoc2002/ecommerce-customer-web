import { Copy, Truck } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

import { routePaths, routes } from '@/constants/routes';
import { ShipmentAlertBanner } from '@/features/shipment/components/ShipmentAlertBanner';
import { ShipmentProgressBar } from '@/features/shipment/components/ShipmentProgressBar';
import { ShipmentTimeline } from '@/features/shipment/components/ShipmentTimeline';
import { SkeletonTimeline } from '@/features/shipment/components/SkeletonTimeline';
import { useShipmentByOrderId } from '@/features/shipment/hooks/useShipment';
import { EmptyState } from '@/shared/components/feedback/EmptyState';
import { ErrorCard } from '@/shared/components/feedback/ErrorCard';
import { BreadcrumbNav } from '@/shared/components/layout/BreadcrumbNav';
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
    try {
      await navigator.clipboard.writeText(value);
      addToast({
        tone: 'success',
        title: 'Copied',
        description: `${label} copied to clipboard.`,
      });
    } catch {
      addToast({
        tone: 'danger',
        title: 'Copy failed',
        description: 'Clipboard access is unavailable in this browser context.',
      });
    }
  };

  const errorCode =
    shipmentQuery.error instanceof Error && 'code' in shipmentQuery.error ? String((shipmentQuery.error as { code?: string }).code) : '';

  const isShipmentMissing = errorCode === 'SHIPMENT_NOT_FOUND';
  const isOrderMissing = errorCode === 'ORDER_NOT_FOUND';

  return (
    <>
      <PageSEO description="Track the current shipment timeline and delivery progress for your order." noIndex path={routePaths.orderTracking(orderId || 'order')} title="Shipment Tracking" />
      <Container className="space-y-8 pb-16 pt-28 md:space-y-10 md:pb-20 md:pt-32">
        <BreadcrumbNav items={[
          { label: 'Trang chủ', href: routes.home },
          { label: 'Đơn hàng', href: routes.orders },
          { label: shipment?.orderCode ?? 'Chi tiết đơn', href: routePaths.orderDetail(orderId) },
          { label: 'Theo dõi vận đơn' },
        ]} />
        <header className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-6">
          <div>
            <h1 className="text-2xl font-light tracking-tight md:text-3xl">Theo dõi hành trình đơn hàng</h1>
            {shipment ? <p className="mt-2 text-sm text-text-secondary">Đơn hàng #{shipment.orderCode}</p> : null}
          </div>
          <Link className={buttonStyles({ variant: 'secondary' })} to={routePaths.orderDetail(orderId)}>Xem chi tiết đơn hàng</Link>
        </header>

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
          <div className="space-y-8">
            <div className="grid divide-y divide-border overflow-hidden rounded bg-surface shadow-sm md:grid-cols-3 md:divide-x md:divide-y-0">
              <div className="space-y-2 p-5 md:p-6">
                <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">Trạng thái giao hàng</p>
                <p className={`inline-flex items-center gap-2 rounded border px-2 py-1 text-sm ${shipmentToneClasses[shipment.status]}`}>
                  <Truck aria-hidden="true" className="size-4" />
                  {shipment.status.replace(/_/g, ' ')}
                </p>
              </div>
              <div className="space-y-2 p-5 md:p-6">
                <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">Đơn vị vận chuyển</p>
                <p className="font-semibold">{shipment.carrier}</p>
                <button className={codeButtonClassName} onClick={() => void copyCode(shipment.shipmentCode, 'Shipment code')} type="button">
                  <Copy aria-hidden="true" className="mr-2 size-4" />{shipment.shipmentCode}
                </button>
              </div>
              <div className="space-y-2 p-5 md:p-6">
                <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">Mã theo dõi</p>
                {shipment.trackingNumber ? (
                  <button className={codeButtonClassName} onClick={() => void copyCode(shipment.trackingNumber, 'Tracking number')} type="button">
                    <Copy aria-hidden="true" className="mr-2 size-4" />{shipment.trackingNumber}
                  </button>
                ) : <p className="text-sm text-text-secondary">Chưa có mã theo dõi</p>}
              </div>
            </div>
            <ShipmentAlertBanner shipment={shipment} />
            <div className="grid items-start gap-8 lg:grid-cols-12">
              <section className="min-w-0 overflow-hidden rounded bg-surface shadow-sm lg:col-span-8">
                <h2 className="border-b border-border px-5 py-5 text-lg font-medium md:px-8">Hành trình vận chuyển</h2>
                <ShipmentTimeline events={shipment.events} />
                <div className="border-t border-border p-5 md:p-8">
                  <ShipmentProgressBar status={shipment.status} />
                </div>
              </section>
              <aside className="min-w-0 space-y-5 lg:col-span-4">
                <section className="rounded bg-surface p-5 shadow-sm md:p-6">
                  <h2 className="text-sm font-bold uppercase tracking-wide">{shipment.deliveredAt ? 'Đã giao' : 'Dự kiến giao hàng'}</h2>
                  <p className="mt-3 text-sm text-text-secondary">
                    {shipment.deliveredAt || shipment.estimatedDeliveryDate
                      ? formatDate(shipment.deliveredAt ?? shipment.estimatedDeliveryDate ?? '')
                      : 'Đang chờ thông tin từ đơn vị vận chuyển.'}
                  </p>
                  <p className="mt-3 border-t border-border pt-3 text-sm">Phí vận chuyển {formatVnd(shipment.shippingFee)}</p>
                </section>
                {shipment.note ? (
                  <section className="rounded bg-surface p-5 shadow-sm">
                    <h2 className="text-sm font-bold uppercase tracking-wide">Ghi chú vận chuyển</h2>
                    <p className="mt-3 whitespace-pre-wrap break-words text-sm text-text-secondary">{shipment.note}</p>
                  </section>
                ) : null}
              </aside>
            </div>
          </div>
        ) : null}
      </Container>
    </>
  );
};

export default ShipmentTrackingPage;
