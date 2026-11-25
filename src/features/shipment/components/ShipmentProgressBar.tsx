import { shipmentStatusLabels } from '@/shared/lib/shipmentTracking';
import { cn } from '@/shared/utils/cn';
import { SHIPMENT_STATUSES, type ShipmentStatus } from '@/shared/types/shipment.types';

type ShipmentProgressBarProps = {
  status: ShipmentStatus;
};

const steps: ShipmentStatus[] = [
  SHIPMENT_STATUSES.PENDING,
  SHIPMENT_STATUSES.PICKING,
  SHIPMENT_STATUSES.IN_TRANSIT,
  SHIPMENT_STATUSES.OUT_FOR_DELIVERY,
  SHIPMENT_STATUSES.DELIVERED,
];

export const ShipmentProgressBar = ({ status }: ShipmentProgressBarProps) => {
  const activeIndex = steps.indexOf(status);

  return (
    <ol className="grid gap-4 md:grid-cols-5">
      {steps.map((step, index) => {
        const complete = index <= activeIndex;

        return (
          <li aria-current={step === status ? 'step' : undefined} className="space-y-3" key={step}>
            <div className="flex items-center gap-3">
              <span
                className={cn(
                  'inline-flex h-9 w-9 items-center justify-center border text-[11px] font-bold uppercase tracking-[0.16em]',
                  complete ? 'border-text-primary bg-text-primary text-surface' : 'border-border text-outline',
                )}
              >
                {index + 1}
              </span>
              <span className={cn('text-[11px] font-bold uppercase tracking-[0.18em]', complete ? 'text-text-primary' : 'text-outline')}>
                {shipmentStatusLabels[step]}
              </span>
            </div>
            <div className={cn('h-px w-full', complete ? 'bg-text-primary' : 'bg-border')} />
          </li>
        );
      })}
    </ol>
  );
};
