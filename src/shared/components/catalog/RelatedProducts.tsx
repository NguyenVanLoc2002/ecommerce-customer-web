import { Link } from 'react-router-dom';

import { routePaths } from '@/constants/routes';
import { PriceDisplay } from '@/shared/components/catalog/PriceDisplay';
import type { ProductSummary } from '@/shared/types/catalog.types';

type RelatedProductsProps = {
  products: ProductSummary[];
};

export const RelatedProducts = ({ products }: RelatedProductsProps) => {
  const renderProducts = (items: ProductSummary[]) => items.map((product) => (
    <article className="group min-w-0" key={product.id}>
      <Link className="block focus-visible:outline-offset-4" to={routePaths.productDetail(product.slug)}>
        <div className="aspect-[3/4] overflow-hidden rounded bg-surface-soft">
          <img
            alt={product.primaryImage.alt}
            className="h-full w-full object-cover transition-opacity duration-300 group-hover:opacity-90 motion-reduce:transition-none"
            height={product.primaryImage.height}
            loading="lazy"
            src={product.primaryImage.src}
            width={product.primaryImage.width}
          />
        </div>
        <div className="pt-3">
          <p className="text-xs uppercase tracking-[0.08em] text-text-secondary">{product.brandName}</p>
          <h3 className="pt-1 text-sm font-medium leading-snug text-text-primary md:text-base">{product.name}</h3>
          <div className="pt-1">
            <PriceDisplay align="left" compareAtPrice={product.compareAtPrice} price={product.price} />
          </div>
        </div>
      </Link>
    </article>
  ));

  return (
    <section aria-labelledby="related-products-title" className="space-y-6 py-4 md:space-y-8">
      <header>
        <h2 className="text-2xl font-semibold tracking-tight text-text-primary md:text-3xl" id="related-products-title">Sản phẩm cùng bộ sưu tập</h2>
      </header>
      <div className="grid grid-cols-2 gap-x-3 gap-y-6 md:hidden">{renderProducts(products)}</div>
      <div className="hidden grid-cols-2 gap-12 md:grid">{renderProducts(products.slice(0, 2))}</div>
    </section>
  );
};
