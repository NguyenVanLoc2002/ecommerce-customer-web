import type { QueryClient } from '@tanstack/react-query';

import { config } from '@/constants/config';
import { useCheckoutStore } from '@/features/checkout/stores/checkoutStore';
import { useAuthStore } from '@/shared/stores/authStore';

const customerQueryRoots = [
  ['auth'],
  ['addresses'],
  ['cart'],
  ['checkout'],
  ['orders'],
  ['payments'],
  ['invoices'],
  ['shipments'],
  ['reviews'],
  ['notifications'],
] as const;

export const clearCustomerSessionState = async (queryClient: QueryClient) => {
  await Promise.all(customerQueryRoots.map((queryKey) => queryClient.cancelQueries({ queryKey })));
  customerQueryRoots.forEach((queryKey) => {
    queryClient.removeQueries({ queryKey });
  });

  useCheckoutStore.getState().resetCheckout();
  useAuthStore.getState().clearSession();

  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(config.checkoutDraftKey);
  }
};
