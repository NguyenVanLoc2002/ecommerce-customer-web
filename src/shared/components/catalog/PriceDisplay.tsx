import { formatVnd } from '@/shared/utils/formatVnd';

type PriceDisplayProps = {
  price: number;
  compareAtPrice?: number;
  size?: 'md' | 'lg';
  align?: 'left' | 'right';
};

export const PriceDisplay = ({ align = 'right', compareAtPrice, price, size = 'md' }: PriceDisplayProps) => (
  <div className={`shrink-0 ${align === 'left' ? 'text-left' : 'text-right'}`}>
    <span className={size === 'lg' ? 'font-display text-[2rem] leading-none text-text-primary' : 'font-display text-lg leading-none text-text-primary'}>
      {formatVnd(price)}
    </span>
    {compareAtPrice ? <span className="ml-3 text-sm text-text-secondary line-through">{formatVnd(compareAtPrice)}</span> : null}
  </div>
);
