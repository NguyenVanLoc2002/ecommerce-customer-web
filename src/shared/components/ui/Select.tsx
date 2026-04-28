import { forwardRef } from 'react';
import type { SelectHTMLAttributes } from 'react';

import { cn } from '@/shared/utils/cn';

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  error?: string;
  hint?: string;
  variant?: 'default' | 'transaction';
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { children, className, error, hint, id, label, variant = 'default', ...props },
  ref,
) {
  return (
    <label className="flex w-full flex-col gap-2 text-text-primary" htmlFor={id}>
      <span className={cn(variant === 'transaction' ? 'text-[11px] font-bold uppercase tracking-[0.18em] text-outline' : 'text-sm font-medium')}>
        {label}
      </span>
      <select
        className={cn(
          variant === 'transaction'
            ? 'h-12 border border-border bg-surface px-4 text-sm uppercase tracking-[0.08em] text-text-primary transition-colors duration-300 focus:border-text-primary focus:outline-none focus:ring-0'
            : 'h-12 rounded-input border border-border bg-surface px-4 text-text-primary transition-colors duration-200 focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/15',
          error && (variant === 'transaction' ? 'border-danger focus:border-danger' : 'border-danger focus:border-danger focus:ring-danger/15'),
          className,
        )}
        id={id}
        ref={ref}
        {...props}
      >
        {children}
      </select>
      {error ? <span className="text-sm text-danger">{error}</span> : null}
      {!error && hint ? <span className="text-sm text-text-secondary">{hint}</span> : null}
    </label>
  );
});
