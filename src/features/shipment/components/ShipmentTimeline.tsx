import { MapPin, Truck } from 'lucide-react';

import type { ShipmentEvent } from '@/shared/types/shipment.types';
import { formatDate } from '@/shared/utils/formatDate';

type ShipmentTimelineProps = {
  events: ShipmentEvent[];
};

export const ShipmentTimeline = ({ events }: ShipmentTimelineProps) => {
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
              <span className="font-semibold">{event.status.replace(/_/g, ' ')}</span>
              <time dateTime={event.eventTime}>{formatDate(event.eventTime, { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</time>
            </div>
            <h3 className="mt-2 text-sm font-semibold">{event.description || event.location}</h3>
            {event.location && event.description ? (
              <p className="mt-2 flex items-center gap-2 text-xs text-text-secondary"><MapPin aria-hidden="true" className="size-3 shrink-0" />{event.location}</p>
            ) : null}
          </div>
        </li>
      ))}
    </ol>
  );
};
