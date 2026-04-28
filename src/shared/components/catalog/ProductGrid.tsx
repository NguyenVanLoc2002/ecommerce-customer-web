import { motion, useReducedMotion } from 'framer-motion';

import { ProductCard } from '@/shared/components/catalog/ProductCard';
import { motionPresets } from '@/shared/lib/motionPresets';
import type { ProductSummary } from '@/shared/types/catalog.types';

type ProductGridProps = {
  products: ProductSummary[];
};

export const ProductGrid = ({ products }: ProductGridProps) => {
  const reducedMotion = useReducedMotion();

  return (
    <motion.div className="grid grid-cols-2 gap-x-6 gap-y-12 lg:grid-cols-4 xl:gap-x-8 xl:gap-y-16" {...motionPresets.staggerContainer(Boolean(reducedMotion), 0.05)}>
      {products.map((product) => (
        <motion.div key={product.id} {...motionPresets.staggerItem(Boolean(reducedMotion))}>
          <ProductCard product={product} />
        </motion.div>
      ))}
    </motion.div>
  );
};
