import { Link } from 'react-router-dom';

import { routes } from '@/constants/routes';
import { ProductGrid } from '@/shared/components/catalog/ProductGrid';
import { Container } from '@/shared/components/layout/Container';
import type { ProductSummary } from '@/shared/types/catalog.types';

type FeaturedProductsProps = {
  products: ProductSummary[];
};

export const FeaturedProducts = ({ products }: FeaturedProductsProps) => (
  <section className="mx-auto max-w-[1440px] border-b border-border px-5 py-16 md:px-8 md:py-20">
    <Container className="space-y-8 !px-0">
      <div className="mb-10 flex items-baseline justify-between gap-6">
        <h2 className="text-2xl font-light tracking-tight text-text-primary">Những lựa chọn nổi bật</h2>
        <Link className="min-h-11 shrink-0 text-sm text-text-secondary underline underline-offset-4 transition-colors hover:text-text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary" to={routes.products}>
          Xem tất cả
        </Link>
      </div>
      <ProductGrid desktopColumns={4} products={products} />
    </Container>
  </section>
);
