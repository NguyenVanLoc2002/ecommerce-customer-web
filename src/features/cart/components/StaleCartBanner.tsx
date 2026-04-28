import { AlertTriangle } from 'lucide-react';

type StaleCartBannerProps = {
  count: number;
};

export const StaleCartBanner = ({ count }: StaleCartBannerProps) => (
  <div className="border border-danger/20 bg-surface px-5 py-4">
    <div className="flex items-start gap-3">
      <AlertTriangle className="mt-0.5 h-5 w-5 text-danger" />
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-danger">Adjustment required</p>
        <h2 className="mt-2 font-display text-[1.75rem] leading-none text-text-primary">A bag item needs review.</h2>
        <p className="mt-1 text-sm text-text-secondary">
          {count} item{count === 1 ? '' : 's'} now exceed current stock. Reduce the quantity before checkout can continue.
        </p>
      </div>
    </div>
  </div>
);
