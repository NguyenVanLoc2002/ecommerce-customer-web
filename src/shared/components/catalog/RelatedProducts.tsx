import { ProductGrid } from '@/shared/components/catalog/ProductGrid';
import type { ProductSummary } from '@/shared/types/catalog.types';

type RelatedProductsProps = {
  products: ProductSummary[];
};

export const RelatedProducts = ({ products }: RelatedProductsProps) => (
  <section className="space-y-10">
    <header>
      <h2 className="text-2xl font-semibold text-text-primary">Sản phẩm cùng danh mục</h2>
      <div className="mt-3 h-px w-full bg-border" />
    </header>
    <ProductGrid products={products} />
  </section>
);
