import { beforeEach, describe, expect, it, vi } from 'vitest';

import { queryKeys } from '@/constants/queryKeys';
import { useDeleteAddress, useUpdateAddress } from '@/shared/hooks/useAddresses';

const mocks = vi.hoisted(() => ({
  mutation: vi.fn(),
  resetQueries: vi.fn(),
  invalidateQueries: vi.fn(),
  getCheckout: vi.fn(),
  setCheckout: vi.fn(),
}));

vi.mock('@tanstack/react-query', () => ({
  useMutation: mocks.mutation,
  useQuery: vi.fn(),
  useQueryClient: () => ({ resetQueries: mocks.resetQueries, invalidateQueries: mocks.invalidateQueries }),
}));
vi.mock('@/shared/services/addressService', () => ({ addressService: {} }));
vi.mock('@/features/checkout/stores/checkoutStore', () => ({
  useCheckoutStore: { getState: mocks.getCheckout, setState: mocks.setCheckout },
}));

const success = (...args: unknown[]) => {
  const options = mocks.mutation.mock.lastCall?.[0] as { onSuccess: (...args: unknown[]) => void };
  options.onSuccess(...args);
};

describe('checkout quotes after address changes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getCheckout.mockReturnValue({ shippingAddressId: 'selected' });
  });

  it('clears a saved quote when the same selected address ID is updated', () => {
    useUpdateAddress();
    success({ id: 'selected' });
    expect(mocks.setCheckout).toHaveBeenCalledWith({ orderPreview: null, previewError: null });
    expect(mocks.resetQueries).toHaveBeenCalledWith({ queryKey: queryKeys.checkout.previews });
  });

  it('requires a new selection if the checkout address is deleted', () => {
    useDeleteAddress();
    success(undefined, 'selected');
    expect(mocks.setCheckout).toHaveBeenCalledWith({ shippingAddressId: '', orderPreview: null, previewError: null });
    expect(mocks.resetQueries).toHaveBeenCalledWith({ queryKey: queryKeys.checkout.previews });
  });

  it('invalidates other cached quotes without clearing the active checkout selection', () => {
    useUpdateAddress();
    success({ id: 'other' });
    expect(mocks.setCheckout).not.toHaveBeenCalled();
    expect(mocks.resetQueries).toHaveBeenCalledWith({ queryKey: queryKeys.checkout.previews });
  });
});
