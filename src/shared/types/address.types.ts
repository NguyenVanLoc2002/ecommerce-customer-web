import type { AddressType } from '@/shared/types/enums';

export interface Address {
  id: string;
  receiverName: string;
  phoneNumber: string;
  streetAddress: string;
  ward: string;
  district: string;
  city: string;
  postalCode: string;
  addressType: AddressType;
  isDefault: boolean;
  label: string;
  fullAddress?: string;
  createdAt?: string;
}

export interface CreateAddressRequest {
  receiverName: string;
  phoneNumber: string;
  streetAddress: string;
  ward: string;
  district: string;
  city: string;
  postalCode: string;
  addressType: AddressType;
  isDefault?: boolean;
  label: string;
}

export type UpdateAddressRequest = Partial<CreateAddressRequest>;
