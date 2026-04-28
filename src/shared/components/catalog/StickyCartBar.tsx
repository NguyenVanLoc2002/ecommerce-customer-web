import { motion } from 'framer-motion';

import { PriceDisplay } from '@/shared/components/catalog/PriceDisplay';
import { Button } from '@/shared/components/ui/Button';

type StickyCartBarProps = {
  price: number;
  compareAtPrice?: number;
  onAddToCart: () => void;
};

export const StickyCartBar = ({ compareAtPrice, onAddToCart, price }: StickyCartBarProps) => (
  <motion.div
    animate={{ y: 0, opacity: 1 }}
    className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-canvas/98 px-page py-4 backdrop-blur lg:hidden"
    initial={{ y: 48, opacity: 0 }}
    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
  >
    <div className="mx-auto flex max-w-layout items-center justify-between gap-4">
      <PriceDisplay compareAtPrice={compareAtPrice} price={price} />
      <Button onClick={onAddToCart}>Add to Bag</Button>
    </div>
  </motion.div>
);
