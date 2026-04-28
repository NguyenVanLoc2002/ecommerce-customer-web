import { routes } from '@/constants/routes';
import { cn } from '@/shared/utils/cn';

type CheckoutStepKey = 'address' | 'payment' | 'voucher' | 'review' | 'confirmation';

type CheckoutStepperProps = {
  currentStep: CheckoutStepKey;
};

const steps: Array<{ key: CheckoutStepKey; label: string; route: string }> = [
  { key: 'address', label: 'Shipping', route: routes.checkoutAddress },
  { key: 'payment', label: 'Payment', route: routes.checkoutPayment },
  { key: 'voucher', label: 'Rewards', route: routes.checkoutVoucher },
  { key: 'review', label: 'Review', route: routes.checkoutReview },
  { key: 'confirmation', label: 'Confirm', route: routes.checkoutConfirmation },
];

export const CheckoutStepper = ({ currentStep }: CheckoutStepperProps) => {
  const currentIndex = steps.findIndex((step) => step.key === currentStep);

  return (
    <nav aria-label="Checkout steps" className="border-b border-border pb-6">
      <div className="flex items-baseline justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-outline">Step {String(currentIndex + 1).padStart(2, '0')}</p>
          <p className="mt-2 text-sm uppercase tracking-[0.12em] text-text-secondary">{steps[currentIndex]?.label}</p>
        </div>
        <p className="text-[11px] uppercase tracking-[0.18em] text-outline">{currentIndex + 1} / {steps.length}</p>
      </div>
      <ol className="mt-5 grid gap-3 md:grid-cols-5">
        {steps.map((step, index) => {
          const active = index === currentIndex;
          const complete = index < currentIndex;

          return (
            <li className="space-y-3" key={step.key}>
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    'inline-flex h-8 w-8 items-center justify-center border text-[11px] font-bold uppercase tracking-[0.16em] transition-colors',
                    active
                      ? 'border-text-primary bg-text-primary text-surface'
                      : complete
                        ? 'border-text-primary text-text-primary'
                        : 'border-border text-outline',
                  )}
                >
                  {index + 1}
                </span>
                <span className={cn('text-[11px] font-bold uppercase tracking-[0.18em]', active || complete ? 'text-text-primary' : 'text-outline')}>
                  {step.label}
                </span>
              </div>
              <div className={cn('h-px w-full', complete || active ? 'bg-text-primary' : 'bg-border')} />
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
