const CART_STOCK_CONFLICT_CODES = new Set(['INVENTORY_NOT_ENOUGH', 'VARIANT_OUT_OF_STOCK', 'STOCK_RESERVATION_FAILED']);

export const isCartStockConflict = (error: unknown): boolean => {
  if (!(error instanceof Error) || !('code' in error)) {
    return false;
  }

  return typeof error.code === 'string' && CART_STOCK_CONFLICT_CODES.has(error.code);
};
