import type { PropsWithChildren } from 'react';

import { cn } from '@/shared/utils/cn';

type ContainerProps = PropsWithChildren<{
  className?: string;
}>;

export const Container = ({ children, className }: ContainerProps) => (
  <div className={cn('mx-auto w-full max-w-layout px-page', className)}>{children}</div>
);
