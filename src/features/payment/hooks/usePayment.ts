import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/constants/queryKeys';
import { paymentService } from '@/features/payment/services/paymentService';
import type { CapturePaymentRequest, InitiatePaymentRequest } from '@/shared/types/payment.types';
import { PAYMENT_STATUSES } from '@/shared/types/payment.types';

const PAYMENT_POLLING_INTERVAL = 3000;
const PAYMENT_POLLING_MAX_ATTEMPTS = 8;
const MOMO_RETURN_POLLING_INTERVAL = 2000;
const MOMO_RETURN_POLLING_MAX_ATTEMPTS = 15;
const PAYPAL_RETURN_POLLING_INTERVAL = 2000;
const PAYPAL_RETURN_POLLING_MAX_ATTEMPTS = 15;

const DEFAULT_POLLING_STATUSES = [
  PAYMENT_STATUSES.INITIATED,
  PAYMENT_STATUSES.PENDING,
  PAYMENT_STATUSES.PROCESSING,
] as const;
const DEFAULT_TERMINAL_STATUSES = [
  PAYMENT_STATUSES.PAID,
  PAYMENT_STATUSES.FAILED,
  PAYMENT_STATUSES.CANCELLED,
  PAYMENT_STATUSES.EXPIRED,
  PAYMENT_STATUSES.REFUNDED,
  PAYMENT_STATUSES.PARTIALLY_REFUNDED,
] as const;

type PaymentPollingOptions = {
  intervalMs: number;
  maxAttempts: number;
  pollingStatuses?: readonly string[];
  terminalStatuses?: readonly string[];
};

const isStatusInList = (status: string | null | undefined, candidateStatuses: readonly string[]) =>
  Boolean(status && candidateStatuses.includes(status));

const getErrorCode = (error: unknown) => {
  if (!(error instanceof Error) || !('code' in error)) {
    return null;
  }

  const code = (error as { code?: unknown }).code;
  return typeof code === 'string' ? code : null;
};

export const isPendingPaymentStatus = (status: string | null | undefined) =>
  isStatusInList(status, DEFAULT_POLLING_STATUSES);

export const isTerminalPaymentStatus = (status: string | null | undefined) =>
  isStatusInList(status, DEFAULT_TERMINAL_STATUSES);

export const usePaymentByOrderId = (orderId: string) =>
  useQuery({
    queryKey: queryKeys.payments.byOrder(orderId),
    queryFn: () => paymentService.getByOrderId(orderId),
    enabled: Boolean(orderId),
  });

export const useInitiatePayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, payload, idempotencyKey }: { orderId: string; payload?: InitiatePaymentRequest; idempotencyKey: string }) =>
      paymentService.initiate(orderId, payload, idempotencyKey),
    retry: false,
    onSettled: (_, __, variables) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.payments.byOrder(variables.orderId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.orders.detail(variables.orderId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.orders.list });
    },
  });
};

export const useCapturePayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, payload }: { orderId: string; payload: CapturePaymentRequest }) =>
      paymentService.capture(orderId, payload),
    retry: false,
    onSettled: (_, __, variables) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.payments.byOrder(variables.orderId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.orders.detail(variables.orderId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.orders.list });
    },
  });
};

export const usePaymentStatusPolling = (orderId: string, options: PaymentPollingOptions) => {
  const queryClient = useQueryClient();
  const [attemptCount, setAttemptCount] = useState(0);
  const pollingStatuses = options.pollingStatuses ?? DEFAULT_POLLING_STATUSES;
  const terminalStatuses = options.terminalStatuses ?? DEFAULT_TERMINAL_STATUSES;

  const query = useQuery({
    queryKey: queryKeys.payments.byOrder(orderId),
    queryFn: () => paymentService.getByOrderId(orderId),
    enabled: Boolean(orderId),
    refetchInterval: (queryState) => {
      const status = queryState.state.data?.status;
      const errorCode = getErrorCode(queryState.state.error);
      if (!status) {
        if (errorCode === 'PAYMENT_NOT_FOUND' && attemptCount < options.maxAttempts) {
          return options.intervalMs;
        }

        return false;
      }

      if (!isStatusInList(status, pollingStatuses) || attemptCount >= options.maxAttempts) {
        return false;
      }

      return options.intervalMs;
    },
  });

  useEffect(() => {
    setAttemptCount(0);
  }, [orderId]);

  useEffect(() => {
    const status = query.data?.status;
    if (!isStatusInList(status, pollingStatuses)) {
      if (getErrorCode(query.error) !== 'PAYMENT_NOT_FOUND') {
        return;
      }
    }

    setAttemptCount((currentValue) => currentValue + 1);
  }, [pollingStatuses, query.data?.status, query.dataUpdatedAt, query.error, query.errorUpdatedAt]);

  useEffect(() => {
    const status = query.data?.status;
    if (!isStatusInList(status, terminalStatuses)) {
      return;
    }

    void queryClient.invalidateQueries({ queryKey: queryKeys.orders.detail(orderId) });
    void queryClient.invalidateQueries({ queryKey: queryKeys.orders.list });
  }, [orderId, query.data?.status, queryClient, terminalStatuses]);

  return {
    ...query,
    attemptCount,
    maxAttemptsReached: attemptCount >= options.maxAttempts,
    isPolling: Boolean(
      ((query.data?.status && isStatusInList(query.data.status, pollingStatuses)) || getErrorCode(query.error) === 'PAYMENT_NOT_FOUND') &&
        attemptCount < options.maxAttempts,
    ),
  };
};

export const usePaymentResultPolling = (orderId: string) =>
  usePaymentStatusPolling(orderId, {
    intervalMs: PAYMENT_POLLING_INTERVAL,
    maxAttempts: PAYMENT_POLLING_MAX_ATTEMPTS,
    pollingStatuses: DEFAULT_POLLING_STATUSES,
  });

export const useMomoReturnPolling = (orderId: string) =>
  usePaymentStatusPolling(orderId, {
    intervalMs: MOMO_RETURN_POLLING_INTERVAL,
    maxAttempts: MOMO_RETURN_POLLING_MAX_ATTEMPTS,
    pollingStatuses: DEFAULT_POLLING_STATUSES,
  });

export const usePaypalReturnPolling = (orderId: string) =>
  usePaymentStatusPolling(orderId, {
    intervalMs: PAYPAL_RETURN_POLLING_INTERVAL,
    maxAttempts: PAYPAL_RETURN_POLLING_MAX_ATTEMPTS,
    pollingStatuses: DEFAULT_POLLING_STATUSES,
  });
