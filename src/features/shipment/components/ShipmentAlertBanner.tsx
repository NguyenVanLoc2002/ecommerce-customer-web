import { AlertTriangle } from 'lucide-react';

import { cn } from '@/shared/utils/cn';
import { SHIPMENT_STATUSES, type Shipment } from '@/shared/types/shipment.types';

type ShipmentAlertBannerProps = {
  shipment: Shipment;
};

const isOverdue = (shipment: Shipment) =>
  Boolean(
    shipment.estimatedDeliveryDate &&
      shipment.status !== SHIPMENT_STATUSES.DELIVERED &&
      new Date(shipment.estimatedDeliveryDate).getTime() < Date.now(),
  );

export const ShipmentAlertBanner = ({ shipment }: ShipmentAlertBannerProps) => {
  let title: string | null = null;
  let description: string | null = null;
  let toneClasses = '';

  if (shipment.status === SHIPMENT_STATUSES.FAILED) {
    title = 'Shipment issue';
    description = 'The carrier reported a shipment issue. Please contact support if this status remains unchanged.';
    toneClasses = 'border-warning/30 bg-warning/10 text-warning';
  } else if (shipment.status === SHIPMENT_STATUSES.RETURNED) {
    title = 'Shipment returned';
    description = 'This shipment was returned to the sender. The order archive will update after manual review.';
    toneClasses = 'border-danger/20 bg-danger/10 text-danger';
  } else if (isOverdue(shipment)) {
    title = 'Delivery delay';
    description = 'The estimated delivery date has passed. The carrier may still be updating the final handoff.';
    toneClasses = 'border-warning/30 bg-warning/10 text-warning';
  }

  if (!title || !description) {
    return null;
  }

  return (
    <div className={cn('border px-5 py-4', toneClasses)}>
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5" />
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em]">{title}</p>
          <p className="mt-2 text-sm leading-7 text-text-secondary">{description}</p>
        </div>
      </div>
    </div>
  );
};
