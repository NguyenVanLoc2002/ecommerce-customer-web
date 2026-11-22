import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { CartResponse } from '@/shared/types/commerce.types';

const apiClientMock = vi.hoisted(() => ({
  delete: vi.fn(),
  get: vi.fn(),
  patch: vi.fn(),
  post: vi.fn(),
}));

vi.mock('@/shared/lib/axios', () => ({ apiClient: apiClientMock }));

import { cartService } from './cartService';

const cartResponse: CartResponse = {
  id: 'cart-1',
  items: [
    {
      id: 'line-1',
      variantId: 'variant-1',
      variantName: 'Black / M',
      sku: 'SKU-1',
      productId: 'product-1',
      productSlug: 'black-shirt',
      productName: 'Black Shirt',
      brandName: 'Fashion Shop',
      productImageUrl: null,
      unitPrice: 200000,
      salePrice: 150000,
      quantity: 2,
      availableStock: 4,
      lineTotal: 300000,
      createdAt: '2026-11-08T00:00:00Z',
    },
  ],
  totalItems: 2,
  subTotal: 300000,
  updatedAt: '2026-11-08T00:00:00Z',
};

describe('cartService', () => {
  beforeEach(() => vi.clearAllMocks());

  it('loads and maps the server cart', async () => {
    apiClientMock.get.mockResolvedValue(cartResponse);

    const cart = await cartService.getCart();

    expect(apiClientMock.get).toHaveBeenCalledWith('/cart');
    expect(cart).toMatchObject({
      id: 'cart-1',
      grandTotal: 300000,
      items: [{ variantId: 'variant-1', unitPrice: 150000, stockAvailable: 4 }],
    });
  });

  it('uses the documented item endpoints for add, quantity update, and removal', async () => {
    apiClientMock.post.mockResolvedValue(cartResponse);
    apiClientMock.patch.mockResolvedValue(cartResponse);
    apiClientMock.delete.mockResolvedValue(cartResponse);

    await cartService.addItem('variant-1', 2);
    await cartService.updateQuantity('line-1', 3);
    await cartService.removeItem('line-1');

    expect(apiClientMock.post).toHaveBeenCalledWith('/cart/items', { variantId: 'variant-1', quantity: 2 });
    expect(apiClientMock.patch).toHaveBeenCalledWith('/cart/items/line-1', { quantity: 3 });
    expect(apiClientMock.delete).toHaveBeenCalledWith('/cart/items/line-1');
  });

  it('clears the server cart and returns an empty local snapshot', async () => {
    apiClientMock.delete.mockResolvedValue(null);

    const cart = await cartService.clearCart();

    expect(apiClientMock.delete).toHaveBeenCalledWith('/cart');
    expect(cart).toMatchObject({ items: [], totalItems: 0, grandTotal: 0, staleItemCount: 0 });
  });
});
