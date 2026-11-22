import { AlertTriangle } from 'lucide-react';

type StaleCartBannerProps = {
  count: number;
};

export const StaleCartBanner = ({ count }: StaleCartBannerProps) => (
  <div className="border border-danger/30 bg-danger/5 px-5 py-4" role="alert">
    <div className="flex items-start gap-3">
      <AlertTriangle aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-danger" />
      <div>
        <p className="text-sm font-semibold text-danger">Cần cập nhật số lượng</p>
        <p className="mt-1 text-sm leading-6 text-text-primary">
          {count} sản phẩm trong giỏ vượt quá số lượng hiện có. Hãy giảm số lượng để tiếp tục thanh toán.
        </p>
      </div>
    </div>
  </div>
);
