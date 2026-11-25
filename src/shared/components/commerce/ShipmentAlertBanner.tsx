import { AlertTriangle } from 'lucide-react';

import { formatShipmentTimestamp, getShipmentAttention, getShipmentEventsNewestFirst, shipmentAttentionLabels, shipmentStatusLabels } from '@/shared/lib/shipmentTracking';
import { cn } from '@/shared/utils/cn';
import { SHIPMENT_STATUSES, type Shipment } from '@/shared/types/shipment.types';

type ShipmentAlertBannerProps = {
  shipment: Shipment;
  showDelay?: boolean;
};

const isOverdue = (shipment: Shipment) =>
  Boolean(
    shipment.estimatedDeliveryDate &&
      shipment.status !== SHIPMENT_STATUSES.DELIVERED &&
      new Date(shipment.estimatedDeliveryDate).getTime() < Date.now(),
  );

export const ShipmentAlertBanner = ({ shipment, showDelay = false }: ShipmentAlertBannerProps) => {
  const attention = getShipmentAttention(shipment);
  if (!attention && !(showDelay && isOverdue(shipment))) return null;

  const title = attention ? shipmentAttentionLabels[attention] : 'Giao hàng chậm hơn dự kiến';
  const latestEvent = attention ? getShipmentEventsNewestFirst(shipment.events)[0] : undefined;
  const updatedAt = latestEvent?.eventTime ?? shipment.updatedAt;
  const toneClasses = attention === 'RETURNED_HANDLING' || attention === 'CARRIER_CANCELLED'
    ? 'border-danger/20 bg-danger/10 text-danger'
    : 'border-warning/30 bg-warning/10 text-warning';

  return (
    <div className={cn('rounded border px-5 py-4', toneClasses)} role="status">
      <div className="flex items-start gap-3">
        <AlertTriangle aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0" />
        <div className="min-w-0 break-words">
          <p className="text-sm font-semibold">{title}</p>
          {attention ? (
            <>
              <p className="mt-1 text-sm text-text-secondary">
                {latestEvent ? 'Mốc mới nhất' : 'Cập nhật vận đơn'}{' · '}
                <time dateTime={updatedAt}>{formatShipmentTimestamp(updatedAt)}</time>
                {latestEvent ? ' · ' + (latestEvent.description || shipmentStatusLabels[latestEvent.status] || 'Đã ghi nhận sự kiện') : null}
              </p>
              <p className="mt-2 text-sm text-text-primary">Liên hệ bộ phận hỗ trợ và cung cấp mã đơn #{shipment.orderCode} để được hướng dẫn.</p>
            </>
          ) : (
            <p className="mt-2 text-sm text-text-secondary">Bạn có thể xem mốc gần nhất trong hành trình bên dưới.</p>
          )}
        </div>
      </div>
    </div>
  );
};
