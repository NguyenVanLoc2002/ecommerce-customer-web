import { Link } from 'react-router-dom';

import { routePaths } from '@/constants/routes';
import { ProductBadges } from '@/shared/components/catalog/ProductBadges';
import type { ProductSummary } from '@/shared/types/catalog.types';
import { formatVnd } from '@/shared/utils/formatVnd';

type ProductCardProps = {
  product: ProductSummary;
  appearance: 'home' | 'list';
};

export const ProductCard = ({ product, appearance }: ProductCardProps) => {
  const Heading = appearance === 'home' ? 'h3' : 'h2';

  return (
    <article className="min-w-0">
      <Link className="group block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4" to={routePaths.productDetail(product.slug)}>
        <div className={`relative aspect-[3/4] overflow-hidden rounded-sm bg-surface-soft ${appearance === 'home' ? 'lg:rounded-none lg:border lg:border-border' : 'lg:rounded'}`}>
          <img
            alt={product.primaryImage.alt}
            className="h-full w-full object-cover object-top motion-safe:transition-transform motion-safe:duration-500 motion-safe:group-hover:scale-[1.02] lg:object-center"
            height={product.primaryImage.height}
            loading="lazy"
            onError={(event) => { event.currentTarget.hidden = true; }}
            src={product.primaryImage.src}
            width={product.primaryImage.width}
          />
          {appearance === 'list' ? <ProductBadges labels={product.badges} /> : null}
        </div>
        <div className={`space-y-1 pt-2.5 ${appearance === 'home' ? 'lg:pt-4' : 'lg:pt-3.5'}`}>
          {product.brandName ? <p className="break-words text-[11px] uppercase tracking-wider text-text-secondary lg:text-[13px]">{product.brandName}</p> : null}
          <Heading className={`break-words text-sm leading-snug text-text-primary transition-colors group-hover:text-brand-primary lg:text-base lg:font-normal ${appearance === 'list' ? 'font-medium' : 'font-normal'}`}>
            {product.name}
          </Heading>
          <p className="break-words text-[15px] font-medium text-text-primary">{formatVnd(product.price)}</p>
        </div>
      </Link>
    </article>
  );
};
