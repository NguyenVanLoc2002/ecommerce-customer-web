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
        <fieldset className="space-y-3" key={group.attributeId}>
          <legend className="mb-3 text-sm font-semibold text-text-primary">{group.attributeName}</legend>
          <div className="flex flex-wrap gap-2">
            {group.values.map((value) => {
              const selected = selectedValues[group.attributeId] === value.valueId;
              const valueStatus = getVariantValueStatus(variants, groups, selectedValues, group.attributeId, value.valueId);
              const disabled = valueStatus !== 'available';

              return (
                <button
                  aria-pressed={selected}
                  className={`flex min-h-11 min-w-14 flex-col items-center justify-center border px-4 py-2 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary motion-reduce:transition-none ${selected ? 'border-text-primary bg-text-primary text-surface' : 'border-border bg-surface hover:border-text-primary'} ${disabled ? 'cursor-not-allowed text-text-secondary opacity-60' : ''}`}
                  disabled={disabled}
                  key={value.valueId}
                  onClick={() => onSelectValue(group.attributeId, value.valueId)}
                  type="button"
                  title={valueStatus === 'inactive' ? 'Tạm ngừng bán' : valueStatus === 'unavailable' ? 'Không có tổ hợp này' : undefined}
                >
                  {value.label}
                  {disabled ? <span className="mt-1 text-[11px] leading-tight">{valueStatus === 'inactive' ? 'Tạm ngừng bán' : 'Không có lựa chọn này'}</span> : null}
                </button>
              );
            })}
          </div>
        </fieldset>
      ))}
      <p aria-live="polite" className="min-h-5 text-sm text-text-secondary" role="status">{selectionMessage}</p>
    </div>
  );
};
