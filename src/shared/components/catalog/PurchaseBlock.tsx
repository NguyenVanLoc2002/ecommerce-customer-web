import { CheckCircle2, ChevronDown, CircleAlert, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';

import { routes } from '@/constants/routes';

import { PriceDisplay } from '@/shared/components/catalog/PriceDisplay';
import { SizeGuide } from '@/shared/components/catalog/SizeGuide';
import { QuantitySelector } from '@/shared/components/catalog/QuantitySelector';
import { VariantSelector } from '@/shared/components/catalog/VariantSelector';
import { Button } from '@/shared/components/ui/Button';
import type { VariantAttributeGroup, VariantSelectionResult } from '@/features/products/utils/variantSelection';
import type { ProductDetail, ProductReturnPolicy } from '@/shared/types/catalog.types';

type PurchaseBlockProps = {
  addToCartDisabled: boolean;
  addToCartLabel: string;
  addToCartLoading: boolean;
  selection: VariantSelectionResult;
  groups: VariantAttributeGroup[];
  selectedValues: Record<string, string>;
  currentPrice?: number;
  compareAtPrice?: number;
  product: ProductDetail;
  quantity: number;
  addError?: string;
  addSucceeded: boolean;
  onSelectValue: (attributeId: string, valueId: string) => void;
  onAddToCart: () => void;
  onQuantityChange: (value: number) => void;
};

const returnPolicyDescriptions: Record<ProductReturnPolicy, string> = {
  STANDARD: 'Có thể gửi yêu cầu đổi trả theo điều kiện áp dụng cho đơn hàng.',
  SEALED_ONLY: 'Yêu cầu đổi trả theo nhu cầu chỉ áp dụng khi sản phẩm còn nguyên niêm phong.',
  REVIEW_REQUIRED: 'Yêu cầu đổi trả theo nhu cầu cần được xem xét.',
  CUSTOMIZED_FINAL_SALE: 'Sản phẩm được cá nhân hóa không áp dụng đổi trả theo nhu cầu.',
};

const detailSummaryClass = 'flex min-h-12 cursor-pointer list-none items-center justify-between gap-4 px-4 text-sm font-medium text-text-primary lg:min-h-11 lg:px-0 [&::-webkit-details-marker]:hidden';
const detailIconClass = 'size-5 shrink-0 transition-transform group-open:rotate-180 motion-reduce:transition-none';

export const PurchaseBlock = ({
  addError,
  addSucceeded,
  addToCartDisabled,
  addToCartLabel,
  addToCartLoading,
  compareAtPrice,
  currentPrice,
  groups,
  onAddToCart,
  onQuantityChange,
  onSelectValue,
  product,
  quantity,
  selectedValues,
  selection,
}: PurchaseBlockProps) => {
  const hasDescription = Boolean(product.description && product.description !== product.subtitle);
  const hasDetails = hasDescription || product.materials.length > 0 || product.care.length > 0;
  const returnPolicyDescription = product.returnPolicy ? returnPolicyDescriptions[product.returnPolicy] : undefined;

  return (
    <aside className="min-w-0">
      <header className="space-y-2 lg:space-y-1.5">
        <p className="text-xs font-medium uppercase tracking-widest text-text-secondary">{product.brandName}</p>
        <h1 className="break-words text-2xl font-semibold leading-tight text-text-primary lg:text-3xl lg:font-medium lg:leading-snug lg:tracking-tight">{product.name}</h1>
        {currentPrice !== undefined ? (
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 pt-1 lg:gap-x-3">
            {selection.status !== 'active' && selection.status !== 'inactive' ? <span className="text-xs text-text-secondary">Giá từ</span> : null}
            <PriceDisplay align="left" className="text-lg font-semibold text-text-primary lg:text-2xl" compareAtPrice={compareAtPrice} price={currentPrice} />
          </div>
        ) : <p className="text-sm text-text-secondary">Chọn phân loại để xem giá.</p>}
        {product.subtitle ? <p className="pt-2 text-base leading-relaxed text-text-secondary lg:pt-2.5 lg:text-sm">{product.subtitle}</p> : null}
      </header>

      <div className="mt-5 lg:mt-6 lg:border-t lg:border-border/60 lg:pt-6">
        <VariantSelector groups={groups} onSelectValue={onSelectValue} selectedValues={selectedValues} selection={selection} sizeGuideAction={product.sizeGuide ? <SizeGuide guide={product.sizeGuide} key={product.sizeGuide.id} /> : undefined} variants={product.variants} />

        <div className="mt-5 flex flex-col gap-3 pt-1 lg:mt-8 lg:flex-row lg:pt-0">
          <div className="flex shrink-0 items-center justify-between">
            <p className="text-sm font-medium text-text-primary lg:sr-only" id="product-quantity-label">Số lượng</p>
            <QuantitySelector appearance="product" label="số lượng" labelledBy="product-quantity-label" onChange={onQuantityChange} value={quantity} />
          </div>
          <Button
            className="!h-auto !min-h-12 min-w-0 flex-1 !whitespace-normal !rounded !px-3 !py-2 !text-base !leading-snug !tracking-normal lg:!min-h-[52px] lg:!rounded-sm lg:!text-sm lg:!tracking-wide"
            disabled={addToCartDisabled}
            fullWidth
            loading={addToCartLoading}
            onClick={onAddToCart}
          >
            {!addToCartLoading ? <ShoppingBag aria-hidden="true" className="hidden size-[19px] shrink-0 lg:block" /> : null}
            {addToCartLabel}
          </Button>
        </div>
        {addSucceeded ? (
          <div className="mt-3 flex flex-wrap items-center justify-between gap-x-3 rounded bg-brand-subtle px-3.5 py-1 text-sm text-text-primary">
            <p className="flex items-center gap-2" role="status"><CheckCircle2 aria-hidden="true" className="size-5 shrink-0" /> Đã thêm vào giỏ</p>
            <Link className="inline-flex min-h-11 items-center font-semibold underline underline-offset-4" to={routes.cart}>Xem giỏ hàng</Link>
          </div>
        ) : null}
        {addError ? (
          <p className="mt-3 flex items-start gap-2.5 rounded bg-danger/10 p-3.5 text-sm leading-snug text-danger" role="alert">
            <CircleAlert aria-hidden="true" className="size-5 shrink-0" /> {addError}
          </p>
        ) : null}
      </div>

      <div className="mt-6 space-y-2 lg:mt-10 lg:space-y-0 lg:divide-y lg:divide-border/60">
        {hasDetails ? (
          <details className="group rounded bg-surface-muted lg:rounded-none lg:bg-transparent lg:py-1.5" open>
            <summary className={detailSummaryClass}>
              <span>Chi tiết sản phẩm &amp; Chất liệu</span>
              <ChevronDown aria-hidden="true" className={detailIconClass} strokeWidth={1.5} />
            </summary>
            <div className="space-y-1.5 whitespace-pre-line px-4 pb-4 text-sm leading-relaxed text-text-secondary lg:px-0 lg:pb-2 lg:text-xs">
              {hasDescription ? <p>{product.description}</p> : null}
              {product.materials.length > 0 ? <ul className="list-disc space-y-1.5 pl-4">{product.materials.map((material) => <li key={material}>{material}</li>)}</ul> : null}
              {product.care.length > 0 ? <ul className="list-disc space-y-1.5 pl-4">{product.care.map((instruction) => <li key={instruction}>{instruction}</li>)}</ul> : null}
            </div>
          </details>
        ) : null}
        <details className="group rounded bg-surface-muted lg:rounded-none lg:bg-transparent lg:py-1.5">
          <summary className={detailSummaryClass}>
            <span>{returnPolicyDescription ? 'Chính sách đổi trả & Giao nhận' : 'Thông tin giao nhận'}</span>
            <ChevronDown aria-hidden="true" className={detailIconClass} strokeWidth={1.5} />
          </summary>
          <div className="space-y-2 px-4 pb-4 text-sm leading-relaxed text-text-secondary lg:px-0 lg:pb-2 lg:text-xs">
            <p>Phí giao hàng được tính tại bước thanh toán sau khi bạn chọn địa chỉ nhận hàng và phương thức vận chuyển.</p>
            {returnPolicyDescription ? <p>{returnPolicyDescription} Bạn vẫn có thể gửi yêu cầu hỗ trợ nếu sản phẩm bị lỗi, thiếu hàng hoặc giao sai.</p> : null}
          </div>
        </details>
      </div>
    </aside>
  );
};
