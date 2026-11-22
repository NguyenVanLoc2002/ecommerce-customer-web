import { Link } from 'react-router-dom';

import { routes } from '@/constants/routes';
import { ProductGrid } from '@/shared/components/catalog/ProductGrid';
import { Container } from '@/shared/components/layout/Container';
import { SectionHeader } from '@/shared/components/layout/SectionHeader';
import { buttonStyles } from '@/shared/components/ui/buttonStyles';
import type { ProductSummary } from '@/shared/types/catalog.types';

type FeaturedProductsProps = {
  products: ProductSummary[];
};

export const FeaturedProducts = ({ products }: FeaturedProductsProps) => (
  <section className="py-12 md:py-section">
    <Container className="space-y-8">
      <SectionHeader
        action={
          <Link className={`${buttonStyles({ variant: 'secondary' })} min-h-11`} to={routes.products}>
            Xem tất cả
          </Link>
        }
        eyebrow="Tuyển tập"
        title="Những lựa chọn nổi bật"
      />
      <ProductGrid desktopColumns={4} products={products} />
    </Container>
  </section>
);
