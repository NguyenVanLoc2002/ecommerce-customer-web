import { Link } from 'react-router-dom';

import { routePaths, routes } from '@/constants/routes';
import { ProductBadges } from '@/shared/components/catalog/ProductBadges';
import { PriceDisplay } from '@/shared/components/catalog/PriceDisplay';
import type { ProductSummary } from '@/shared/types/catalog.types';

type RelatedProductsProps = {
  products: ProductSummary[];
  categorySlug?: string;
};

export const RelatedProducts = ({ categorySlug, products }: RelatedProductsProps) => {
  const viewAllHref = categorySlug
    ? `${routes.products}?category=${encodeURIComponent(categorySlug)}`
    : routes.products;

  const renderProducts = (items: ProductSummary[]) => items.map((product) => (
    <article className="group min-w-0" key={product.id}>
      <Link className="block focus-visible:outline-offset-4" to={routePaths.productDetail(product.slug)}>
        <div className="relative aspect-[3/4] overflow-hidden rounded bg-surface-soft">
          <img
            alt={product.primaryImage.alt}
            className="h-full w-full object-cover transition-transform duration-300 motion-safe:group-hover:scale-105 motion-reduce:transition-none"
            height={product.primaryImage.height}
            loading="lazy"
            src={product.primaryImage.src}
            width={product.primaryImage.width}
          />
          <ProductBadges labels={product.badges} />
        </div>
        <div className="space-y-0.5 pt-2 lg:space-y-1 lg:pt-3">
          <p className="text-[11px] uppercase tracking-wider text-text-secondary">{product.brandName}</p>
          <h3 className="line-clamp-2 text-sm font-medium text-text-primary lg:line-clamp-1">{product.name}</h3>
          <PriceDisplay align="left" className="text-sm text-text-secondary lg:font-semibold lg:text-text-primary" compareAtPrice={product.compareAtPrice} price={product.price} />
        </div>
      </Link>
    </article>
  ));

  return (
    <section aria-labelledby="related-products-title" className="space-y-4 pt-10 lg:space-y-8 lg:py-16">
      <header className="flex items-baseline justify-between gap-4">
        <div className="min-w-0">
          <p className="hidden text-xs uppercase tracking-wider text-text-secondary lg:block">Gợi ý trang phục</p>
          <h2 className="text-lg font-semibold text-text-primary lg:mt-0.5 lg:text-2xl lg:font-medium lg:tracking-tight" id="related-products-title">Sản phẩm liên quan</h2>
        </div>
        <Link className="hidden min-h-11 shrink-0 items-center text-xs lg:inline-flex text-text-secondary transition-colors hover:text-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary" to={viewAllHref}>
          Xem tất cả
        </Link>
      </header>
      <div className="grid grid-cols-2 gap-x-3 gap-y-6 lg:grid-cols-4 lg:gap-6">{renderProducts(products.slice(0, 4))}</div>
    </section>
  );
};
