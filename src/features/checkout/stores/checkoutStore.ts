import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { config } from '@/constants/config';
import type { CheckoutDraft, CommerceOrder, VoucherPreview } from '@/shared/types/commerce.types';
import { PAYMENT_METHODS } from '@/shared/types/enums';

const defaultDraft: CheckoutDraft = {
  shippingAddressId: '',
  paymentMethod: PAYMENT_METHODS.COD,
  customerNote: '',
  voucherCode: '',
  voucherPreview: null,
};

type CheckoutState = CheckoutDraft & {
  confirmationOrder: CommerceOrder | null;
  setShippingAddressId: (value: string) => void;
  setPaymentMethod: (value: CheckoutDraft['paymentMethod']) => void;
  setCustomerNote: (value: string) => void;
  setVoucherCode: (value: string) => void;
  setVoucherPreview: (value: VoucherPreview | null) => void;
  setConfirmationOrder: (value: CommerceOrder | null) => void;
  resetCheckout: () => void;
};

export const useCheckoutStore = create<CheckoutState>()(
  persist(
    (set) => ({
      ...defaultDraft,
      confirmationOrder: null,
      setShippingAddressId: (shippingAddressId) => set({ shippingAddressId }),
      setPaymentMethod: (paymentMethod) => set({ paymentMethod }),
      setCustomerNote: (customerNote) => set({ customerNote }),
      setVoucherCode: (voucherCode) => set({ voucherCode }),
      setVoucherPreview: (voucherPreview) => set({ voucherPreview }),
      setConfirmationOrder: (confirmationOrder) => set({ confirmationOrder }),
      resetCheckout: () => set({ ...defaultDraft, confirmationOrder: null }),
    }),
    {
      name: config.checkoutDraftKey,
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
