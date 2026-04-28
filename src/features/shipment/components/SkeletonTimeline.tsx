export const SkeletonTimeline = () => (
  <div className="space-y-6">
    {Array.from({ length: 4 }).map((_, index) => (
      <div className="overflow-hidden border border-border bg-surface px-5 py-5 md:px-6" key={index}>
        <div className="shimmer animate-shimmer">
          <div className="h-3 w-28 bg-surface-soft" />
          <div className="mt-4 h-8 w-52 bg-surface-soft" />
          <div className="mt-6 h-4 w-full bg-surface-soft" />
          <div className="mt-3 h-4 w-4/5 bg-surface-soft" />
        </div>
      </div>
    ))}
  </div>
);
