import { forwardRef, useId } from 'react';
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
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const messageId = `${fieldId}-message`;
  const describedBy = [props['aria-describedby'], error || hint ? messageId : undefined].filter(Boolean).join(' ') || undefined;

  return (
    <label className="flex w-full flex-col gap-2 text-sm text-text-primary" htmlFor={fieldId}>
      <span className={cn(variant === 'transaction' ? 'text-xs font-medium text-text-secondary' : 'text-sm font-medium')}>
        {label}
      </span>
      <select
        {...props}
        aria-describedby={describedBy}
        aria-invalid={error ? true : props['aria-invalid']}
        className={cn(
          'min-h-11 rounded-input border bg-surface px-3 text-base text-text-primary transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-text-secondary disabled:opacity-70',
          error ? 'border-danger' : 'border-border hover:border-outline',
          className,
        )}
        id={fieldId}
        ref={ref}
      >
        {children}
      </select>
      {error ? <span className="text-sm text-danger" id={messageId} role="alert">{error}</span> : null}
      {!error && hint ? <span className="text-sm text-text-secondary" id={messageId}>{hint}</span> : null}
    </label>
  );
});
