import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/constants/queryKeys';
import { checkoutService } from '@/features/checkout/services/checkoutService';

export const useCheckoutAddresses = () =>
  useQuery({
    queryKey: ['checkout', 'addresses'],
    queryFn: checkoutService.getAddresses,
  });

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

