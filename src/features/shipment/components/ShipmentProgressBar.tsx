import { cn } from '@/shared/utils/cn';
import { SHIPMENT_STATUSES, type ShipmentStatus } from '@/shared/types/shipment.types';

type ShipmentProgressBarProps = {
  status: ShipmentStatus;
};

const steps = [
  { key: SHIPMENT_STATUSES.PENDING, label: 'Ready' },
  { key: SHIPMENT_STATUSES.IN_TRANSIT, label: 'In Transit' },
  { key: SHIPMENT_STATUSES.OUT_FOR_DELIVERY, label: 'Out for Delivery' },
  { key: SHIPMENT_STATUSES.DELIVERED, label: 'Delivered' },
] as const;

const getActiveIndex = (status: ShipmentStatus) => {
  switch (status) {
    case SHIPMENT_STATUSES.PENDING:
      return 0;
    case SHIPMENT_STATUSES.IN_TRANSIT:
      return 1;
    case SHIPMENT_STATUSES.OUT_FOR_DELIVERY:
      return 2;
    case SHIPMENT_STATUSES.DELIVERED:
      return 3;
    case SHIPMENT_STATUSES.FAILED:
    case SHIPMENT_STATUSES.RETURNED:
      return 1;
    default:
      return 0;
  }
};

export const ShipmentProgressBar = ({ status }: ShipmentProgressBarProps) => {
  const activeIndex = getActiveIndex(status);

  return (
    <ol className="grid gap-4 md:grid-cols-4">
      {steps.map((step, index) => {
        const complete = index <= activeIndex;

        return (
          <li className="space-y-3" key={step.key}>
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
                {step.label}
              </span>
            </div>
            <div className={cn('h-px w-full', complete ? 'bg-text-primary' : 'bg-border')} />
          </li>
        );
      })}
    </ol>
  );
};
