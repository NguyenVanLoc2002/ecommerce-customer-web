import { Link } from 'react-router-dom';

import { routes } from '@/constants/routes';
import { ProductGrid } from '@/shared/components/catalog/ProductGrid';
import type { ProductSummary } from '@/shared/types/catalog.types';

type FeaturedProductsProps = {
  products: ProductSummary[];
};

export const FeaturedProducts = ({ products }: FeaturedProductsProps) => (
  <section className="mx-auto max-w-[1440px] px-5 py-10 lg:border-b lg:border-border lg:px-8 lg:py-12">
    <div className="mb-6 flex items-baseline justify-between gap-3 lg:mb-10">
      <div>
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-text-secondary lg:hidden">Tuyển tập</p>
        <h2 className="text-xl font-semibold tracking-tight text-text-primary lg:text-2xl lg:font-light">Những lựa chọn nổi bật</h2>
      </div>
      <Link className="inline-flex min-h-11 shrink-0 items-center text-sm text-text-secondary underline underline-offset-4 hover:text-text-primary" to={routes.products}>
        Xem tất cả
      </Link>
    </div>
    <ProductGrid appearance="home" products={products} />
  </section>
);
