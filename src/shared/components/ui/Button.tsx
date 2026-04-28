import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';

import { buttonStyles } from '@/shared/components/ui/buttonStyles';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

type ButtonProps = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: ButtonVariant;
    size?: ButtonSize;
    fullWidth?: boolean;
  }
>;

export const Button = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  type = 'button',
  ...props
}: ButtonProps) => (
  <button
    className={buttonStyles({ className, variant, size, fullWidth })}
    type={type}
    {...props}
  >
    {children}
  </button>
);
