import { ADDRESS_TYPES, type AddressType } from '@/shared/types/enums';

export const addressTypeLabels: Record<AddressType, string> = {
  [ADDRESS_TYPES.SHIPPING]: 'Giao hàng',
  [ADDRESS_TYPES.BILLING]: 'Hóa đơn',
  [ADDRESS_TYPES.BOTH]: 'Giao hàng và hóa đơn',
};
