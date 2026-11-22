import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { config } from '@/constants/config';
import type { CheckoutDraft, CommerceOrder, OrderPreview, VoucherPreview } from '@/shared/types/commerce.types';
import { PAYMENT_METHODS } from '@/shared/types/enums';
import { PAYMENT_PROVIDERS } from '@/shared/types/payment.types';

const defaultDraft: CheckoutDraft = {
  shippingAddressId: '',
  selectedCarrierId: '',
  paymentMethod: PAYMENT_METHODS.COD,
  paymentProvider: PAYMENT_PROVIDERS.MOMO,
  customerNote: '',
  voucherCode: '',
  voucherPreview: null,
};

type CheckoutState = CheckoutDraft & {
  confirmationOrder: CommerceOrder | null;
  orderPreview: OrderPreview | null;
  previewLoading: boolean;
  previewError: string | null;
  previewRequestSignature: string | null;
  carrierSelectionError: string | null;
  setShippingAddressId: (value: string) => void;
  setSelectedCarrierId: (value: string) => void;
  setPaymentMethod: (value: CheckoutDraft['paymentMethod']) => void;
  setPaymentProvider: (value: CheckoutDraft['paymentProvider']) => void;
  setCustomerNote: (value: string) => void;
  setVoucherCode: (value: string) => void;
  setVoucherPreview: (value: VoucherPreview | null) => void;
  setConfirmationOrder: (value: CommerceOrder | null) => void;
  setOrderPreview: (value: OrderPreview | null) => void;
  setPreviewLoading: (value: boolean) => void;
  setPreviewError: (value: string | null) => void;
  setPreviewRequestSignature: (value: string | null) => void;
  setCarrierSelectionError: (value: string | null) => void;
  resetCheckout: () => void;
};

export const useCheckoutStore = create<CheckoutState>()(
  persist(
    (set) => ({
      ...defaultDraft,
      confirmationOrder: null,
      orderPreview: null,
      previewLoading: false,
      previewError: null,
      previewRequestSignature: null,
      carrierSelectionError: null,
      setShippingAddressId: (shippingAddressId) => set({ shippingAddressId }),
      setSelectedCarrierId: (selectedCarrierId) => set({ selectedCarrierId }),
      setPaymentMethod: (paymentMethod) => set({ paymentMethod }),
      setPaymentProvider: (paymentProvider) => set({ paymentProvider }),
      setCustomerNote: (customerNote) => set({ customerNote }),
      setVoucherCode: (voucherCode) => set({ voucherCode }),
      setVoucherPreview: (voucherPreview) => set({ voucherPreview }),
      setConfirmationOrder: (confirmationOrder) => set({ confirmationOrder }),
      setOrderPreview: (orderPreview) => set({ orderPreview }),
      setPreviewLoading: (previewLoading) => set({ previewLoading }),
      setPreviewError: (previewError) => set({ previewError }),
      setPreviewRequestSignature: (previewRequestSignature) => set({ previewRequestSignature }),
      setCarrierSelectionError: (carrierSelectionError) => set({ carrierSelectionError }),
      resetCheckout: () =>
        set({
          ...defaultDraft,
          confirmationOrder: null,
          orderPreview: null,
          previewLoading: false,
          previewError: null,
          previewRequestSignature: null,
          carrierSelectionError: null,
        }),
    }),
    {
      name: config.checkoutDraftKey,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        shippingAddressId: state.shippingAddressId,
        selectedCarrierId: state.selectedCarrierId,
        paymentMethod: state.paymentMethod,
        paymentProvider: state.paymentProvider,
        customerNote: state.customerNote,
        voucherCode: state.voucherCode,
        voucherPreview: state.voucherPreview,
        confirmationOrder: state.confirmationOrder,
        orderPreview: state.orderPreview,
      }),
    },
  ),
);
