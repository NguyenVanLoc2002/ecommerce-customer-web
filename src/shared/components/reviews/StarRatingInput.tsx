import { Star } from 'lucide-react';

import { cn } from '@/shared/utils/cn';

type StarRatingInputProps = {
  value: number;
  onChange: (nextValue: number) => void;
  error?: string;
};

export const StarRatingInput = ({ error, onChange, value }: StarRatingInputProps) => (
  <div className="space-y-4">
    <div className="flex items-center justify-center gap-3">
      {Array.from({ length: 5 }).map((_, index) => {
        const starValue = index + 1;
        const isFilled = value >= starValue;

        return (
          <button
            aria-label={`Rate ${starValue} star${starValue > 1 ? 's' : ''}`}
            className="transition-transform duration-200 hover:scale-105"
            key={starValue}
            onClick={() => onChange(starValue)}
            type="button"
          >
            <Star
              className={cn('h-10 w-10 md:h-12 md:w-12', isFilled ? 'fill-current text-text-primary' : 'text-border')}
              strokeWidth={1.4}
            />
          </button>
        );
      })}
    </div>
    {error ? <p className="text-center text-sm text-danger">{error}</p> : null}
  </div>
);
