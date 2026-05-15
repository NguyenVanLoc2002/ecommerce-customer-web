import { useMutation, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/constants/queryKeys';
import { checkoutService } from '@/features/checkout/services/checkoutService';
import { isMutationProcessingError, isUncertainMutationFailure } from '@/shared/lib/idempotentMutation';
import { useAddresses } from '@/shared/hooks/useAddresses';
import type { PlaceOrderInput } from '@/shared/types/commerce.types';

export const useCheckoutAddresses = useAddresses;

export const useValidateVoucher = () =>
  useMutation({
    mutationFn: ({ code, orderAmount }: { code: string; orderAmount: number }) =>
      checkoutService.validateVoucher(code, orderAmount),
  });

export const usePlaceOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ payload, idempotencyKey }: { payload: PlaceOrderInput; idempotencyKey: string }) =>
      checkoutService.placeOrder(payload, idempotencyKey),
    retry: false,
    onSuccess: (order) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.cart.detail });
      void queryClient.invalidateQueries({ queryKey: queryKeys.orders.list });
      void queryClient.invalidateQueries({ queryKey: queryKeys.orders.detail(order.id) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.payments.byOrder(order.id) });
    },
    onError: (error) => {
      if (!isUncertainMutationFailure(error) && !isMutationProcessingError(error)) {
        return;
      }

      void queryClient.invalidateQueries({ queryKey: queryKeys.cart.detail });
      void queryClient.invalidateQueries({ queryKey: queryKeys.orders.list });
    },
  });
};
