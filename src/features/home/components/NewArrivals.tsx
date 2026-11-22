import { ProductGrid } from '@/shared/components/catalog/ProductGrid';
import { Container } from '@/shared/components/layout/Container';
import { SectionHeader } from '@/shared/components/layout/SectionHeader';
import { Link } from 'react-router-dom';
import { routes } from '@/constants/routes';
import type { ProductSummary } from '@/shared/types/catalog.types';

type NewArrivalsProps = {
  products: ProductSummary[];
};

export const NewArrivals = ({ products }: NewArrivalsProps) => (
  <section className="py-12 md:py-section">
    <Container className="space-y-8">
      <SectionHeader
        action={<Link className="border-b border-text-primary pb-1 text-sm font-medium text-text-primary" to={routes.products}>Xem tất cả</Link>}
        eyebrow="Vừa cập nhật"
        title="Sản phẩm mới"
      />
      <ProductGrid desktopColumns={4} products={products} />
    </Container>
  </section>
);
