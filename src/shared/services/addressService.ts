import { apiClient } from '@/shared/lib/axios';
import { toAddress } from '@/shared/lib/apiMappers';
import type { AddressResponse, CreateAddressRequest, UpdateAddressRequest } from '@/shared/types/address.types';
import type { ApiResponse } from '@/shared/types/api.types';

export const addressService = {
  async getAddresses() {
    const response = await apiClient.get<ApiResponse<AddressResponse[]>, AddressResponse[]>('/addresses');
    return response.map(toAddress);
  },
  async getAddressById(addressId: string) {
    const response = await apiClient.get<ApiResponse<AddressResponse>, AddressResponse>(`/addresses/${addressId}`);
    return toAddress(response);
  },
  async createAddress(payload: CreateAddressRequest) {
    const response = await apiClient.post<ApiResponse<AddressResponse>, AddressResponse>('/addresses', payload);
    return toAddress(response);
  },
  async updateAddress(addressId: string, payload: UpdateAddressRequest) {
    const response = await apiClient.patch<ApiResponse<AddressResponse>, AddressResponse>(`/addresses/${addressId}`, payload);
    return toAddress(response);
  },
  async deleteAddress(addressId: string) {
    await apiClient.delete<ApiResponse<null>, null>(`/addresses/${addressId}`);
  },
};
