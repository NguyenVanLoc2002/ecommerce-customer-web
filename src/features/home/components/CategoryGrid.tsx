import { motion, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';

import { routes } from '@/constants/routes';
import { Container } from '@/shared/components/layout/Container';
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
      <section className="mx-auto max-w-[1440px] border-b border-border px-5 py-8 md:px-8 md:py-12">
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
    <section className="mx-auto max-w-[1440px] border-b border-border px-5 py-8 md:px-8 md:py-12">
      <div className="mb-8">
        <h2 className="text-2xl font-light tracking-tight text-text-primary">Tìm theo phong cách của bạn</h2>
      </div>
      <motion.div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-6" {...motionPresets.staggerContainer(Boolean(reducedMotion), 0.06)}>
          {categoryItems.map((category, index) => (
            <motion.article className={`group flex flex-col ${index === 2 ? 'col-span-2 md:col-span-1' : ''}`} key={category.slug} {...motionPresets.staggerItem(Boolean(reducedMotion))}>
              <Link aria-label={`Khám phá danh mục ${category.name}`} className="block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-primary" to={`${routes.products}?category=${encodeURIComponent(category.slug)}`}>
                <div className={`overflow-hidden border border-border bg-surface-muted ${index === 2 ? 'aspect-[2/1] md:aspect-[3/4]' : 'aspect-[3/4]'}`}>
                  <img
                    alt={category.imageAlt}
                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                    height={1125}
                    loading="lazy"
                    src={category.imageUrl}
                    width={900}
                  />
                </div>
              </Link>
              <div className="flex items-center justify-between gap-3 pt-4">
                <h3 className="text-lg font-normal text-text-primary">{category.name}</h3>
                <Link className="inline-flex min-h-11 items-center gap-1 text-sm text-text-secondary transition-colors hover:text-text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary" to={`${routes.products}?category=${encodeURIComponent(category.slug)}`}>
                  <span className="hidden md:inline">Khám phá</span><span aria-hidden="true">→</span>
                </Link>
              </div>
            </motion.article>
          ))}
      </motion.div>
    </section>
  );
};
