export function ProductBadges({ labels, limit = 1 }: { labels: string[]; limit?: 1 | 2 }) {
  if (labels.length === 0) return null;

  return (
    <ul className="pointer-events-none absolute left-3 right-3 top-3 flex flex-wrap gap-1.5 lg:left-4 lg:top-4" aria-label="Nhãn sản phẩm">
      {labels.slice(0, limit).map((label, index) => (
        <li className="max-w-full break-words rounded-sm bg-canvas/95 px-2.5 py-1 text-[11px] font-medium uppercase tracking-wider text-text-primary lg:text-xs"
          key={index}>{label}</li>
      ))}
    </ul>
  );
}
