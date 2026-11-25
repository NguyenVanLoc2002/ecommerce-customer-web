import { MapPin, Truck } from 'lucide-react';

import { formatShipmentTimestamp, getShipmentAttention, getShipmentEventsNewestFirst, shipmentAttentionLabels, shipmentStatusLabels } from '@/shared/lib/shipmentTracking';
import type { Shipment } from '@/shared/types/shipment.types';

type ShipmentTimelineProps = {
  shipment: Shipment;
};

export const ShipmentTimeline = ({ shipment }: ShipmentTimelineProps) => {
  const events = getShipmentEventsNewestFirst(shipment.events);
  const attention = getShipmentAttention(shipment);
  if (!events.length) {
    return <p className="px-5 py-6 text-sm text-text-secondary md:px-8">Đơn vị vận chuyển chưa cập nhật sự kiện.</p>;
  }

  return (
    <ol className="px-5 py-6 md:px-8">
      {events.map((event, index) => (
        <li className="relative grid grid-cols-[36px_minmax(0,1fr)] gap-4 pb-6 last:pb-0" key={event.id}>
          {index < events.length - 1 ? <span aria-hidden="true" className="absolute bottom-0 left-[17px] top-8 w-px bg-border" /> : null}
          <span className={index === 0
            ? 'z-10 grid size-9 place-items-center rounded-full bg-brand-primary text-surface'
            : 'z-10 grid size-9 place-items-center rounded-full bg-surface-muted text-text-secondary'}>
            <Truck aria-hidden="true" className="size-4" />
          </span>
          <div className="min-w-0 break-words rounded bg-surface-soft p-4">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-text-secondary">
              <span className="font-semibold">{index === 0 && attention && event.status === shipment.status
                ? shipmentAttentionLabels[attention]
                : shipmentStatusLabels[event.status] ?? 'Cập nhật vận đơn'}</span>
              <time dateTime={event.eventTime}>{formatShipmentTimestamp(event.eventTime)}</time>
            </div>
            {event.description || event.location ? <p className="mt-2 break-words text-sm font-semibold">{event.description || event.location}</p> : null}
            {event.location && event.description ? (
              <p className="mt-2 flex items-center gap-2 text-xs text-text-secondary"><MapPin aria-hidden="true" className="size-3 shrink-0" />{event.location}</p>
            ) : null}
          </div>
        </li>
      ))}
    </ol>
  );
};
