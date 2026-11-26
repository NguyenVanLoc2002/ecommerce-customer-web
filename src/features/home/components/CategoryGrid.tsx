import { Link } from 'react-router-dom';

import { routes } from '@/constants/routes';
import { EmptyState } from '@/shared/components/feedback/EmptyState';
import type { Category } from '@/shared/types/catalog.types';

type CategoryGridProps = {
  categories: Category[];
};

export const CategoryGrid = ({ categories }: CategoryGridProps) => (
  <section className="bg-[rgb(var(--discovery-panel))] lg:bg-canvas">
    <div className="mx-auto max-w-[1440px] px-5 py-8 lg:border-b lg:border-border lg:px-8 lg:py-12">
      <h2 className="mb-5 text-xl font-semibold tracking-tight text-text-primary lg:mb-10 lg:text-2xl lg:font-light">
        Tìm theo phong cách của bạn
      </h2>
      {categories.length === 0 ? (
        <EmptyState
          action={<Link className="underline underline-offset-4" to={routes.products}>Xem sản phẩm</Link>}
          description="Danh mục sẽ xuất hiện tại đây khi cửa hàng có dữ liệu."
          title="Chưa có danh mục"
        />
      ) : (
        <div className="grid gap-5 md:grid-cols-3 lg:gap-6">
          {categories.slice(0, 3).map((category) => (
            <article className="min-w-0" key={category.id}>
              <Link
                aria-label={`Khám phá danh mục ${category.name}`}
                className="group block overflow-hidden rounded bg-canvas focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 lg:rounded-none"
                to={`${routes.products}?category=${encodeURIComponent(category.slug)}`}
              >
                <div className="aspect-[4/3] overflow-hidden bg-surface-soft lg:aspect-[3/4] lg:border lg:border-border">
                  <img
                    alt=""
                    className="h-full w-full object-cover object-top motion-safe:transition-transform motion-safe:duration-500 motion-safe:group-hover:scale-[1.02] lg:object-center"
                    height={1125}
                    loading="lazy"
                    onError={(event) => { event.currentTarget.hidden = true; }}
                    src={category.imageUrl}
                    width={900}
                  />
                </div>
                <div className="flex items-center justify-between gap-3 p-4 lg:px-0 lg:pb-0">
                  <div className="min-w-0">
                    <p className="text-xs font-medium uppercase tracking-widest text-text-secondary lg:hidden">Bộ sưu tập</p>
                    <h3 className="break-words text-base font-semibold text-text-primary lg:text-lg lg:font-normal">{category.name}</h3>
                  </div>
                  <span className="shrink-0 text-sm font-medium text-text-primary group-hover:underline lg:font-normal lg:text-text-secondary">
                    Khám phá <span aria-hidden="true">→</span>
                  </span>
                </div>
              </Link>
            </article>
          ))}
        </div>
      )}
    </div>
  </section>
);
