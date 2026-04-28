import type { PropsWithChildren } from 'react';

import { motion, useReducedMotion } from 'framer-motion';

import { motionPresets } from '@/shared/lib/motionPresets';
import { cn } from '@/shared/utils/cn';

type PageWrapperProps = PropsWithChildren<{
  className?: string;
}>;

export const PageWrapper = ({ children, className }: PageWrapperProps) => {
  const reducedMotion = useReducedMotion();

  return (
    <motion.div className={cn('pt-32 pb-20 md:pb-24', className)} {...motionPresets.page(Boolean(reducedMotion))}>
      {children}
    </motion.div>
  );
};
