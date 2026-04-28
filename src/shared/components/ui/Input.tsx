import { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';

import { cn } from '@/shared/utils/cn';

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  hint?: string;
  variant?: 'default' | 'auth' | 'transaction';
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, error, hint, id, label, variant = 'default', ...props },
  ref,
) {
  const authVariant = variant === 'auth';
  const transactionVariant = variant === 'transaction';

  return (
    <label className={cn('flex w-full flex-col text-text-primary', authVariant ? 'gap-2' : 'gap-2')} htmlFor={id}>
      <span
        className={cn(
          authVariant || transactionVariant
            ? 'text-[11px] font-bold uppercase tracking-[0.18em] text-outline'
            : 'text-sm font-medium',
        )}
      >
        {label}
      </span>
      <input
        className={cn(
          authVariant
            ? 'h-12 border-0 border-b border-border bg-transparent px-0 text-base text-text-primary transition-colors duration-300 placeholder:uppercase placeholder:tracking-[0.18em] placeholder:text-border focus:border-brand-primary focus:outline-none focus:ring-0'
            : transactionVariant
              ? 'h-12 border border-border bg-surface px-4 text-sm uppercase tracking-[0.08em] text-text-primary transition-colors duration-300 placeholder:uppercase placeholder:tracking-[0.16em] placeholder:text-outline focus:border-text-primary focus:outline-none focus:ring-0'
            : 'h-12 rounded-input border border-border bg-surface px-4 text-text-primary transition-colors duration-200 placeholder:text-text-secondary/70 focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/15',
          error &&
            ((authVariant || transactionVariant)
              ? 'border-danger text-danger focus:border-danger'
              : 'border-danger focus:border-danger focus:ring-danger/15'),
          className,
        )}
        id={id}
        ref={ref}
        {...props}
      />
      {error ? <span className="text-sm text-danger">{error}</span> : null}
      {!error && hint ? <span className="text-sm text-text-secondary">{hint}</span> : null}
    </label>
  );
});
