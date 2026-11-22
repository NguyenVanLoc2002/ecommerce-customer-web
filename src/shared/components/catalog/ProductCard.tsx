import { motion, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';

import { routePaths } from '@/constants/routes';
import { PriceDisplay } from '@/shared/components/catalog/PriceDisplay';
import type { ProductSummary } from '@/shared/types/catalog.types';

type ProductCardProps = {
  product: ProductSummary;
};

export const ProductCard = ({ product }: ProductCardProps) => {
  const reducedMotion = useReducedMotion();

  return (
    <motion.article
      className="group"
      transition={reducedMotion ? { duration: 0 } : { duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link className="block" to={routePaths.productDetail(product.slug)}>
        <div className="relative overflow-hidden bg-surface-muted">
          <img
            alt={product.primaryImage.alt}
            className="aspect-[3/4] h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
            height={product.primaryImage.height}
            loading="lazy"
            src={product.primaryImage.src}
            width={product.primaryImage.width}
          />
        </div>
        <div className="flex min-w-0 flex-col items-start gap-3 px-1 pt-4">
          <div className="min-w-0 w-full">
            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.12em] text-text-secondary">{product.brandName}</p>
            <h3 className="text-sm font-medium leading-snug text-text-primary sm:text-base">
              {product.name}
            </h3>
          </div>
          <PriceDisplay align="left" price={product.price} />
        </div>
      </Link>
    </motion.article>
  );
};
