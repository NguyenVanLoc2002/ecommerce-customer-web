import { forwardRef, useId } from 'react';
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
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const messageId = `${fieldId}-error`;
  const descriptionId = `${fieldId}-description`;
  const describedBy = [props['aria-describedby'], error ? messageId : description ? descriptionId : undefined]
    .filter(Boolean)
    .join(' ') || undefined;

  return (
    <div className="space-y-2">
      <label className="flex min-h-11 items-start gap-3 text-text-primary" htmlFor={fieldId}>
        <input
          {...props}
          checked={checked}
          className={cn(
            'mt-1 h-4 w-4 rounded-chip border-border text-brand-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary',
            error && 'border-danger text-danger focus:ring-danger/15',
            className,
          )}
          aria-describedby={describedBy}
          aria-invalid={error ? true : props['aria-invalid']}
          id={fieldId}
          ref={ref}
          type="checkbox"
        />
        <span className="space-y-1">
          <span className="block text-sm font-medium">{label}</span>
          {description ? <span className="block text-sm leading-6 text-text-secondary" id={descriptionId}>{description}</span> : null}
        </span>
      </label>
      {error ? <p className="text-sm text-danger" id={messageId} role="alert">{error}</p> : null}
    </div>
  );
});
