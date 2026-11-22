export const SkeletonCard = () => (
  <div>
    <div className="aspect-[3/4] animate-pulse bg-surface-soft motion-reduce:animate-none" />
    <div className="space-y-3 px-1 pt-5">
      <div className="h-6 w-3/4 animate-pulse bg-surface-soft motion-reduce:animate-none" />
      <div className="h-4 w-1/2 animate-pulse bg-surface-soft motion-reduce:animate-none" />
    </div>
  </div>
);
