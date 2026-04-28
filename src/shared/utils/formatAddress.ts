import type { CustomerAddress } from '@/shared/types/commerce.types';

export const formatAddress = (address: CustomerAddress) =>
  [address.streetAddress, `${address.ward}, ${address.district}`, `${address.city} ${address.postalCode}`]
    .filter(Boolean)
    .join(', ');

