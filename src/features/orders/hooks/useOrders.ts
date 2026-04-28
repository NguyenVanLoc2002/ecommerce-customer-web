import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/constants/queryKeys';
import { ordersService } from '@/features/orders/services/ordersService';

export const useOrders = () =>
  useQuery({
    queryKey: queryKeys.orders.list,
    queryFn: ordersService.getOrders,
  });

export const useOrderDetail = (orderId: string) =>
  useQuery({
    queryKey: queryKeys.orders.detail(orderId),
    queryFn: () => ordersService.getOrderById(orderId),
    enabled: Boolean(orderId),
  });

export const useCancelOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderId: string) => ordersService.cancelOrder(orderId),
    onSuccess: (_, orderId) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.orders.list });
      void queryClient.invalidateQueries({ queryKey: queryKeys.orders.detail(orderId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.cart.detail });
    },
  });
};
