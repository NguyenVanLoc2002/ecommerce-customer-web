import { Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

import { routePaths } from '@/constants/routes';
import { PriceDisplay } from '@/shared/components/catalog/PriceDisplay';
import { QuantitySelector } from '@/shared/components/catalog/QuantitySelector';
import type { CartItem } from '@/shared/types/commerce.types';
import { formatMoney } from '@/shared/utils/formatMoney';

type CartItemCardProps = {
  item: CartItem;
  onQuantityChange: (quantity: number) => void;
  onRemove: () => void;
  updating?: boolean;
};

export const CartItemCard = ({ item, onQuantityChange, onRemove, updating = false }: CartItemCardProps) => (
  <article className="border-b border-border pb-6">
    <div className="grid gap-5 md:grid-cols-[136px_minmax(0,1fr)]">
      <Link className="overflow-hidden bg-surface-soft" to={routePaths.productDetail(item.productSlug)}>
        <img
          alt={item.primaryImage.alt}
          className="aspect-[4/5] h-full w-full object-cover"
          height={item.primaryImage.height}
          src={item.primaryImage.src}
          width={item.primaryImage.width}
        />
      </Link>
      <div className="flex flex-col gap-5">
        <div className="flex items-start justify-between gap-5">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-outline">{item.brandName}</p>
            <h2 className="mt-3 font-display text-[1.85rem] leading-none text-text-primary">
              <Link to={routePaths.productDetail(item.productSlug)}>{item.productName}</Link>
            </h2>
            <p className="mt-3 text-sm uppercase tracking-[0.1em] text-text-secondary">
              {item.color} / {item.size}
            </p>
            <p className="mt-2 text-xs uppercase tracking-[0.16em] text-outline">{item.sku}</p>
          </div>
          <PriceDisplay compareAtPrice={item.compareAtPrice} price={item.unitPrice} />
        </div>
        <div className="flex flex-col gap-4 border-t border-border pt-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-3">
            <QuantitySelector onChange={onQuantityChange} value={item.quantity} />
            <div className="flex flex-wrap items-center gap-4 text-[11px] uppercase tracking-[0.18em]">
              <button
                aria-label={`Remove ${item.productName} from cart`}
                className="inline-flex items-center gap-2 text-text-secondary transition-colors hover:text-danger"
                onClick={onRemove}
                type="button"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Remove
              </button>
              {updating ? <span className="text-outline">Updating...</span> : null}
            </div>
          </div>
          <div className="space-y-2 text-left md:text-right">
            <p className="text-sm text-text-secondary">Line total {formatMoney(item.subtotal)}</p>
            <p className={`text-[11px] font-bold uppercase tracking-[0.16em] ${item.isStale ? 'text-danger' : 'text-outline'}`}>
              {item.isStale ? `Only ${item.stockAvailable} left, update required` : `${item.stockAvailable} available`}
            </p>
          </div>
        </div>
      </div>
    </div>
  </article>
);
