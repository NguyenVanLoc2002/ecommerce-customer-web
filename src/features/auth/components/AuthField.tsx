import { forwardRef, useId, useState } from 'react';
import type { InputHTMLAttributes, ReactNode } from 'react';
import { Eye, EyeOff } from 'lucide-react';

import { cn } from '@/shared/utils/cn';

type AuthFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  labelAction?: ReactNode;
  icon?: ReactNode;
};

export const AuthField = forwardRef<HTMLInputElement, AuthFieldProps>(function AuthField(
  { className, disabled, error, icon, id, label, labelAction, type, ...props },
  ref,
) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const [visible, setVisible] = useState(false);
  const isPassword = type === 'password';
  const describedBy = [props['aria-describedby'], error && `${fieldId}-error`].filter(Boolean).join(' ') || undefined;

  return (
    <div className="min-w-0">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-x-2">
        <label className="text-xs font-medium tracking-wide text-text-primary" htmlFor={fieldId}>{label}</label>
        {labelAction}
      </div>
      <div className="relative">
        <input
          {...props}
          aria-describedby={describedBy}
          aria-invalid={error ? true : undefined}
          className={cn(
            'h-11 w-full rounded-input border bg-surface-muted px-3.5 text-sm placeholder:text-text-secondary/80 focus:bg-surface disabled:opacity-70',
            isPassword || icon ? 'pr-11' : '',
            error ? 'border-danger' : 'border-border',
            className,
          )}
          disabled={disabled}
          id={fieldId}
          ref={ref}
          type={isPassword && visible ? 'text' : type}
        />
        {icon && <span aria-hidden="true" className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-outline">{icon}</span>}
        {isPassword && (
          <button
            aria-label={`${visible ? 'Ẩn' : 'Hiện'} ${label.toLowerCase()}`}
            className="absolute right-0 top-0 grid size-11 place-items-center text-outline hover:text-text-primary"
            disabled={disabled}
            onClick={() => setVisible(!visible)}
            type="button"
          >
            {visible ? <EyeOff aria-hidden="true" size={18} /> : <Eye aria-hidden="true" size={18} />}
          </button>
        )}
      </div>
      {error && <p className="mt-1.5 text-xs text-danger" id={`${fieldId}-error`} role="alert">{error}</p>}
    </div>
  );
});
