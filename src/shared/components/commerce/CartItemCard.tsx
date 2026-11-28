import { Archive, CircleCheck, Clock3, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

import { routePaths } from '@/constants/routes';
import { QuantitySelector } from '@/shared/components/catalog/QuantitySelector';
import type { CartItem } from '@/shared/types/commerce.types';
import { cn } from '@/shared/utils/cn';
import { formatVnd } from '@/shared/utils/formatVnd';

type CartItemCardProps = {
  item: CartItem;
  onQuantityChange: (quantity: number) => void;
  onRemove: () => void;
  updating?: boolean;
};

export const CartItemCard = ({ item, onQuantityChange, onRemove, updating = false }: CartItemCardProps) => {
  const variantLabel = item.variantName || (item.sku ? `SKU ${item.sku}` : item.variantId);
  const productPath = routePaths.productDetail(item.productSlug);
  const hasStock = Number.isFinite(item.stockAvailable);
  const lowStock = hasStock && item.stockAvailable <= 2;
  const StockIcon = item.isStale || lowStock ? Clock3 : CircleCheck;

  return (
    <article aria-busy={updating} className="relative grid min-w-0 grid-cols-[min(25vw,96px)_minmax(0,1fr)] items-start gap-3 rounded-feature bg-surface p-3.5 shadow-subtle sm:grid-cols-[120px_minmax(0,1fr)] sm:gap-6 sm:rounded-chip sm:p-6 xl:grid-cols-[144px_minmax(0,1fr)]">
      <Link aria-label={`Xem ${item.productName}`} className="overflow-hidden rounded-[4px] bg-surface-muted sm:rounded-chip" to={productPath}>
        <img
          alt={item.primaryImage.alt}
          className="aspect-[3/4] w-full object-cover"
          height={item.primaryImage.height}
          loading="lazy"
          src={item.primaryImage.src}
          width={item.primaryImage.width}
        />
      </Link>

      <div className="grid min-w-0 gap-y-2 sm:min-h-full sm:grid-cols-[minmax(0,1fr)_auto] sm:gap-x-4">
        <div className="min-w-0 pr-10 sm:pr-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-text-secondary">{item.brandName}</p>
          <h2 className="mt-1 text-base font-semibold leading-snug text-text-primary [overflow-wrap:anywhere] sm:mt-2 sm:text-lg sm:font-medium">
            <Link className="hover:underline" to={productPath}>{item.productName}</Link>
          </h2>
          <p className="mt-1 text-xs leading-5 text-text-secondary [overflow-wrap:anywhere] sm:text-[13px]">
            <span className="hidden sm:inline">Phân loại: </span>{variantLabel}
          </p>
        </div>

        {hasStock ? (
          <p
            className={cn(
              'flex w-fit max-w-full items-center gap-2 rounded-[4px] px-2 py-1 text-xs leading-4 sm:col-start-1 sm:self-start sm:rounded-chip sm:px-3 sm:py-1.5',
              item.isStale || lowStock
                ? 'bg-danger/10 text-danger'
                : 'bg-brand-subtle text-text-secondary',
              !item.isStale && lowStock && 'sm:bg-brand-subtle sm:text-text-secondary',
            )}
            role={item.isStale ? 'status' : undefined}
          >
            {!item.isStale && lowStock ? <Archive aria-hidden="true" className="hidden size-4 shrink-0 sm:block" /> : null}
            <StockIcon aria-hidden="true" className={cn('size-4 shrink-0', !item.isStale && lowStock && 'sm:hidden')} />
            {item.isStale
              ? item.stockAvailable === 0 ? 'Sản phẩm đã hết hàng.' : `Còn ${item.stockAvailable} sản phẩm. Hãy giảm số lượng để tiếp tục.`
              : lowStock ? `Kho chỉ còn ${item.stockAvailable} sản phẩm có sẵn` : 'Tình trạng: Còn hàng'}
          </p>
        ) : null}

        {item.isStale ? (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 sm:col-start-1">
            {item.stockAvailable > 0 ? (
              <button
                className="min-h-11 rounded-button bg-surface-soft px-3 text-xs font-semibold hover:bg-surface-muted disabled:opacity-50"
                disabled={updating}
                onClick={() => onQuantityChange(item.stockAvailable)}
                type="button"
              >
                Giảm còn {item.stockAvailable}
              </button>
            ) : null}
            <Link className="inline-flex min-h-11 items-center text-xs font-medium underline underline-offset-4" to={productPath}>
              Chọn biến thể khác
            </Link>
          </div>
        ) : null}
        <div className="flex min-w-0 flex-wrap items-center justify-between gap-x-1 gap-y-2 sm:contents">
          <div className="min-w-0 sm:col-start-2 sm:row-start-1 sm:text-right">
            <p className="text-sm font-semibold text-text-primary sm:text-base">{formatVnd(item.unitPrice)}</p>
            {item.compareAtPrice ? <p className="mt-1 text-xs text-text-secondary line-through">{formatVnd(item.compareAtPrice)}</p> : null}
            {item.quantity > 1 ? <p className="mt-1 text-xs text-text-secondary">Thành tiền: {formatVnd(item.subtotal)}</p> : null}
          </div>
          <div className="flex min-w-0 items-center gap-3 sm:col-span-2 sm:mt-3 sm:self-end sm:border-t sm:border-border/60 sm:pt-4">
            <span className="hidden text-[13px] text-text-secondary sm:inline">Số lượng:</span>
            <QuantitySelector
              disabled={updating || item.isStale}
              max={hasStock ? item.stockAvailable : undefined}
              label={`quantity for ${item.productName}`}
              onChange={onQuantityChange}
              value={item.quantity}
              variant="cart"
            />
            <button
              aria-label={`Xóa ${item.productName} khỏi giỏ hàng`}
              className="absolute right-2 top-2 inline-flex min-h-11 min-w-11 items-center justify-center gap-2 text-text-secondary transition-colors hover:text-danger disabled:opacity-50 sm:static sm:ml-auto sm:px-1"
              disabled={updating}
              onClick={onRemove}
              type="button"
            >
              <Trash2 aria-hidden="true" className="size-4" />
              <span className="hidden text-[13px] underline decoration-border underline-offset-4 sm:inline">Xóa</span>
            </button>
          </div>
        </div>
        {updating ? <span className="sr-only" role="status">Đang cập nhật số lượng</span> : null}
      </div>
    </article>
  );
};
