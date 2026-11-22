import { formatVnd } from '@/shared/utils/formatVnd';

type PriceDisplayProps = {
  price: number;
  compareAtPrice?: number;
  size?: 'md' | 'lg';
  align?: 'left' | 'right';
};

export const PriceDisplay = ({ align = 'right', compareAtPrice, price, size = 'md' }: PriceDisplayProps) => (
  <div className={`shrink-0 ${align === 'left' ? 'text-left' : 'text-right'}`}>
    <span className={size === 'lg' ? 'font-sans text-2xl font-semibold leading-tight text-text-primary md:text-[1.75rem]' : 'font-sans text-base font-semibold leading-tight text-text-primary'}>
      {formatVnd(price)}
    </span>
    {compareAtPrice !== undefined && compareAtPrice > price ? <span className="ml-3 text-sm text-text-secondary line-through">{formatVnd(compareAtPrice)}</span> : null}
  </div>
);
