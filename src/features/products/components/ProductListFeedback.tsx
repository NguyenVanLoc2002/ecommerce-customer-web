import { RefreshCw, SearchX } from 'lucide-react';

type ProductListFeedbackProps = {
  status: 'empty' | 'error';
  onAction: () => void;
};

export const ProductListFeedback = ({ status, onAction }: ProductListFeedbackProps) => {
  const error = status === 'error';
  const Icon = error ? RefreshCw : SearchX;

  return (
    <div className="flex flex-col items-center gap-3 rounded bg-surface px-6 py-8 text-center lg:py-10" role={error ? 'alert' : undefined}>
      <span className={`grid size-12 place-items-center rounded-full lg:size-10 ${error ? 'bg-danger/10 text-danger' : 'bg-surface-soft text-text-secondary'}`}>
        <Icon aria-hidden="true" className="size-5" />
      </span>
      <h2 className="text-base font-semibold text-text-primary lg:text-sm lg:font-medium">
        {error ? 'Không thể tải danh sách sản phẩm lúc này' : 'Không tìm thấy sản phẩm phù hợp'}
      </h2>
      <p className="max-w-[260px] text-xs leading-relaxed text-text-secondary">
        {error ? 'Vui lòng kiểm tra kết nối rồi thử tải danh sách thêm lần nữa.' : 'Hãy thử bỏ bớt bộ lọc đã chọn hoặc mở rộng khoảng giá tìm kiếm để khám phá các thiết kế khác.'}
      </p>
      <button
        className={`mt-2 min-h-11 rounded-sm px-6 text-xs font-semibold transition-colors ${error ? 'bg-[rgb(var(--discovery-control))] text-white hover:bg-text-primary' : 'bg-surface-soft text-text-primary hover:bg-surface-muted'}`}
        onClick={onAction}
        type="button"
      >
        {error ? 'Thử lại' : 'Xóa bộ lọc'}
      </button>
    </div>
  );
};
