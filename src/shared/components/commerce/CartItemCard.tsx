import { Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

import { routePaths } from '@/constants/routes';
import { QuantitySelector } from '@/shared/components/catalog/QuantitySelector';
import type { CartItem } from '@/shared/types/commerce.types';
import { formatVnd } from '@/shared/utils/formatVnd';

type CartItemCardProps = {
  item: CartItem;
  onQuantityChange: (quantity: number) => void;
  onRemove: () => void;
  updating?: boolean;
};

export const CartItemCard = ({ item, onQuantityChange, onRemove, updating = false }: CartItemCardProps) => {
  const variantLabel = item.variantName || (item.sku ? `SKU ${item.sku}` : item.variantId);

  return (
    <article aria-busy={updating} className="relative grid min-h-[180px] grid-cols-[96px_minmax(0,1fr)] gap-4 rounded-feature border border-border/70 bg-surface px-3 py-3 shadow-subtle sm:min-h-0 sm:grid-cols-[120px_minmax(0,1fr)] sm:gap-5 sm:px-4 sm:py-4 md:grid-cols-[144px_minmax(0,1fr)] md:gap-6 md:px-6 md:py-6">
      <Link
        aria-label={`Xem ${item.productName}`}
        className="block h-fit overflow-hidden bg-surface-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-brand-primary"
        to={routePaths.productDetail(item.productSlug)}
      >
        <img
          alt={item.primaryImage.alt}
          className="aspect-[3/4] w-full object-cover"
          height={item.primaryImage.height}
          loading="lazy"
          src={item.primaryImage.src}
          width={item.primaryImage.width}
        />
      </Link>

      <div className="flex min-w-0 flex-col justify-between gap-3 sm:gap-4 md:gap-5">
        <div className="flex min-w-0 items-start justify-between gap-3 sm:gap-5">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text-secondary sm:text-sm">{item.brandName}</p>
            <h2 className="mt-2 break-words text-base font-medium leading-snug text-text-primary sm:text-lg md:text-xl">
              <Link className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary" to={routePaths.productDetail(item.productSlug)}>
                {item.productName}
              </Link>
            </h2>
            <p className="mt-2 break-words text-sm leading-6 text-text-secondary sm:text-base">
              <span className="hidden font-medium text-text-primary sm:inline">Biến thể: </span>{variantLabel}
            </p>
            {item.isStale ? (
              <p className="mt-3 inline-flex min-h-11 items-center border border-danger/30 bg-danger/5 px-3 py-2 text-sm leading-5 text-danger" role="status">
                Còn {item.stockAvailable} sản phẩm. Hãy giảm số lượng để tiếp tục.
              </p>
            ) : null}
          </div>
          <div className="flex shrink-0 items-start gap-4">
            <div className="hidden text-right sm:block">
              <p className="whitespace-nowrap text-lg font-semibold text-text-primary md:text-xl">{formatVnd(item.unitPrice)}</p>
              {item.compareAtPrice ? <p className="mt-1 text-sm text-text-secondary line-through">{formatVnd(item.compareAtPrice)}</p> : null}
            </div>
            <button
              aria-label={`Xóa ${item.productName} khỏi giỏ hàng`}
              className="absolute right-3 top-3 inline-flex h-11 w-11 shrink-0 items-center justify-center text-text-secondary transition-colors hover:text-danger disabled:cursor-not-allowed disabled:opacity-50 sm:hidden"
              disabled={updating}
              onClick={onRemove}
              type="button"
            >
              <Trash2 aria-hidden="true" className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 sm:hidden">
          <p className="min-w-0 text-base font-semibold text-text-primary">{formatVnd(item.unitPrice)}</p>
          <QuantitySelector
            compact
            disabled={updating}
            label={`quantity for ${item.productName}`}
            onChange={onQuantityChange}
            value={item.quantity}
          />
        </div>

        <div className="hidden border-t border-border pt-4 sm:flex sm:items-end sm:justify-between">
          <div className="flex flex-wrap items-center justify-between gap-x-5 gap-y-3 sm:justify-start">
            <QuantitySelector
              disabled={updating}
              label={`quantity for ${item.productName}`}
              onChange={onQuantityChange}
              value={item.quantity}
            />
            <button
              aria-label={`Xóa ${item.productName} khỏi giỏ hàng`}
              className="hidden min-h-11 items-center gap-2 text-sm text-text-secondary underline decoration-border underline-offset-4 transition-colors hover:text-danger sm:inline-flex disabled:cursor-not-allowed disabled:opacity-50"
              disabled={updating}
              onClick={onRemove}
              type="button"
            >
              <Trash2 aria-hidden="true" className="h-4 w-4" />
              Xóa
            </button>
          </div>
          <div className="hidden text-right sm:block">
            <p className="text-xs text-text-secondary">Thành tiền</p>
            <p className="mt-1 font-semibold text-text-primary">{formatVnd(item.subtotal)}</p>
          </div>
        </div>
        {updating ? <span className="sr-only" role="status">Đang cập nhật số lượng</span> : null}
      </div>
    </article>
  );
};
