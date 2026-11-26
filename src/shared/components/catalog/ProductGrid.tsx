import { motion, useReducedMotion } from 'framer-motion';

import { ProductCard } from '@/shared/components/catalog/ProductCard';
import { motionPresets } from '@/shared/lib/motionPresets';
import type { ProductSummary } from '@/shared/types/catalog.types';

type ProductGridProps = {
  appearance?: 'home' | 'list';
  products: ProductSummary[];
};

export const ProductGrid = ({ appearance = 'list', products }: ProductGridProps) => {
  const reducedMotion = useReducedMotion();
  const isHomeGrid = appearance === 'home';
  const desktopColumnsClass = isHomeGrid ? 'lg:grid-cols-4' : 'lg:grid-cols-3';
  const motionReduced = Boolean(reducedMotion);

  return (
    <motion.div className={`grid grid-cols-2 gap-x-3.5 gap-y-7 lg:gap-x-6 lg:gap-y-10 ${desktopColumnsClass}`} {...(isHomeGrid ? motionPresets.staggerContainer(motionReduced, 0.05) : {})}>
      {products.map((product) => (
        <motion.div key={product.id} {...(isHomeGrid ? motionPresets.staggerItem(motionReduced) : {})}>
          <ProductCard appearance={appearance} product={product} />
        </motion.div>
      ))}
    </motion.div>
  );
};
