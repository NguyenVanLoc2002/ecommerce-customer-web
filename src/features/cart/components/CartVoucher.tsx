import { useState } from 'react';
import { Tag } from 'lucide-react';

import type { VoucherPreview } from '@/shared/types/commerce.types';
import { formatVnd } from '@/shared/utils/formatVnd';

type CartVoucherProps = {
  apply: (code: string) => void;
  checking: boolean;
  code: string;
  disabled: boolean;
  failed: boolean;
  preview?: VoucherPreview;
};

export const CartVoucher = ({ apply, checking, code, disabled, failed, preview }: CartVoucherProps) => {
  const [value, setValue] = useState(code);

  return (
    <div className="rounded-feature bg-surface p-2.5 shadow-subtle lg:hidden">
      <form className="flex items-center gap-2" onSubmit={(event) => { event.preventDefault(); apply(value); }}>
        <Tag aria-hidden="true" className="ml-2 size-4 shrink-0 text-outline" />
        <label className="sr-only" htmlFor="cart-voucher">Mã ưu đãi</label>
        <input
          autoComplete="off"
          className="min-h-11 min-w-0 flex-1 bg-transparent text-sm placeholder:text-outline"
          id="cart-voucher"
          onChange={(event) => setValue(event.target.value)}
          placeholder="Mã ưu đãi"
          value={value}
        />
        <button className="min-h-11 shrink-0 rounded bg-surface-soft px-3 text-xs font-semibold uppercase hover:bg-surface-muted disabled:opacity-50"
          disabled={disabled || checking || !value.trim()} type="submit">
          Áp dụng
        </button>
      </form>
      <div aria-live="polite" className="px-2 text-xs text-text-secondary">
        {checking ? <p className="mt-2">Đang kiểm tra mã ưu đãi…</p> : null}
        {failed ? <p className="mt-2 text-danger">Không thể áp dụng mã cho giỏ hàng hiện tại.</p> : null}
        {preview?.isApplicable ? (
          <p className="mt-2">{preview.code} · Giảm dự kiến {formatVnd(preview.discountAmount)}. Xác nhận tại checkout.</p>
        ) : null}
        {preview && !preview.isApplicable ? <p className="mt-2">Mã chưa giảm giá cho giỏ hàng hiện tại.</p> : null}
      </div>
    </div>
  );
};
