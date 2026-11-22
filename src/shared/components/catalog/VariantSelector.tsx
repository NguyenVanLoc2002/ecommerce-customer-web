import type { ProductVariant } from '@/shared/types/catalog.types';
import { getVariantValueStatus, type VariantAttributeGroup, type VariantSelectionResult } from '@/features/products/utils/variantSelection';

type VariantSelectorProps = {
  variants: ProductVariant[];
  groups: VariantAttributeGroup[];
  selectedValues: Record<string, string>;
  selection: VariantSelectionResult;
  onSelectValue: (attributeId: string, valueId: string) => void;
};

export const VariantSelector = ({ groups, onSelectValue, selectedValues, selection, variants }: VariantSelectorProps) => {
  if (variants.length === 0) {
    return <p className="text-sm text-text-secondary" role="status">Sản phẩm hiện chưa có phiên bản để đặt mua.</p>;
  }

  if (groups.length === 0) {
    return <p className="text-sm text-text-secondary" role="status">Chưa có thông tin phân loại sản phẩm để chọn.</p>;
  }

  const selectionMessage = {
    unselected: 'Chọn các phân loại để xác định đúng phiên bản sản phẩm.',
    incomplete: 'Vui lòng chọn đủ các phân loại.',
    unavailable: 'Tổ hợp phân loại này hiện không có trong danh mục.',
    inactive: 'Phiên bản này hiện tạm ngừng bán.',
    active: 'Phiên bản đã chọn có thể thêm vào giỏ. Tồn kho sẽ được xác nhận khi gửi yêu cầu.',
  }[selection.status];

  return (
    <div className="space-y-6">
      {groups.map((group) => (
        <fieldset className="space-y-3 border-b border-border pb-5 last:border-0 last:pb-0" key={group.attributeId}>
          <legend className="mb-3 text-[11px] font-medium uppercase tracking-[0.08em] text-text-primary">
            {group.attributeName}
            <span className="font-normal text-text-secondary md:hidden">
              {': '}
              {group.values.find((value) => value.valueId === selectedValues[group.attributeId])?.label ?? 'Chưa chọn'}
            </span>
          </legend>
          <div className="grid grid-cols-4 gap-2">
            {group.values.map((value) => {
              const selected = selectedValues[group.attributeId] === value.valueId;
              const valueStatus = getVariantValueStatus(variants, groups, selectedValues, group.attributeId, value.valueId);
              const disabled = valueStatus !== 'available';

              return (
                <button
                  aria-pressed={selected}
                  className={`flex min-h-11 min-w-0 flex-col items-center justify-center rounded border px-2 py-2 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary motion-reduce:transition-none ${selected ? 'border-text-primary bg-text-primary text-surface' : 'border-border bg-surface hover:border-text-primary'} ${disabled ? 'cursor-not-allowed text-text-secondary opacity-60' : ''}`}
                  disabled={disabled}
                  key={value.valueId}
                  onClick={() => onSelectValue(group.attributeId, value.valueId)}
                  type="button"
                  title={valueStatus === 'inactive' ? 'Tạm ngừng bán' : valueStatus === 'unavailable' ? 'Không có tổ hợp này' : undefined}
                >
                  <span className={valueStatus === 'inactive' ? 'line-through' : undefined}>{value.label}</span>
                  {disabled ? <span className="mt-1 text-[11px] leading-tight">{valueStatus === 'inactive' ? 'Tạm ngừng bán' : 'Không có lựa chọn này'}</span> : null}
                </button>
              );
            })}
          </div>
        </fieldset>
      ))}
      <p aria-live="polite" className={`min-h-5 text-sm text-text-secondary ${selection.status === 'active' ? 'sr-only' : ''}`} role="status">{selectionMessage}</p>
    </div>
  );
};
