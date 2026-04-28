import { Star } from 'lucide-react';

import { cn } from '@/shared/utils/cn';

type StarRatingDisplayProps = {
  rating: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
};

const sizeClasses: Record<NonNullable<StarRatingDisplayProps['size']>, string> = {
  sm: 'h-3.5 w-3.5',
  md: 'h-4 w-4',
  lg: 'h-6 w-6',
};

export const StarRatingDisplay = ({ className, rating, size = 'md' }: StarRatingDisplayProps) => (
  <div className={cn('flex items-center gap-1 text-text-primary', className)}>
    {Array.from({ length: 5 }).map((_, index) => {
      const isFilled = index < Math.round(rating);

      return (
        <Star
          className={cn(sizeClasses[size], isFilled ? 'fill-current text-text-primary' : 'text-border')}
          key={index}
          strokeWidth={1.5}
        />
      );
    })}
  </div>
);
