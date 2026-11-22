import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

import { routePaths, routes } from '@/constants/routes';
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
      <header className="flex items-end justify-between gap-4">
        <div className="min-w-0">
          <p className="hidden pb-1 text-[10px] font-medium uppercase tracking-[0.14em] text-text-secondary md:block">Gợi ý trang phục</p>
          <h2 className="text-lg font-medium tracking-tight text-text-primary md:text-xl" id="related-products-title">Sản phẩm cùng bộ sưu tập</h2>
        </div>
        <Link className="inline-flex min-h-11 shrink-0 items-center gap-1 text-xs text-text-secondary transition-colors hover:text-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary" to={viewAllHref}>
          Xem tất cả
          <ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5" />
        </Link>
      </header>
      <div className="grid grid-cols-2 gap-x-3 gap-y-6 md:hidden">{renderProducts(products)}</div>
      <div className="hidden grid-cols-4 gap-3 md:grid">{renderProducts(products.slice(0, 4))}</div>
    </section>
  );
};
