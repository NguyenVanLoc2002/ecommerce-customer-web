export const SkeletonDetail = () => (
  <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr]">
    <div className="space-y-6 md:flex md:gap-6">
      <div className="grid grid-cols-4 gap-4 md:w-20 md:grid-cols-1">
        {Array.from({ length: 4 }).map((_, index) => (
          <div className="aspect-[4/5] animate-pulse bg-surface-soft" key={index} />
        ))}
      </div>
      <div className="flex-1">
        <div className="aspect-[4/5] animate-pulse bg-surface-soft" />
      </div>
    </div>
    <div className="space-y-5">
      <div className="h-4 w-24 animate-pulse bg-surface-soft" />
      <div className="h-20 w-4/5 animate-pulse bg-surface-soft" />
      <div className="h-8 w-1/3 animate-pulse bg-surface-soft" />
      <div className="h-56 animate-pulse bg-surface-soft" />
    </div>
  </div>
);
