import { useMutation, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/constants/queryKeys';
import { checkoutService } from '@/features/checkout/services/checkoutService';
import { useAddresses } from '@/shared/hooks/useAddresses';

export const useCheckoutAddresses = useAddresses;

export const useValidateVoucher = () =>
  useMutation({
    mutationFn: (code: string) => checkoutService.validateVoucher(code),
  });

export const usePlaceOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: checkoutService.placeOrder,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.cart.detail });
      void queryClient.invalidateQueries({ queryKey: queryKeys.orders.list });
    },
  });
};
