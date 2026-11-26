import { motion, useReducedMotion } from 'framer-motion';

import { PriceDisplay } from '@/shared/components/catalog/PriceDisplay';
import { Button } from '@/shared/components/ui/Button';

type StickyCartBarProps = {
  disabled?: boolean;
  label?: string;
  price?: number;
  compareAtPrice?: number;
  variantSummary?: string;
  onAddToCart: () => void;
  loading?: boolean;
};

export const StickyCartBar = ({ compareAtPrice, disabled = false, label = 'Add to Bag', loading = false, onAddToCart, price, variantSummary }: StickyCartBarProps) => {
  const reducedMotion = useReducedMotion();

  return (
    <motion.div
      animate={{ y: 0, opacity: 1 }}
      className="fixed inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] z-30 border-t border-border bg-canvas/95 px-page py-3 shadow-subtle backdrop-blur-sm lg:hidden"
      initial={{ y: reducedMotion ? 0 : 48, opacity: reducedMotion ? 1 : 0 }}
      transition={reducedMotion ? { duration: 0 } : { duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="mx-auto flex max-w-layout items-center justify-between gap-3">
        <div className="min-w-0">
          {variantSummary ? <p className="truncate text-xs text-text-secondary">{variantSummary}</p> : null}
          {price !== undefined ? <PriceDisplay align="left" appearance="catalog" compareAtPrice={compareAtPrice} price={price} /> : <span className="text-sm text-text-secondary">Chọn phân loại</span>}
        </div>
        <Button className="min-h-11 w-[48%] shrink-0 rounded px-3 text-xs sm:text-sm" disabled={disabled} loading={loading} onClick={onAddToCart}>
          {label}
        </Button>
      </div>
    </motion.div>
  );
};
