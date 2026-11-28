import type { FreeShippingProgress as ShippingProgress } from '@/shared/types/commerce.types';
import { formatVnd } from '@/shared/utils/formatVnd';

export const FreeShippingProgress = ({ progress }: { progress: ShippingProgress }) => {
  if (!progress.enabled || progress.threshold <= 0) return null;

  const value = Math.min(progress.threshold, Math.max(0, progress.eligibleAmount));
  const percent = Math.floor((value / progress.threshold) * 100);

  return (
    <div className="mt-4 space-y-1.5 text-xs font-medium text-text-secondary">
      <div className="flex justify-between gap-3">
        <span>{progress.qualified ? 'Đã đạt ngưỡng miễn phí giao hàng' : `Còn ${formatVnd(progress.remainingAmount)} để được miễn phí giao hàng`}</span>
        <span className="shrink-0">{percent}%</span>
      </div>
      <progress aria-label="Tiến độ miễn phí giao hàng"
        className="block h-1.5 w-full appearance-none overflow-hidden rounded-full bg-surface-soft [&::-moz-progress-bar]:bg-text-secondary [&::-webkit-progress-bar]:bg-surface-soft [&::-webkit-progress-value]:bg-text-secondary"
        max={progress.threshold} value={value} />
    </div>
  );
};
