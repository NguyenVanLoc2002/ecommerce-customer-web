import { motion, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';

import { routes } from '@/constants/routes';
import { Container } from '@/shared/components/layout/Container';
import { SectionHeader } from '@/shared/components/layout/SectionHeader';
import { EmptyState } from '@/shared/components/feedback/EmptyState';
import { motionPresets } from '@/shared/lib/motionPresets';
import type { Category } from '@/shared/types/catalog.types';

type CategoryGridProps = {
  categories: Category[];
};

export const CategoryGrid = ({ categories }: CategoryGridProps) => {
  const reducedMotion = useReducedMotion();
  const categoryItems = categories
    .map((category) => ({
      slug: category.slug,
      name: category.name,
      itemCount: category.itemCount,
      imageUrl: category.imageUrl,
      imageAlt: category.imageAlt,
    }))
    .slice(0, 3);

  if (categoryItems.length === 0) {
    return (
      <section className="py-12 md:py-section">
        <Container>
          <EmptyState
            action={<Link className="underline underline-offset-4" to={routes.products}>Xem sản phẩm</Link>}
            description="Danh mục sẽ xuất hiện tại đây khi cửa hàng có dữ liệu."
            title="Chưa có danh mục"
          />
        </Container>
      </section>
    );
  }

  return (
    <section className="py-12 md:py-section">
      <Container className="space-y-8 md:space-y-12">
        <SectionHeader action={<Link className="border-b border-text-primary pb-1 text-sm font-medium text-text-primary transition-opacity hover:opacity-70" to={routes.products}>Xem tất cả</Link>} eyebrow="Bộ sưu tập" title="Tìm theo phong cách của bạn" />
        <motion.div className="grid grid-cols-2 gap-3 lg:grid-cols-3 lg:gap-4" {...motionPresets.staggerContainer(Boolean(reducedMotion), 0.06)}>
          {categoryItems.map((category, index) => (
            <motion.article className={`group ${index === 2 ? 'col-span-2 lg:col-span-1' : ''}`} key={category.slug} {...motionPresets.staggerItem(Boolean(reducedMotion))}>
              <Link aria-label={`Khám phá danh mục ${category.name}`} className="block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-primary" to={`${routes.products}?category=${encodeURIComponent(category.slug)}`}>
                <div className="overflow-hidden bg-surface-muted">
                  <img
                    alt={category.imageAlt}
                    className={`h-full w-full object-cover transition-transform duration-1000 ease-out group-hover:scale-[1.05] ${index === 2 ? 'aspect-[2/1] lg:aspect-[4/5]' : 'aspect-[4/5]'}`}
                    height={1125}
                    loading="lazy"
                    src={category.imageUrl}
                    width={900}
                  />
                </div>
                <div className="flex items-center justify-between gap-3 bg-surface px-4 py-4 md:px-5">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.16em] text-text-secondary">Bộ sưu tập</p>
                    <h3 className="mt-1 text-lg font-semibold text-text-primary">{category.name}</h3>
                  </div>
                  <span aria-hidden="true" className="shrink-0 text-sm font-medium text-text-primary">↗</span>
                </div>
              </Link>
            </motion.article>
          ))}
        </motion.div>
      </Container>
    </section>
  );
};
