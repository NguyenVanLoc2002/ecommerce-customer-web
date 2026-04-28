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
  <section className="py-section">
    <Container className="space-y-8">
      <SectionHeader
        action={
          <Link className={buttonStyles({ variant: 'secondary' })} to={routes.products}>
            View all products
          </Link>
        }
        description="A high-impact selection that mirrors the strongest editorial moments from the Stitch home screen."
        eyebrow="Featured"
        title="Current lead pieces"
      />
      <ProductGrid products={products} />
    </Container>
  </section>
);
