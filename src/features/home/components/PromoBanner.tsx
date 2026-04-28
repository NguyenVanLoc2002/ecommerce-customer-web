import { Link } from 'react-router-dom';

import { routes } from '@/constants/routes';
import { Container } from '@/shared/components/layout/Container';
import { buttonStyles } from '@/shared/components/ui/buttonStyles';
import type { ProductSummary } from '@/shared/types/catalog.types';

type PromoBannerProps = {
  products: ProductSummary[];
};

export const PromoBanner = ({ products }: PromoBannerProps) => {
  const primary = products[0];
  const secondary = products[1] ?? products[0];

  return (
    <section className="bg-surface-muted py-24 md:py-32">
      <Container>
        <div className="grid items-center gap-14 lg:grid-cols-12 lg:gap-16">
          <div className="relative z-10 lg:col-span-5">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-text-secondary">The Archive</p>
            <h2 className="mt-4 font-display text-[3rem] italic leading-none text-text-primary md:text-[3.5rem]">L&apos;Artiste No. 4</h2>
            <p className="mt-8 max-w-lg text-lg leading-8 text-text-secondary">
              A limited exploration of texture and form. Each piece is meticulously numbered and hand-finished in our atelier.
            </p>
            <div className="mt-10">
              <Link className={buttonStyles({ size: 'lg' })} to={`${routes.products}?sort=featured`}>
                View Collection
              </Link>
            </div>
          </div>
          <div className="relative h-[560px] lg:col-span-7">
            {primary ? (
              <div className="editorial-shadow absolute right-0 top-0 h-full w-[82%] overflow-hidden bg-surface">
                <img
                  alt={primary.primaryImage.alt}
                  className="h-full w-full object-cover"
                  height={primary.primaryImage.height}
                  loading="lazy"
                  src={primary.primaryImage.src}
                  width={primary.primaryImage.width}
                />
              </div>
            ) : null}
            {secondary ? (
              <div className="editorial-shadow absolute bottom-10 left-0 hidden h-[65%] w-[48%] overflow-hidden bg-surface md:block">
                <img
                  alt={secondary.primaryImage.alt}
                  className="h-full w-full object-cover"
                  height={secondary.primaryImage.height}
                  loading="lazy"
                  src={secondary.primaryImage.src}
                  width={secondary.primaryImage.width}
                />
              </div>
            ) : null}
          </div>
        </div>
      </Container>
    </section>
  );
};
