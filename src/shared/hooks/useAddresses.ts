import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/constants/queryKeys';
import { addressService } from '@/shared/services/addressService';
import type { CreateAddressRequest, UpdateAddressRequest } from '@/shared/types/address.types';

export const useAddresses = () =>
  useQuery({
    queryKey: queryKeys.addresses.list,
    queryFn: addressService.getAddresses,
  });

export const useAddress = (addressId: string) =>
  useQuery({
    queryKey: queryKeys.addresses.detail(addressId),
    queryFn: () => addressService.getAddressById(addressId),
    enabled: Boolean(addressId),
  });

export const useCreateAddress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateAddressRequest) => addressService.createAddress(payload),
    onSuccess: (address) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.addresses.list });
      void queryClient.invalidateQueries({ queryKey: queryKeys.addresses.detail(address.id) });
    },
  });
};

export const useUpdateAddress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ addressId, payload }: { addressId: string; payload: UpdateAddressRequest }) =>
      addressService.updateAddress(addressId, payload),
    onSuccess: (address) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.addresses.list });
      void queryClient.invalidateQueries({ queryKey: queryKeys.addresses.detail(address.id) });
    },
  });
};

export const useDeleteAddress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (addressId: string) => addressService.deleteAddress(addressId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.addresses.list });
    },
  });
};
