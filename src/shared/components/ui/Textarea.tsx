import { forwardRef, useId } from 'react';
import type { TextareaHTMLAttributes } from 'react';

import { cn } from '@/shared/utils/cn';

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  error?: string;
  hint?: string;
  variant?: 'default' | 'transaction';
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className, error, hint, id, label, variant = 'default', ...props },
  ref,
) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const messageId = `${fieldId}-message`;
  const describedBy = [props['aria-describedby'], error || hint ? messageId : undefined].filter(Boolean).join(' ') || undefined;

  return (
    <label className="flex w-full flex-col gap-2 text-sm text-text-primary" htmlFor={fieldId}>
      <span className={cn(variant === 'transaction' ? 'text-xs font-medium text-text-secondary' : 'font-medium')}>
        {label}
      </span>
      <textarea
        {...props}
        aria-describedby={describedBy}
        aria-invalid={error ? true : props['aria-invalid']}
        className={cn(
          'min-h-28 rounded-input border bg-surface px-3 py-3 text-base text-text-primary transition-colors duration-200 placeholder:text-text-secondary/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-text-secondary disabled:opacity-70',
          error ? 'border-danger' : 'border-border hover:border-outline',
          className,
        )}
        id={fieldId}
        ref={ref}
      />
      {error ? <span className="text-sm text-danger" id={messageId} role="alert">{error}</span> : null}
      {!error && hint ? <span className="text-sm text-text-secondary" id={messageId}>{hint}</span> : null}
    </label>
  );
});
