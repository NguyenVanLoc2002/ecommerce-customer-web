import type { ProductVariant } from '@/shared/types/catalog.types';

export type VariantAttributeGroup = {
  attributeId: string;
  attributeName: string;
  attributeCode?: string;
  values: Array<{ valueId: string; label: string }>;
};

export type VariantSelectionResult =
  | { status: 'unselected' | 'incomplete' | 'unavailable'; variant: null }
  | { status: 'inactive' | 'active'; variant: ProductVariant };

export type VariantValueStatus = 'available' | 'inactive' | 'unavailable';

const ATTRIBUTE_ORDER = ['COLOR', 'SIZE'];
const LETTER_SIZE_ORDER = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];

const displayOrder = (order: string[], value?: string) => {
  const index = value ? order.indexOf(value.trim().toUpperCase()) : -1;
  return index === -1 ? order.length : index;
};

export const getVariantAttributeGroups = (variants: ProductVariant[]): VariantAttributeGroup[] => {
  const groups = new Map<string, VariantAttributeGroup>();

  for (const variant of variants) {
    for (const attribute of variant.attributes) {
      if (!attribute.attributeId || !attribute.valueId) {
        continue;
      }

      const group = groups.get(attribute.attributeId) ?? {
        attributeId: attribute.attributeId,
        attributeCode: attribute.attributeCode.toUpperCase(),
        attributeName: attribute.attributeName || attribute.attributeCode || 'Phân loại',
        values: [],
      };

      if (!group.values.some((value) => value.valueId === attribute.valueId)) {
        group.values.push({ valueId: attribute.valueId, label: attribute.displayValue || attribute.value });
      }

      groups.set(attribute.attributeId, group);
    }
  }

  const orderedGroups = [...groups.values()].sort((first, second) =>
    displayOrder(ATTRIBUTE_ORDER, first.attributeCode) - displayOrder(ATTRIBUTE_ORDER, second.attributeCode),
  );
  for (const group of orderedGroups) {
    if (group.attributeCode === 'SIZE') {
      group.values.sort((first, second) =>
        displayOrder(LETTER_SIZE_ORDER, first.label) - displayOrder(LETTER_SIZE_ORDER, second.label),
      );
    }
  }
  return orderedGroups;
};

export const resolveVariantSelection = (
  variants: ProductVariant[],
  groups: VariantAttributeGroup[],
  selectedValues: Record<string, string>,
): VariantSelectionResult => {
  const selectedCount = Object.keys(selectedValues).filter((attributeId) => groups.some((group) => group.attributeId === attributeId)).length;

  if (selectedCount === 0 || groups.length === 0) {
    return { status: 'unselected', variant: null };
  }

  if (selectedCount < groups.length || groups.some((group) => !selectedValues[group.attributeId])) {
    return { status: 'incomplete', variant: null };
  }

  const matchingVariant = variants.find((variant) => {
    const attributes = variant.attributes.filter((attribute) => attribute.attributeId && attribute.valueId);
    return attributes.length === groups.length && groups.every((group) =>
      attributes.some((attribute) => attribute.attributeId === group.attributeId && attribute.valueId === selectedValues[group.attributeId]),
    );
  });

  if (!matchingVariant) {
    return { status: 'unavailable', variant: null };
  }

  return matchingVariant.status?.toUpperCase() === 'ACTIVE'
    ? { status: 'active', variant: matchingVariant }
    : { status: 'inactive', variant: matchingVariant };
};

export const getVariantValueStatus = (
  variants: ProductVariant[],
  groups: VariantAttributeGroup[],
  selectedValues: Record<string, string>,
  targetAttributeId: string,
  targetValueId: string,
): VariantValueStatus => {
  const constrainedGroups = groups.filter((group) => group.attributeId !== targetAttributeId && selectedValues[group.attributeId]);
  const matchingVariants = variants.filter((variant) => {
    const attributes = variant.attributes.filter((attribute) => attribute.attributeId && attribute.valueId);
    return attributes.some((attribute) => attribute.attributeId === targetAttributeId && attribute.valueId === targetValueId) &&
      constrainedGroups.every((group) => attributes.some((attribute) =>
        attribute.attributeId === group.attributeId && attribute.valueId === selectedValues[group.attributeId],
      ));
  });

  if (matchingVariants.length === 0) {
    return 'unavailable';
  }

  return matchingVariants.some((variant) => variant.status?.toUpperCase() === 'ACTIVE') ? 'available' : 'inactive';
};
