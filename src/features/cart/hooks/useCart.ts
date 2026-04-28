import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/constants/queryKeys';
import { cartService } from '@/features/cart/services/cartService';

export const useCart = () =>
  useQuery({
    queryKey: queryKeys.cart.detail,
    queryFn: cartService.getCart,
  });

export const useUpdateCartItemQuantity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) => cartService.updateQuantity(itemId, quantity),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.cart.detail });
    },
  });
};

export const useRemoveCartItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (itemId: string) => cartService.removeItem(itemId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.cart.detail });
    },
  });
};

export const useClearCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => cartService.clearCart(),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.cart.detail });
    },
  });
};

