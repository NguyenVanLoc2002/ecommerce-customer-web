import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/constants/queryKeys';
import { cartService } from '@/features/cart/services/cartService';

export const useCart = ({ enabled = true }: { enabled?: boolean } = {}) =>
  useQuery({
    queryKey: queryKeys.cart.detail,
    queryFn: cartService.getCart,
    enabled,
  });

export const useCartItemCount = (enabled = true) =>
  useQuery({
    queryKey: queryKeys.cart.detail,
    queryFn: cartService.getCart,
    enabled,
    select: (cart) => cart.totalItems,
  });

export const useUpdateCartItemQuantity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) => cartService.updateQuantity(itemId, quantity),
    onSuccess: (cart) => {
      queryClient.setQueryData(queryKeys.cart.detail, cart);
      void queryClient.invalidateQueries({ queryKey: queryKeys.cart.detail });
    },
  });
};

export const useAddCartItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ variantId, quantity }: { variantId: string; quantity: number }) => cartService.addItem(variantId, quantity),
    onSuccess: (cart) => {
      queryClient.setQueryData(queryKeys.cart.detail, cart);
      void queryClient.invalidateQueries({ queryKey: queryKeys.cart.detail });
    },
  });
};

export const useRemoveCartItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (itemId: string) => cartService.removeItem(itemId),
    onSuccess: (cart) => {
      queryClient.setQueryData(queryKeys.cart.detail, cart);
      void queryClient.invalidateQueries({ queryKey: queryKeys.cart.detail });
    },
  });
};

export const useClearCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => cartService.clearCart(),
    onSuccess: (cart) => {
      queryClient.setQueryData(queryKeys.cart.detail, cart);
      void queryClient.invalidateQueries({ queryKey: queryKeys.cart.detail });
    },
  });
};
