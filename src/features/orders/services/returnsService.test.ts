import { expect, it, vi } from 'vitest';

import type { CreateReturnRequest } from '../types/returns.types';

const apiClient = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn() }));
vi.mock('@/shared/lib/axios', () => ({ apiClient }));

import { returnsService } from './returnsService';

it('reads return eligibility and detail from the order-scoped endpoints', async () => {
  const signal = new AbortController().signal;
  await returnsService.getForOrder('order-1', signal);
  await returnsService.getDetail('order-1', 'return-1', signal);
  expect(apiClient.get).toHaveBeenNthCalledWith(1, '/orders/order-1/returns', { signal });
  expect(apiClient.get).toHaveBeenNthCalledWith(2, '/orders/order-1/returns/return-1', { signal });
});

it('sends only the selected return quantity with the supplied attempt key', async () => {
  const payload: CreateReturnRequest = {
    reason: 'DEFECTIVE',
    note: 'Damaged seam',
    originalCondition: false,
    unopened: false,
    items: [{ orderItemId: 'item-1', quantity: 1 }],
  };
  await returnsService.create('order-1', payload, 'return-attempt-1');
  expect(apiClient.post).toHaveBeenCalledWith('/orders/order-1/returns', payload, {
    headers: { 'Idempotency-Key': 'return-attempt-1' },
  });
});
