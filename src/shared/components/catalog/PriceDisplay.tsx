import { formatMoney } from '@/shared/utils/formatMoney';

type PriceDisplayProps = {
  price: number;
  compareAtPrice?: number;
  size?: 'md' | 'lg';
};

export const PriceDisplay = ({ compareAtPrice, price, size = 'md' }: PriceDisplayProps) => (
  <div className="shrink-0 text-right">
    <span className={size === 'lg' ? 'font-display text-[2rem] leading-none text-text-primary' : 'font-display text-lg leading-none text-text-primary'}>
      {formatMoney(price)}
    </span>
    {compareAtPrice ? <span className="ml-3 text-sm text-text-secondary line-through">{formatMoney(compareAtPrice)}</span> : null}
  </div>
);
