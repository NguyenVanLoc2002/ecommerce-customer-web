export const CartSkeleton = () => (
  <div aria-busy="true" role="status">
    <span className="sr-only">Đang tải giỏ hàng…</span>
    <div aria-hidden="true" className="grid gap-3 lg:grid-cols-[minmax(0,2.16fr)_minmax(320px,1fr)] lg:gap-x-14">
      <div className="space-y-3 lg:space-y-8">
        {[0, 1].map((row) => (
          <div className="grid grid-cols-[min(25vw,96px)_1fr] gap-3 rounded-feature bg-surface p-3.5 shadow-subtle lg:grid-cols-[144px_1fr] lg:gap-6 lg:rounded-chip lg:p-6" key={row}>
            <div className="aspect-[3/4] rounded-chip bg-surface-soft motion-safe:animate-pulse" />
            <div className="space-y-2 pt-1 motion-safe:animate-pulse">
              <div className="h-3 w-4/5 rounded-chip bg-surface-soft" />
              <div className="h-3 w-3/5 rounded-chip bg-surface-soft" />
              <div className="h-3 w-2/5 rounded-chip bg-surface-soft" />
            </div>
          </div>
        ))}
      </div>
      <div className="h-40 rounded-feature bg-surface p-4 shadow-subtle lg:rounded-chip lg:p-6">
        <div className="space-y-3 motion-safe:animate-pulse">
          <div className="h-4 w-3/5 rounded-chip bg-surface-soft" />
          <div className="h-3 w-4/5 rounded-chip bg-surface-soft" />
          <div className="h-3 w-2/5 rounded-chip bg-surface-soft" />
        </div>
      </div>
    </div>
  </div>
);
