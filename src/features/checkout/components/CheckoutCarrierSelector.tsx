import { Truck } from 'lucide-react';

import type { CheckoutCarrierOption, DeliveryEstimate } from '@/shared/types/commerce.types';
import { Button } from '@/shared/components/ui/Button';

type CheckoutCarrierSelectorProps = {
  options: CheckoutCarrierOption[];
  selectedCarrierId: string;
  onChange: (carrierId: string) => void;
  onRetry: () => void;
  onRetryPreview?: () => void;
  errorMessage?: string | null;
  selectionError?: string | null;
  shippingServiceName?: string | null;
  deliveryEstimate?: DeliveryEstimate;
  previewError?: string | null;
  carrierLoading?: boolean;
  previewLoading?: boolean;
};

export const CheckoutCarrierSelector = ({
  carrierLoading = false,
  deliveryEstimate,
  errorMessage,
  onChange,
  onRetry,
  onRetryPreview,
  options,
  previewError,
  previewLoading = false,
  selectionError,
  selectedCarrierId,
  shippingServiceName,
}: CheckoutCarrierSelectorProps) => {
  if (carrierLoading) {
    return (
      <section aria-live="polite" className="border border-border bg-surface px-5 py-5 md:px-6">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-outline">Shipping carrier</p>
        <h2 className="mt-2 text-sm font-semibold uppercase tracking-wider text-text-primary">Loading delivery options</h2>
        <p className="mt-4 text-sm leading-7 text-text-secondary">Fetching the live carrier list for this checkout.</p>
      </section>
    );
  }

  if (errorMessage) {
    return (
      <section aria-live="assertive" className="border border-danger/30 bg-surface px-5 py-5 md:px-6">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-danger">Shipping carrier</p>
        <h2 className="mt-2 text-sm font-semibold uppercase tracking-wider text-text-primary">Carrier loading failed</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">{errorMessage}</p>
        <div className="mt-3 md:mt-5">
          <Button onClick={onRetry} variant="secondary">
            Retry carriers
          </Button>
        </div>
      </section>
    );
  }

  if (options.length === 0) {
    return (
      <section aria-live="polite" className="border border-border bg-surface px-5 py-5 md:px-6">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-outline">Shipping carrier</p>
        <h2 className="mt-2 text-sm font-semibold uppercase tracking-wider text-text-primary">No carrier available</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">
          The backend returned no active checkout carrier, so this order can still continue with a zero-fee shipping fallback.
        </p>
      </section>
    );
  }

  return (
    <section className="md:border md:border-border md:bg-surface md:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <h2 className="flex items-center gap-2 text-base font-semibold uppercase tracking-wide md:text-sm">
          <Truck aria-hidden="true" className="size-4" />
          Phương thức vận chuyển
        </h2>
        {previewLoading ? <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-text-primary">Refreshing total...</p> : null}
      </div>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">
        Phí giao hàng được tính theo địa chỉ và đơn vị vận chuyển đã chọn.
      </p>
      {selectedCarrierId && deliveryEstimate?.basis === 'CARRIER_HANDOVER' ? (
        <p className="mt-2 text-sm font-medium text-text-primary">
          Dự kiến {deliveryEstimate.minBusinessDays === deliveryEstimate.maxBusinessDays
            ? deliveryEstimate.minBusinessDays
            : `${deliveryEstimate.minBusinessDays}–${deliveryEstimate.maxBusinessDays}`} ngày làm việc sau khi bàn giao cho đơn vị vận chuyển.
        </p>
      ) : null}
      <fieldset aria-describedby="shipping-carrier-hint" className="mt-3 md:mt-5">
        <legend className="sr-only">Shipping carrier</legend>
        <p className="sr-only" id="shipping-carrier-hint">
          Choose one carrier to refresh the checkout shipping quote.
        </p>
        <div className="grid gap-3 md:gap-4" role="radiogroup">
          {options.map((option) => {
            const checked = option.id === selectedCarrierId;

            return (
              <label
                className={`block cursor-pointer rounded-feature border p-4 transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-brand-primary md:rounded-card md:p-5 ${
                  checked ? 'border-brand-primary bg-surface' : 'border-border bg-surface hover:border-text-primary'
                }`}
                key={option.id}
              >
                <input
                  checked={checked}
                  className="sr-only"
                  name="shipping-carrier"
                  onChange={() => onChange(option.id)}
                  type="radio"
                  value={option.id}
                />
                <div className="flex items-start gap-4">
                  <span
                    aria-hidden="true"
                    className={`mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full border ${
                      checked ? 'border-text-primary' : 'border-border'
                    }`}
                  >
                    <span className={`h-2 w-2 rounded-full ${checked ? 'bg-text-primary' : 'bg-transparent'}`} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-outline">{option.providerType}</p>
                      {checked && shippingServiceName ? (
                        <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-text-primary">{shippingServiceName}</span>
                      ) : null}
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      {option.logoUrl ? (
                        <img
                          alt={`${option.name} logo`}
                          className="h-10 w-10 rounded-full border border-border object-cover"
                          height={40}
                          src={option.logoUrl}
                          width={40}
                        />
                      ) : null}
                      <h3 className="text-sm font-semibold leading-snug text-text-primary">{option.name}</h3>
                    </div>
                    <p className="mt-1 text-sm leading-6 text-text-secondary">
                      {option.description?.trim() ? option.description : 'Live shipping quote available during checkout preview.'}
                    </p>
                  </div>
                </div>
              </label>
            );
          })}
        </div>
      </fieldset>
      {!selectedCarrierId ? (
        <p aria-live="polite" className="mt-4 text-sm leading-7 text-text-secondary">
          Select one carrier to preview the shipping fee and final order total.
        </p>
      ) : null}
      {selectionError ? (
        <p aria-live="assertive" className="mt-4 text-sm leading-7 text-danger">
          {selectionError}
        </p>
      ) : null}
      {previewError ? (
        <div aria-live="assertive" className="mt-4 space-y-3">
          <p className="text-sm leading-7 text-danger">{previewError}</p>
          {onRetryPreview ? (
            <Button onClick={onRetryPreview} variant="secondary">
              Retry quote
            </Button>
          ) : null}
        </div>
      ) : null}
    </section>
  );
};
