import { config } from '@/constants/config';
import { apiClient } from '@/shared/lib/axios';
import { mockCommerce } from '@/shared/lib/mockCommerce';
import { normalizeApiError } from '@/shared/lib/normalizeApiError';
import type { Address, CreateAddressRequest, UpdateAddressRequest } from '@/shared/types/address.types';

export const addressService = {
  async getAddresses() {
    try {
      if (config.useMockData) {
        return await mockCommerce.getAddresses();
      }

      const response = await apiClient.get<Address[]>('/addresses');
      return response.data;
    } catch (error) {
      throw normalizeApiError(error);
    }
  },
  async getAddressById(addressId: string) {
    try {
      if (config.useMockData) {
        return await mockCommerce.getAddressById(addressId);
      }

      const response = await apiClient.get<Address>(`/addresses/${addressId}`);
      return response.data;
    } catch (error) {
      throw normalizeApiError(error);
    }
  },
  async createAddress(payload: CreateAddressRequest) {
    try {
      if (config.useMockData) {
        return await mockCommerce.createAddress(payload);
      }

      const response = await apiClient.post<Address>('/addresses', payload);
      return response.data;
    } catch (error) {
      throw normalizeApiError(error);
    }
  },
  async updateAddress(addressId: string, payload: UpdateAddressRequest) {
    try {
      if (config.useMockData) {
        return await mockCommerce.updateAddress(addressId, payload);
      }

      const response = await apiClient.patch<Address>(`/addresses/${addressId}`, payload);
      return response.data;
    } catch (error) {
      throw normalizeApiError(error);
    }
  },
  async deleteAddress(addressId: string) {
    try {
      if (config.useMockData) {
        await mockCommerce.deleteAddress(addressId);
        return;
      }

      await apiClient.delete(`/addresses/${addressId}`);
    } catch (error) {
      throw normalizeApiError(error);
    }
  },
};
