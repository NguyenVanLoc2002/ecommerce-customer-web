import { cn } from '@/shared/utils/cn';
import type { ProductVariant } from '@/shared/types/catalog.types';
import { getVariantValueStatus, type VariantAttributeGroup, type VariantSelectionResult } from '@/features/products/utils/variantSelection';

type VariantSelectorProps = {
  variants: ProductVariant[];
  groups: VariantAttributeGroup[];
  selectedValues: Record<string, string>;
  selection: VariantSelectionResult;
  sizeGuideAction?: React.ReactNode;
  onSelectValue: (attributeId: string, valueId: string) => void;
};

export const VariantSelector = ({ groups, onSelectValue, selectedValues, selection, sizeGuideAction, variants }: VariantSelectorProps) => {
  if (variants.length === 0) {
    return <><p className="text-sm text-text-secondary" role="status">Sản phẩm hiện chưa có phiên bản để đặt mua.</p>{sizeGuideAction}</>;
  }

  if (groups.length === 0) {
    return <><p className="text-sm text-text-secondary" role="status">Chưa có thông tin phân loại sản phẩm để chọn.</p>{sizeGuideAction}</>;
  }

  const selectionMessage = {
    unselected: 'Chọn các phân loại để xác định đúng phiên bản sản phẩm.',
    incomplete: 'Vui lòng chọn đủ các phân loại.',
    unavailable: 'Tổ hợp phân loại này hiện không có trong danh mục.',
    inactive: 'Phiên bản này hiện tạm ngừng bán.',
    active: 'Phiên bản đã chọn có thể thêm vào giỏ. Tồn kho sẽ được xác nhận khi gửi yêu cầu.',
  }[selection.status];

  return (
    <div className="space-y-5 lg:space-y-6">
      {groups.map((group) => {
        const selectedValue = group.values.find((value) => value.valueId === selectedValues[group.attributeId]);

        const isSize = group.attributeCode === 'SIZE';

        return (
          <fieldset className="min-w-0 space-y-2.5 lg:space-y-3" key={group.attributeId}>
            <legend className="w-full text-sm font-medium text-text-primary">
              <span className="flex flex-wrap items-center justify-between gap-x-3">
                <span>
               {isSize ? 'Kích cỡ' : group.attributeCode === 'COLOR' ? 'Màu sắc' : group.attributeName}: <span className="font-normal text-text-secondary">{selectedValue?.label ?? 'Chưa chọn'}</span></span>
                {isSize ? sizeGuideAction : null}
              </span>
            </legend>
            <div className={cn('gap-2.5', isSize ? 'grid grid-cols-2 lg:grid-cols-4' : 'flex flex-wrap')}>
              {group.values.map((value) => {
                const selected = selectedValues[group.attributeId] === value.valueId;
                const valueStatus = getVariantValueStatus(variants, groups, selectedValues, group.attributeId, value.valueId);
                const disabled = valueStatus !== 'available';

                return (
                  <button
                    aria-pressed={selected}
                    className={cn(
                      'flex min-h-11 min-w-0 flex-col items-center justify-center break-words rounded px-4 py-1.5 text-center text-sm font-medium transition-colors motion-reduce:transition-none lg:rounded-sm lg:ring-1',
                      isSize ? 'lg:px-1' : 'lg:px-5',
                      selected && 'bg-brand-primary text-surface lg:bg-canvas lg:text-text-primary lg:ring-text-primary',
                      !selected && !disabled && 'bg-surface-muted text-text-primary hover:bg-surface-soft lg:ring-border lg:hover:ring-text-primary',
                      disabled && 'cursor-not-allowed bg-surface-muted text-text-secondary opacity-65 lg:ring-border',
                    )}
                    disabled={disabled}
                    key={value.valueId}
                    onClick={() => onSelectValue(group.attributeId, value.valueId)}
                    type="button"
                    title={valueStatus === 'inactive' ? 'Tạm ngừng bán' : valueStatus === 'unavailable' ? 'Không có tổ hợp này' : undefined}
                  >
                    <span className={valueStatus === 'inactive' ? 'line-through' : undefined}>{value.label}</span>
                    {disabled ? <span className="text-xs leading-tight lg:text-[10px]">{valueStatus === 'inactive' ? 'Tạm ngừng bán' : 'Không có lựa chọn này'}</span> : null}
                  </button>
                );
              })}
            </div>
          </fieldset>
        );
      })}
      {!groups.some((group) => group.attributeCode === 'SIZE') ? sizeGuideAction : null}
      <p aria-live="polite" className={selection.status === 'active' ? 'sr-only' : 'text-sm text-text-secondary'} role="status">{selectionMessage}</p>
    </div>
  );
};
