import { describe, expect, it } from 'vitest';

import { createServiceError } from '@/shared/lib/serviceError';

import { isCartStockConflict } from './cartErrors';

describe('isCartStockConflict', () => {
  it.each(['INVENTORY_NOT_ENOUGH', 'VARIANT_OUT_OF_STOCK', 'STOCK_RESERVATION_FAILED'])(
    'recognizes %s from the cart API',
    (code) => {
      expect(isCartStockConflict(createServiceError(code, 'Stock changed.'))).toBe(true);
    },
  );

  it('does not treat unrelated service errors as stock conflicts', () => {
    expect(isCartStockConflict(createServiceError('CART_ITEM_NOT_FOUND', 'Item missing.'))).toBe(false);
    expect(isCartStockConflict(new Error('Unknown error'))).toBe(false);
  });
});
