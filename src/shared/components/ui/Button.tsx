import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';
import { LoaderCircle } from 'lucide-react';

import { buttonStyles } from '@/shared/components/ui/buttonStyles';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

type ButtonProps = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: ButtonVariant;
    size?: ButtonSize;
    fullWidth?: boolean;
    loading?: boolean;
  }
>;

export const Button = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  type = 'button',
  disabled,
  ...props
}: ButtonProps) => (
  <button
    aria-busy={loading || undefined}
    className={buttonStyles({ className, variant, size, fullWidth })}
    disabled={disabled || loading}
    type={type}
    {...props}
  >
    {loading ? <LoaderCircle aria-hidden="true" className="h-4 w-4 animate-spin motion-reduce:animate-none" /> : null}
    {children}
  </button>
);
