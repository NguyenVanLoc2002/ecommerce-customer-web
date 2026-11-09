import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { CheckoutCarrierOptionResponse, OrderPreviewResponse, OrderResponse } from '@/shared/types/commerce.types';

const apiClientMock = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
}));

vi.mock('@/shared/lib/axios', () => ({ apiClient: apiClientMock }));

import { checkoutService } from './checkoutService';

const previewResponse: OrderPreviewResponse = {
  carrierId: 'carrier-1',
  carrierCode: 'EXPRESS',
  carrierName: 'Express',
  carrierProviderType: 'AHAMOVE',
  shippingServiceName: 'Same day',
  paymentMethod: 'ONLINE',
  subTotal: 300000,
  discountAmount: 0,
  shippingFee: 30000,
  totalAmount: 330000,
  voucherCode: null,
  customerNote: 'Leave at reception',
};

const orderResponse: OrderResponse = {
  id: 'order-1',
  orderCode: 'FS-001',
  customerId: 'customer-1',
  status: 'AWAITING_PAYMENT',
  paymentMethod: 'ONLINE',
  paymentStatus: 'PENDING',
  carrierId: 'carrier-1',
  carrierCode: 'EXPRESS',
  carrierName: 'Express',
  carrierProviderType: 'AHAMOVE',
  shippingReceiverName: 'Customer',
  shippingPhoneNumber: '0900000000',
  shippingStreetAddress: '1 Main Street',
  shippingWard: 'Ward 1',
  shippingDistrict: 'District 1',
  shippingCity: 'Ho Chi Minh City',
  shippingPostalCode: null,
  subTotal: 300000,
  discountAmount: 0,
  shippingFee: 30000,
  totalAmount: 330000,
  voucherCode: null,
  customerNote: 'Leave at reception',
  items: [],
  createdAt: '2026-11-08T00:00:00Z',
};

describe('checkoutService', () => {
  beforeEach(() => vi.clearAllMocks());

  it('loads carrier options and maps the server response', async () => {
    const carriers: CheckoutCarrierOptionResponse[] = [
      { id: 'carrier-1', code: 'EXPRESS', name: 'Express', providerType: 'AHAMOVE', logoUrl: null, description: null },
    ];
    apiClientMock.get.mockResolvedValue(carriers);

    await expect(checkoutService.getCheckoutCarrierOptions()).resolves.toEqual([
      { id: 'carrier-1', code: 'EXPRESS', name: 'Express', providerType: 'AHAMOVE', logoUrl: null, description: null },
    ]);
    expect(apiClientMock.get).toHaveBeenCalledWith('/carriers/checkout-options');
  });

  it('sends the preview payload unchanged so server pricing remains authoritative', async () => {
    const payload = {
      shippingAddressId: 'address-1',
      carrierId: 'carrier-1',
      paymentMethod: 'ONLINE' as const,
      customerNote: 'Leave at reception',
      voucherCode: 'WELCOME',
    };
    apiClientMock.post.mockResolvedValue(previewResponse);

    await expect(checkoutService.previewOrder(payload)).resolves.toMatchObject({ totalAmount: 330000, shippingFee: 30000 });
    expect(apiClientMock.post).toHaveBeenCalledWith('/orders/preview', payload);
  });

  it('places an order with its action-specific idempotency key', async () => {
    const payload = {
      shippingAddressId: 'address-1',
      carrierId: 'carrier-1',
      paymentMethod: 'ONLINE' as const,
      customerNote: '',
      voucherCode: '',
    };
    apiClientMock.post.mockResolvedValue(orderResponse);

    await expect(checkoutService.placeOrder(payload, 'checkout-attempt-1')).resolves.toMatchObject({ id: 'order-1', grandTotal: 330000 });
    expect(apiClientMock.post).toHaveBeenCalledWith('/orders', payload, {
      headers: { 'Idempotency-Key': 'checkout-attempt-1' },
    });
  });
});
