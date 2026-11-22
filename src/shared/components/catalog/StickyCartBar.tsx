import { motion, useReducedMotion } from 'framer-motion';

import { PriceDisplay } from '@/shared/components/catalog/PriceDisplay';
import { Button } from '@/shared/components/ui/Button';

type StickyCartBarProps = {
  disabled?: boolean;
  label?: string;
  price?: number;
  compareAtPrice?: number;
  onAddToCart: () => void;
  loading?: boolean;
};

export const StickyCartBar = ({ compareAtPrice, disabled = false, label = 'Add to Bag', loading = false, onAddToCart, price }: StickyCartBarProps) => {
  const reducedMotion = useReducedMotion();

  return (
    <motion.div
      animate={{ y: 0, opacity: 1 }}
      className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-canvas px-page py-3 lg:hidden"
      initial={{ y: reducedMotion ? 0 : 48, opacity: reducedMotion ? 1 : 0 }}
      transition={reducedMotion ? { duration: 0 } : { duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="mx-auto flex max-w-layout items-center justify-between gap-3">
        {price !== undefined ? <PriceDisplay align="left" compareAtPrice={compareAtPrice} price={price} /> : <span className="text-sm text-text-secondary">Chọn phân loại</span>}
        <Button className="min-h-11 shrink-0 px-4 text-xs sm:text-sm" disabled={disabled} loading={loading} onClick={onAddToCart}>
          {label}
        </Button>
      </div>
    </motion.div>
  );
};
