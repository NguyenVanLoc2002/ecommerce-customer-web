import { formatVnd } from '@/shared/utils/formatVnd';

type PriceDisplayProps = {
  price: number;
  compareAtPrice?: number;
  size?: 'md' | 'lg';
  align?: 'left' | 'right';
  appearance?: 'display' | 'catalog';
  className?: string;
};

export const PriceDisplay = ({ align = 'right', appearance = 'display', className, compareAtPrice, price, size = 'md' }: PriceDisplayProps) => {
  const priceClassName = appearance === 'catalog'
    ? size === 'lg'
      ? 'font-sans text-2xl font-semibold leading-tight text-text-primary md:text-[1.75rem]'
      : 'font-sans text-base font-semibold leading-tight text-text-primary'
    : size === 'lg'
      ? 'font-display text-[2rem] leading-none text-text-primary'
      : 'font-display text-lg leading-none text-text-primary';

  return (
    <div className={`shrink-0 ${align === 'left' ? 'text-left' : 'text-right'}`}>
      <span className={className ?? priceClassName}>{formatVnd(price)}</span>
      {compareAtPrice !== undefined && compareAtPrice > price ? <span className="ml-3 text-sm text-text-secondary line-through">{formatVnd(compareAtPrice)}</span> : null}
    </div>
  );
};
