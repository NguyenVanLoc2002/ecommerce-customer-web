import { motion, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';

import { routePaths } from '@/constants/routes';
import { PriceDisplay } from '@/shared/components/catalog/PriceDisplay';
import type { ProductSummary } from '@/shared/types/catalog.types';

type ProductCardProps = {
  product: ProductSummary;
  showBadge?: boolean;
};

export const ProductCard = ({ product, showBadge = true }: ProductCardProps) => {
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
          {showBadge && product.badges[0] ? (
            <span className="absolute left-4 top-4 border border-border bg-surface px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-text-primary">
              {product.badges[0]}
            </span>
          ) : null}
        </div>
        <div className="flex items-start justify-between gap-4 px-1 pt-5">
          <div>
            <h3 className="font-display text-xl leading-tight text-text-primary md:text-[1.4rem]">
              {product.name}
            </h3>
            <p className="mt-2 max-w-[18rem] text-sm leading-6 text-text-secondary">{product.subtitle}</p>
          </div>
          <PriceDisplay compareAtPrice={product.compareAtPrice} price={product.price} />
        </div>
      </Link>
    </motion.article>
  );
};
