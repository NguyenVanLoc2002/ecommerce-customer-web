import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/constants/queryKeys';

import { returnsService } from '../services/returnsService';
import type { CreateReturnRequest } from '../types/returns.types';

export const useOrderReturns = (orderId: string) =>
  useQuery({
    queryKey: queryKeys.orders.returns(orderId),
    queryFn: ({ signal }) => returnsService.getForOrder(orderId, signal),
    retry: false,
  });

export const useReturnDetail = (orderId: string, returnId: string) =>
  useQuery({
    queryKey: queryKeys.orders.returnDetail(orderId, returnId),
    queryFn: ({ signal }) => returnsService.getDetail(orderId, returnId, signal),
    retry: false,
  });

export const useCreateReturn = (orderId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ payload, key }: { payload: CreateReturnRequest; key: string }) =>
      returnsService.create(orderId, payload, key),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.notifications.list });
      void queryClient.invalidateQueries({ queryKey: queryKeys.notifications.unreadCount });
      return queryClient.invalidateQueries({ queryKey: queryKeys.orders.returns(orderId) });
    },
  });
};
