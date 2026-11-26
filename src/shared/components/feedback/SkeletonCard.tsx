export const SkeletonCard = ({ appearance }: { appearance?: 'catalog' } = {}) => appearance === 'catalog' ? (
  <div aria-hidden="true" className="space-y-2">
    <div className="aspect-[3/4] animate-pulse rounded-sm bg-surface-soft motion-reduce:animate-none" />
    <div className="h-2.5 w-16 animate-pulse rounded-sm bg-surface-soft motion-reduce:animate-none" />
    <div className="h-3.5 w-3/4 animate-pulse rounded-sm bg-surface-soft motion-reduce:animate-none" />
    <div className="h-3 w-20 animate-pulse rounded-sm bg-surface-soft motion-reduce:animate-none" />
  </div>
) : (
  <div>
    <div className="aspect-[3/4] animate-pulse bg-surface-soft motion-reduce:animate-none" />
    <div className="space-y-3 px-1 pt-5">
      <div className="h-6 w-3/4 animate-pulse bg-surface-soft motion-reduce:animate-none" />
      <div className="h-4 w-1/2 animate-pulse bg-surface-soft motion-reduce:animate-none" />
    </div>
  </div>
);
