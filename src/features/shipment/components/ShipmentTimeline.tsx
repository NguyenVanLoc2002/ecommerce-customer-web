import type { ShipmentEvent } from '@/shared/types/shipment.types';
import { formatDate } from '@/shared/utils/formatDate';

type ShipmentTimelineProps = {
  events: ShipmentEvent[];
};

export const ShipmentTimeline = ({ events }: ShipmentTimelineProps) => (
  <div className="space-y-6">
    {events.map((event, index) => (
      <article className="relative border border-border bg-surface px-5 py-5 md:px-6" key={event.id}>
        <div className="absolute bottom-0 left-0 top-0 w-px bg-border" />
        <div className="absolute left-0 top-6 h-3 w-3 -translate-x-1/2 rounded-full bg-text-primary" />
        <div className="pl-5">
          <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-outline">{event.status.replace(/_/g, ' ')}</p>
              <h3 className="mt-2 font-display text-[1.65rem] leading-none text-text-primary">{event.location}</h3>
            </div>
            <p className="text-sm text-text-secondary">{formatDate(event.eventTime, { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
          </div>
          <p className="mt-4 text-sm leading-7 text-text-secondary">{event.description}</p>
          {index === 0 ? <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.18em] text-text-primary">Latest update</p> : null}
        </div>
      </article>
    ))}
  </div>
);
