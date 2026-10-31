import { useEffect, useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/constants/queryKeys';
import { checkoutService } from '@/features/checkout/services/checkoutService';
import {
  buildCheckoutOrderPayload,
  buildCheckoutPreviewSignature,
  buildCheckoutPreviewTotals,
  hasCheckoutPreviewPrerequisites,
} from '@/features/checkout/lib/checkoutOrder';
import { useCheckoutStore } from '@/features/checkout/stores/checkoutStore';
import { isMutationProcessingError, isUncertainMutationFailure } from '@/shared/lib/idempotentMutation';
import { useAddresses } from '@/shared/hooks/useAddresses';
import type { CommerceCart, OrderPreviewInput, PlaceOrderInput } from '@/shared/types/commerce.types';

type CheckoutSummaryValueOverrides = Partial<{
  shippingFee: string;
  discountTotal: string;
  grandTotal: string;
}>;

export const useCheckoutAddresses = useAddresses;

export const useCheckoutCarriers = () =>
  useQuery({
    queryKey: queryKeys.checkout.carriers,
    queryFn: checkoutService.getCheckoutCarrierOptions,
  });

export const useCheckoutPreview = (payload: OrderPreviewInput | null, enabled = true, requestSignature?: string) => {
  const setOrderPreview = useCheckoutStore((state) => state.setOrderPreview);
  const setPreviewError = useCheckoutStore((state) => state.setPreviewError);
  const setPreviewLoading = useCheckoutStore((state) => state.setPreviewLoading);
  const setPreviewRequestSignature = useCheckoutStore((state) => state.setPreviewRequestSignature);
  const previewEnabled = enabled && payload !== null && hasCheckoutPreviewPrerequisites(payload.shippingAddressId);
  const payloadSignature = useMemo(
    () => requestSignature ?? (payload ? JSON.stringify(payload) : 'missing-preview-payload'),
    [payload, requestSignature],
  );
  const previewQuery = useQuery({
    queryKey: queryKeys.checkout.preview(payloadSignature),
    queryFn: () => checkoutService.previewOrder(payload as OrderPreviewInput),
    enabled: previewEnabled,
  });

  useEffect(() => {
    if (!previewEnabled) {
      setOrderPreview(null);
      setPreviewError(null);
      setPreviewLoading(false);
      setPreviewRequestSignature(null);
      return;
    }

    setPreviewRequestSignature(payloadSignature);
    setOrderPreview(null);
    setPreviewError(null);
  }, [payloadSignature, previewEnabled, setOrderPreview, setPreviewError, setPreviewLoading, setPreviewRequestSignature]);

  useEffect(() => {
    setPreviewLoading(previewQuery.isPending || previewQuery.isFetching);
  }, [previewQuery.isFetching, previewQuery.isPending, setPreviewLoading]);

  useEffect(() => {
    if (!previewQuery.isError) {
      return;
    }

    if (useCheckoutStore.getState().previewRequestSignature !== payloadSignature) {
      return;
    }

    setOrderPreview(null);
    setPreviewError(previewQuery.error instanceof Error ? previewQuery.error.message : 'The shipping quote preview could not be refreshed.');
  }, [payloadSignature, previewQuery.error, previewQuery.isError, setOrderPreview, setPreviewError]);

  useEffect(() => {
    if (!previewQuery.data) {
      return;
    }

    if (useCheckoutStore.getState().previewRequestSignature !== payloadSignature) {
      return;
    }

    setPreviewError(null);
    setOrderPreview(previewQuery.data);
  }, [payloadSignature, previewQuery.data, setOrderPreview, setPreviewError]);

  return previewQuery;
};

export const useCheckoutPricing = (cart: CommerceCart | null | undefined) => {
  const customerNote = useCheckoutStore((state) => state.customerNote);
  const orderPreview = useCheckoutStore((state) => state.orderPreview);
  const paymentMethod = useCheckoutStore((state) => state.paymentMethod);
  const previewError = useCheckoutStore((state) => state.previewError);
  const previewLoading = useCheckoutStore((state) => state.previewLoading);
  const carrierSelectionError = useCheckoutStore((state) => state.carrierSelectionError);
  const selectedCarrierId = useCheckoutStore((state) => state.selectedCarrierId);
  const setCarrierSelectionError = useCheckoutStore((state) => state.setCarrierSelectionError);
  const setOrderPreview = useCheckoutStore((state) => state.setOrderPreview);
  const setSelectedCarrierId = useCheckoutStore((state) => state.setSelectedCarrierId);
  const shippingAddressId = useCheckoutStore((state) => state.shippingAddressId);
  const voucherCode = useCheckoutStore((state) => state.voucherCode);
  const carriersQuery = useCheckoutCarriers();
  const carrierOptions = useMemo(() => carriersQuery.data ?? [], [carriersQuery.data]);
  const carrierSelectionRequired = carrierOptions.length > 0;
  const selectedCarrier = useMemo(
    () => carrierOptions.find((carrier) => carrier.id === selectedCarrierId) ?? null,
    [carrierOptions, selectedCarrierId],
  );
  const checkoutPayload = useMemo(
    () =>
      buildCheckoutOrderPayload({
        shippingAddressId,
        selectedCarrierId,
        paymentMethod,
        customerNote,
        voucherCode,
      }),
    [customerNote, paymentMethod, selectedCarrierId, shippingAddressId, voucherCode],
  );
  const previewRequestSignature = useMemo(
    () => buildCheckoutPreviewSignature(checkoutPayload, cart ?? null),
    [cart, checkoutPayload],
  );
  const canPreview =
    Boolean(cart) &&
    !carriersQuery.isLoading &&
    !carriersQuery.isError &&
    (!carrierSelectionRequired || Boolean(selectedCarrierId)) &&
    hasCheckoutPreviewPrerequisites(shippingAddressId);

  const previewQuery = useCheckoutPreview(checkoutPayload, canPreview, previewRequestSignature);
  const summaryTotals = useMemo(() => {
    if (!cart) {
      return null;
    }

    return orderPreview ? buildCheckoutPreviewTotals(orderPreview, cart.totalItems) : cart;
  }, [cart, orderPreview]);

  useEffect(() => {
    if (!selectedCarrierId) {
      setCarrierSelectionError(null);
      return;
    }

    if (carriersQuery.isLoading || carriersQuery.isError) {
      return;
    }

    if (carrierOptions.some((carrier) => carrier.id === selectedCarrierId)) {
      setCarrierSelectionError(null);
      return;
    }

    setSelectedCarrierId('');
    setOrderPreview(null);
    setCarrierSelectionError(
      carrierOptions.length === 0
        ? 'The saved carrier is no longer available for checkout. Shipping has been reset to the backend fallback until another carrier is offered.'
        : 'The saved carrier is no longer available. Choose another carrier to refresh the live shipping quote.',
    );
  }, [
    carrierOptions,
    carriersQuery.isError,
    carriersQuery.isLoading,
    selectedCarrierId,
    setCarrierSelectionError,
    setOrderPreview,
    setSelectedCarrierId,
  ]);

  const summaryValueOverrides = useMemo<CheckoutSummaryValueOverrides | undefined>(() => {
    if (!cart) {
      return undefined;
    }

    if (!hasCheckoutPreviewPrerequisites(shippingAddressId)) {
      return {
        shippingFee: 'Select address',
        discountTotal: 'Pending quote',
        grandTotal: 'Pending quote',
      };
    }

    if (carriersQuery.isError) {
      return {
        shippingFee: 'Carrier error',
        discountTotal: 'Pending quote',
        grandTotal: 'Pending quote',
      };
    }

    if (carrierSelectionRequired && !selectedCarrierId) {
      return {
        shippingFee: 'Select carrier',
        discountTotal: 'Pending quote',
        grandTotal: 'Pending quote',
      };
    }

    if (carrierSelectionError) {
      return {
        shippingFee: 'Carrier unavailable',
        discountTotal: 'Pending quote',
        grandTotal: 'Pending quote',
      };
    }

    if (previewError) {
      return {
        shippingFee: 'Quote failed',
        discountTotal: 'Pending quote',
        grandTotal: 'Pending quote',
      };
    }

    if ((previewLoading || previewQuery.isFetching) && !orderPreview) {
      return {
        shippingFee: 'Refreshing quote',
        discountTotal: 'Refreshing quote',
        grandTotal: 'Refreshing quote',
      };
    }

    if (!orderPreview) {
      return {
        shippingFee: 'Pending quote',
        discountTotal: 'Pending quote',
        grandTotal: 'Pending quote',
      };
    }

    return undefined;
  }, [
    carrierSelectionError,
    carrierSelectionRequired,
    carriersQuery.isError,
    orderPreview,
    previewError,
    previewLoading,
    previewQuery.isFetching,
    selectedCarrierId,
    shippingAddressId,
    cart,
  ]);

  return {
    canPreview,
    carrierOptions,
    carrierSelectionError,
    carrierSelectionRequired,
    carriersQuery,
    checkoutPayload,
    previewQuery,
    previewRequestSignature,
    previewValueOverrides: summaryValueOverrides,
    previewLoading,
    previewError,
    selectedCarrier,
    summaryTotals,
  };
};

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
