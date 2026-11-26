import { Link } from 'react-router-dom';

import { routes } from '@/constants/routes';
import { ProductGrid } from '@/shared/components/catalog/ProductGrid';
import type { ProductSummary } from '@/shared/types/catalog.types';

type NewArrivalsProps = {
  products: ProductSummary[];
};

export const NewArrivals = ({ products }: NewArrivalsProps) => (
  <section className="mx-auto max-w-[1440px] px-5 py-8 lg:px-8 lg:py-12">
    <div className="mb-6 flex items-baseline justify-between gap-3 lg:mb-10">
      <h2 className="text-xl font-semibold tracking-tight text-text-primary lg:text-2xl lg:font-light">Sản phẩm mới</h2>
      <Link className="inline-flex min-h-11 shrink-0 items-center text-sm text-text-secondary underline underline-offset-4 hover:text-text-primary" to={routes.products}>
        Xem tất cả
      </Link>
    </div>
    <ProductGrid appearance="home" products={products} />
  </section>
);
