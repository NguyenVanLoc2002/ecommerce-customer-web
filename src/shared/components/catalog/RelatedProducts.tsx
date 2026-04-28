import { ProductGrid } from '@/shared/components/catalog/ProductGrid';
import type { ProductSummary } from '@/shared/types/catalog.types';

type RelatedProductsProps = {
  products: ProductSummary[];
};

export const RelatedProducts = ({ products }: RelatedProductsProps) => (
  <section className="space-y-10">
    <header>
      <h3 className="font-display text-[2rem] text-text-primary">Complete the Look</h3>
      <div className="mt-3 h-px w-full bg-border" />
    </header>
    <ProductGrid products={products} />
  </section>
);
