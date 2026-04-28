import { ProductGrid } from '@/shared/components/catalog/ProductGrid';
import { Container } from '@/shared/components/layout/Container';
import type { ProductSummary } from '@/shared/types/catalog.types';

type NewArrivalsProps = {
  products: ProductSummary[];
};

export const NewArrivals = ({ products }: NewArrivalsProps) => (
  <section className="py-section">
    <Container>
      <div className="mb-20 text-center">
        <h2 className="font-display text-[3rem] leading-none text-text-primary md:text-[3.5rem]">New Arrivals</h2>
        <div className="mx-auto mt-5 h-px w-20 bg-border" />
        <p className="mt-5 text-[11px] font-bold uppercase tracking-[0.22em] text-text-secondary">
          The latest additions to our permanent collection
        </p>
      </div>
      <ProductGrid products={products} />
    </Container>
  </section>
);
