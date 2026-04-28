import { motion, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';

import { routes } from '@/constants/routes';
import { Container } from '@/shared/components/layout/Container';
import { SectionHeader } from '@/shared/components/layout/SectionHeader';
import { motionPresets } from '@/shared/lib/motionPresets';
import type { Category } from '@/shared/types/catalog.types';

type CategoryGridProps = {
  categories: Category[];
};

const extraCategory = {
  slug: 'tailoring',
  name: 'Tailoring',
  itemCount: 45,
  imageUrl: 'https://images.unsplash.com/photo-1506629905607-d9c297d14d6a?auto=format&fit=crop&w=900&q=80',
  imageAlt: 'Tailoring editorial portrait',
};

export const CategoryGrid = ({ categories }: CategoryGridProps) => {
  const reducedMotion = useReducedMotion();
  const categoryItems = [
    ...categories.map((category) => ({
      slug: category.slug,
      name: category.name,
      itemCount: category.itemCount,
      imageUrl: category.imageUrl,
      imageAlt: category.imageAlt,
    })),
    extraCategory,
  ].slice(0, 4);

  return (
    <section className="py-section">
      <Container className="space-y-14">
        <SectionHeader action={<Link className="border-b border-text-primary pb-1 text-[11px] font-bold uppercase tracking-[0.18em] text-text-primary transition-opacity hover:opacity-70" to={routes.products}>View All Categories</Link>} eyebrow="Curated Directory" title="Essential Silhouettes" />
        <motion.div className="grid grid-cols-2 gap-8 lg:grid-cols-4" {...motionPresets.staggerContainer(Boolean(reducedMotion), 0.06)}>
          {categoryItems.map((category) => (
            <motion.article className="group" key={category.slug} {...motionPresets.staggerItem(Boolean(reducedMotion))}>
              <Link to={`${routes.products}?category=${category.slug}`}>
                <div className="overflow-hidden bg-surface-muted">
                  <img
                    alt={category.imageAlt}
                    className="aspect-[4/5] h-full w-full object-cover transition-transform duration-1000 ease-out group-hover:scale-[1.05]"
                    height={1125}
                    src={category.imageUrl}
                    width={900}
                  />
                </div>
                <h3 className="mt-6 font-display text-2xl text-text-primary">{category.name}</h3>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-text-secondary">{category.itemCount} pieces</p>
              </Link>
            </motion.article>
          ))}
        </motion.div>
      </Container>
    </section>
  );
};
