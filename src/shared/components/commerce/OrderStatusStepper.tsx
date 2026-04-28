import { cn } from '@/shared/utils/cn';
import { ORDER_STATUSES, type OrderStatus } from '@/shared/types/enums';

type OrderStatusStepperProps = {
  status: OrderStatus;
};

const steps = [
  { key: 'placed', label: 'Order placed' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'transit', label: 'In transit' },
  { key: 'delivered', label: 'Delivered' },
] as const;

const activeIndexByStatus: Record<OrderStatus, number> = {
  [ORDER_STATUSES.PENDING]: 0,
  [ORDER_STATUSES.AWAITING_PAYMENT]: 0,
  [ORDER_STATUSES.CONFIRMED]: 1,
  [ORDER_STATUSES.PROCESSING]: 2,
  [ORDER_STATUSES.SHIPPED]: 2,
  [ORDER_STATUSES.DELIVERED]: 3,
  [ORDER_STATUSES.COMPLETED]: 3,
  [ORDER_STATUSES.CANCELLED]: -1,
};

const descriptions: Record<OrderStatus, string> = {
  [ORDER_STATUSES.PENDING]: 'Your order has been created and is waiting for fulfillment approval.',
  [ORDER_STATUSES.AWAITING_PAYMENT]: 'Your order is reserved and awaiting a successful payment handoff.',
  [ORDER_STATUSES.CONFIRMED]: 'Your order has been confirmed and is moving into warehouse preparation.',
  [ORDER_STATUSES.PROCESSING]: 'Your package is being prepared and handed to shipment.',
  [ORDER_STATUSES.SHIPPED]: 'Your shipment is in transit with the carrier.',
  [ORDER_STATUSES.DELIVERED]: 'Your shipment reached the final delivery destination.',
  [ORDER_STATUSES.COMPLETED]: 'Your order has been delivered and archived in your purchase history.',
  [ORDER_STATUSES.CANCELLED]: 'This order was cancelled before fulfillment.',
};

const labels: Record<OrderStatus, string> = {
  [ORDER_STATUSES.PENDING]: 'Pending',
  [ORDER_STATUSES.AWAITING_PAYMENT]: 'Awaiting payment',
  [ORDER_STATUSES.CONFIRMED]: 'Confirmed',
  [ORDER_STATUSES.PROCESSING]: 'Processing',
  [ORDER_STATUSES.SHIPPED]: 'Shipped',
  [ORDER_STATUSES.DELIVERED]: 'Delivered',
  [ORDER_STATUSES.COMPLETED]: 'Completed',
  [ORDER_STATUSES.CANCELLED]: 'Cancelled',
};

export const OrderStatusStepper = ({ status }: OrderStatusStepperProps) => {
  if (status === ORDER_STATUSES.CANCELLED) {
    return (
      <div className="border border-danger/20 bg-surface px-5 py-5 text-danger">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em]">Cancelled</p>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-text-secondary">{descriptions[status]}</p>
      </div>
    );
  }

  const activeIndex = activeIndexByStatus[status];

  return (
    <section className="border border-border bg-surface px-5 py-6 md:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-outline">Status</p>
          <h2 className="mt-2 font-display text-[2rem] leading-none text-text-primary">{labels[status]}</h2>
        </div>
        <p className="max-w-xl text-sm leading-7 text-text-secondary">{descriptions[status]}</p>
      </div>
      <ol className="mt-8 grid gap-4 md:grid-cols-4">
        {steps.map((step, index) => {
          const complete = index <= activeIndex;

          return (
            <li className="relative space-y-3" key={step.key}>
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    'inline-flex h-10 w-10 items-center justify-center border text-[11px] font-bold uppercase tracking-[0.18em]',
                    complete ? 'border-text-primary bg-text-primary text-surface' : 'border-border text-outline',
                  )}
                >
                  {index + 1}
                </span>
                <span className={cn('text-[11px] font-bold uppercase tracking-[0.18em]', complete ? 'text-text-primary' : 'text-outline')}>
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 ? <div className={cn('hidden h-px w-full md:block', index < activeIndex ? 'bg-text-primary' : 'bg-border')} /> : null}
            </li>
          );
        })}
      </ol>
    </section>
  );
};
