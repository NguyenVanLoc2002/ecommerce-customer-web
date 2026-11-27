import { useCallback, useState } from 'react';

import { Modal } from '@/shared/components/overlays/Modal';
import type { ProductSizeGuide } from '@/shared/types/catalog.types';

const units = { CM: 'cm', IN: 'inch', KG: 'kg' };
const format = new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 3 });

export const SizeGuide = ({ guide }: { guide: ProductSizeGuide }) => {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  const { columns, rows, measurement, measurementImageUrl, notes } = guide.content;

  return (
    <>
      <button
        aria-haspopup="dialog"
        className="min-h-11 text-sm font-normal text-text-secondary underline underline-offset-4 hover:text-text-primary lg:min-h-0 lg:text-xs"
        onClick={() => setOpen(true)}
        type="button"
      >
        Hướng dẫn kích cỡ
      </button>
      <Modal
        onClose={close}
        open={open}
        overlayClassName="z-[60] !items-end !px-0 sm:!items-center sm:!px-5"
        panelClassName="product-detail max-h-[90dvh] max-w-3xl overflow-y-auto !bg-canvas !p-5 sm:!p-8"
        title="Hướng dẫn kích cỡ"
      >
        <p className="font-medium text-text-primary">{guide.name}</p>
        <p className="mt-1 text-sm text-text-secondary">{measurement === 'BODY' ? 'Số đo cơ thể' : 'Số đo thành phẩm'}</p>
        <div aria-label="Bảng kích cỡ có thể cuộn ngang" className="mt-4 overflow-x-auto rounded-sm border border-border" role="region" tabIndex={0}>
          <table className="w-full text-left text-sm">
            <caption className="sr-only">{guide.name}</caption>
            <thead className="bg-surface-muted">
              <tr>
                <th className="px-3 py-2.5" scope="col">Size</th>
                {columns.map((column) => (
                  <th className="min-w-24 px-3 py-2.5 font-medium" key={column.key} scope="col">
                    {column.label} ({units[column.unit]})
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr className="border-t border-border" key={row.size}>
                  <th className="px-3 py-2.5 font-medium" scope="row">{row.size}</th>
                  {columns.map(({ key }) => {
                    const { min, max } = row.values[key];
                    return <td className="whitespace-nowrap px-3 py-2.5" key={key}>{format.format(min)}{max != null && max !== min ? '–' + format.format(max) : ''}</td>;
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {measurementImageUrl ? (
          <img alt="Minh họa cách lấy số đo" className="mt-5 max-h-72 w-full object-contain" height={384} loading="lazy" src={measurementImageUrl} width={640} />
        ) : null}
        {notes ? <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-text-secondary">{notes}</p> : null}
      </Modal>
    </>
  );
};
