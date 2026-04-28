import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/constants/queryKeys';
import { paymentService } from '@/features/payment/services/paymentService';
import type { InitiatePaymentRequest } from '@/shared/types/payment.types';
import { PAYMENT_STATUSES } from '@/shared/types/payment.types';

const PAYMENT_POLLING_INTERVAL = 3000;
const PAYMENT_POLLING_MAX_ATTEMPTS = 8;

const isPollingStatus = (status: string) =>
  status === PAYMENT_STATUSES.INITIATED || status === PAYMENT_STATUSES.PENDING;

const isTerminalStatus = (status: string) =>
  status === PAYMENT_STATUSES.PAID ||
  status === PAYMENT_STATUSES.FAILED ||
  status === PAYMENT_STATUSES.REFUNDED ||
  status === PAYMENT_STATUSES.PARTIALLY_REFUNDED;

export const usePaymentByOrderId = (orderId: string) =>
  useQuery({
    queryKey: queryKeys.payments.byOrder(orderId),
    queryFn: () => paymentService.getByOrderId(orderId),
    enabled: Boolean(orderId),
  });

export const useInitiatePayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, payload }: { orderId: string; payload?: InitiatePaymentRequest }) => paymentService.initiate(orderId, payload),
    retry: false,
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.payments.byOrder(variables.orderId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.orders.detail(variables.orderId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.orders.list });
    },
  });
};

export const usePaymentResultPolling = (orderId: string) => {
  const queryClient = useQueryClient();
  const [attemptCount, setAttemptCount] = useState(0);

  const query = useQuery({
    queryKey: queryKeys.payments.byOrder(orderId),
    queryFn: () => paymentService.getByOrderId(orderId),
    enabled: Boolean(orderId),
    refetchInterval: (queryState) => {
      const status = queryState.state.data?.status;
      if (!status) {
        return false;
      }

      if (!isPollingStatus(status) || attemptCount >= PAYMENT_POLLING_MAX_ATTEMPTS) {
        return false;
      }

      return PAYMENT_POLLING_INTERVAL;
    },
  });

  useEffect(() => {
    setAttemptCount(0);
  }, [orderId]);

  useEffect(() => {
    const status = query.data?.status;
    if (!status || !isPollingStatus(status)) {
      return;
    }

    setAttemptCount((currentValue) => currentValue + 1);
  }, [query.data?.status, query.dataUpdatedAt]);

  useEffect(() => {
    const status = query.data?.status;
    if (!status || !isTerminalStatus(status)) {
      return;
    }

    void queryClient.invalidateQueries({ queryKey: queryKeys.orders.detail(orderId) });
    void queryClient.invalidateQueries({ queryKey: queryKeys.orders.list });
  }, [orderId, query.data?.status, queryClient]);

  return {
    ...query,
    attemptCount,
    maxAttemptsReached: attemptCount >= PAYMENT_POLLING_MAX_ATTEMPTS,
    isPolling: Boolean(query.data?.status && isPollingStatus(query.data.status) && attemptCount < PAYMENT_POLLING_MAX_ATTEMPTS),
  };
};
