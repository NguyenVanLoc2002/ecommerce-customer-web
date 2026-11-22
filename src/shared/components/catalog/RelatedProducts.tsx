import { motion, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';

import { routePaths } from '@/constants/routes';
import { PriceDisplay } from '@/shared/components/catalog/PriceDisplay';
import { motionPresets } from '@/shared/lib/motionPresets';
import type { ProductSummary } from '@/shared/types/catalog.types';

type RelatedProductsProps = {
  products: ProductSummary[];
};

export const RelatedProducts = ({ products }: RelatedProductsProps) => {
  const reducedMotion = Boolean(useReducedMotion());

  return (
    <section aria-labelledby="related-products-title" className="space-y-8 py-4 md:space-y-10">
      <header>
        <h2 className="text-2xl font-medium tracking-tight text-text-primary md:text-3xl" id="related-products-title">Gợi ý kết hợp</h2>
        <div className="mt-4 h-px w-full bg-border" />
      </header>
      <motion.div
        className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 md:gap-x-8 md:gap-y-14 lg:grid-cols-4"
        {...motionPresets.staggerContainer(reducedMotion, 0.08)}
      >
        {products.map((product, index) => (
          <motion.article
            className={`group min-w-0 ${index % 2 === 1 ? 'lg:mt-10' : ''}`}
            key={product.id}
            {...motionPresets.staggerItem(reducedMotion)}
          >
            <Link className="block focus-visible:outline-offset-4" to={routePaths.productDetail(product.slug)}>
              <div className="relative aspect-[4/5] overflow-hidden bg-surface-soft">
                <img
                  alt={product.primaryImage.alt}
                  className="h-full w-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105 motion-reduce:transition-none"
                  height={product.primaryImage.height}
                  loading="lazy"
                  src={product.primaryImage.src}
                  width={product.primaryImage.width}
                />
                <span className="product-quick-add absolute inset-x-0 bottom-0 translate-y-full px-4 py-4 text-center text-[10px] font-semibold uppercase tracking-[0.18em] text-text-primary opacity-0 transition-[transform,opacity] duration-500 group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100 motion-reduce:transition-none">
                  Xem sản phẩm
                </span>
              </div>
              <div className="flex items-start justify-between gap-3 pt-4 md:pt-5">
                <h3 className="min-w-0 text-sm font-medium leading-snug text-text-primary transition-colors group-hover:text-text-secondary md:text-base">{product.name}</h3>
                <PriceDisplay align="right" compareAtPrice={product.compareAtPrice} price={product.price} />
              </div>
            </Link>
          </motion.article>
        ))}
      </motion.div>
    </section>
  );
};
