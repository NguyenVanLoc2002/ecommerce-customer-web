import { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';

import { cn } from '@/shared/utils/cn';

type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  label: string;
  description?: string;
  error?: string;
};

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { checked, className, description, error, id, label, ...props },
  ref,
) {
  return (
    <div className="space-y-2">
      <label className="flex items-start gap-3 text-text-primary" htmlFor={id}>
        <input
          checked={checked}
          className={cn(
            'mt-1 h-4 w-4 rounded-[2px] border-border text-brand-primary focus:ring-2 focus:ring-brand-primary/15',
            error && 'border-danger text-danger focus:ring-danger/15',
            className,
          )}
          id={id}
          ref={ref}
          type="checkbox"
          {...props}
        />
        <span className="space-y-1">
          <span className="block text-sm font-medium">{label}</span>
          {description ? <span className="block text-sm leading-6 text-text-secondary">{description}</span> : null}
        </span>
      </label>
      {error ? <p className="text-sm text-danger">{error}</p> : null}
    </div>
  );
});
