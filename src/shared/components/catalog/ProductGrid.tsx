import { motion, useReducedMotion } from 'framer-motion';

import { ProductCard } from '@/shared/components/catalog/ProductCard';
import { motionPresets } from '@/shared/lib/motionPresets';
import type { ProductSummary } from '@/shared/types/catalog.types';

type ProductGridProps = {
  desktopColumns?: 3 | 4;
  products: ProductSummary[];
};

export const ProductGrid = ({ desktopColumns = 3, products }: ProductGridProps) => {
  const reducedMotion = useReducedMotion();
  const desktopColumnsClass = desktopColumns === 4 ? 'lg:grid-cols-3 xl:grid-cols-4' : 'lg:grid-cols-3';

  return (
    <motion.div className={`grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 sm:gap-y-10 ${desktopColumnsClass} xl:gap-x-7 xl:gap-y-14`} {...motionPresets.staggerContainer(Boolean(reducedMotion), 0.05)}>
      {products.map((product) => (
        <motion.div key={product.id} {...motionPresets.staggerItem(Boolean(reducedMotion))}>
          <ProductCard product={product} />
        </motion.div>
      ))}
    </motion.div>
  );
};
