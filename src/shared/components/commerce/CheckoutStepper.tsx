import { routes } from '@/constants/routes';
import { cn } from '@/shared/utils/cn';

type CheckoutStepKey = 'address' | 'payment' | 'voucher' | 'review' | 'confirmation';

type CheckoutStepperProps = {
  currentStep: CheckoutStepKey;
};

const steps: Array<{ key: CheckoutStepKey; label: string; route: string }> = [
  { key: 'address', label: 'Địa chỉ', route: routes.checkoutAddress },
  { key: 'payment', label: 'Thanh toán', route: routes.checkoutPayment },
  { key: 'voucher', label: 'Khuyến mãi', route: routes.checkoutVoucher },
  { key: 'review', label: 'Xem lại & xác nhận', route: routes.checkoutReview },
];

export const CheckoutStepper = ({ currentStep }: CheckoutStepperProps) => {
  const currentIndex = Math.max(0, steps.findIndex((step) => step.key === currentStep));

  return (
    <nav aria-label="Các bước thanh toán" className="md:border-b md:border-border md:pb-5">
      <ol className="mx-auto grid max-w-3xl grid-cols-4 gap-2 md:gap-6">
        {steps.map((step, index) => {
          const active = index === currentIndex;
          const complete = index < currentIndex;

          return (
            <li aria-current={active ? 'step' : undefined} className="min-w-0 space-y-1.5" key={step.key}>
              <div className="flex min-h-7 items-center gap-1 md:min-h-10 md:justify-center md:gap-2">
                <span
                  className={cn(
                    'hidden size-8 shrink-0 items-center justify-center rounded-full border text-xs font-semibold transition-colors md:inline-flex',
                    active
                      ? 'border-text-primary bg-text-primary text-surface'
                      : complete
                        ? 'border-brand-subtle bg-brand-subtle text-text-primary'
                        : 'border-border bg-surface-soft text-outline',
                  )}
                >
                  {complete ? '✓' : index + 1}
                </span>
                <span className={cn('flex min-w-0 items-baseline gap-1 text-[11px] leading-tight md:text-center md:text-xs md:leading-5', active || complete ? 'font-semibold text-text-primary' : 'text-text-secondary')}>
                  <span aria-hidden="true" className="shrink-0 md:hidden">{index + 1}.</span>
                  {step.label}
                </span>
              </div>
              <div className={cn('h-1 rounded-full', complete || active ? 'bg-text-primary' : 'bg-border')} />
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
