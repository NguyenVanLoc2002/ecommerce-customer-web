import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { OrderListItemResponse, OrderResponse } from '@/shared/types/commerce.types';

const apiClientMock = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
}));

vi.mock('@/shared/lib/axios', () => ({ apiClient: apiClientMock }));

import { ordersService } from './ordersService';

const listItem: OrderListItemResponse = {
  id: 'order-1',
  orderCode: 'FS-001',
  status: 'PENDING',
  paymentMethod: 'COD',
  paymentStatus: 'PENDING',
  totalItems: 2,
  totalAmount: 300000,
  createdAt: '2026-11-08T00:00:00Z',
};

const orderResponse: OrderResponse = {
  id: 'order-1',
  orderCode: 'FS-001',
  customerId: 'customer-1',
  status: 'PENDING',
  paymentMethod: 'COD',
  paymentStatus: 'PENDING',
  carrierId: null,
  carrierCode: null,
  carrierName: null,
  carrierProviderType: null,
  shippingReceiverName: 'Customer',
  shippingPhoneNumber: '0900000000',
  shippingStreetAddress: '1 Main Street',
  shippingWard: 'Ward 1',
  shippingDistrict: 'District 1',
  shippingCity: 'Ho Chi Minh City',
  shippingPostalCode: null,
  subTotal: 300000,
  discountAmount: 0,
  shippingFee: 0,
  totalAmount: 300000,
  voucherCode: null,
  customerNote: null,
  items: [],
  createdAt: '2026-11-08T00:00:00Z',
};

describe('ordersService', () => {
  beforeEach(() => vi.clearAllMocks());

  it('loads and maps the paginated customer order archive', async () => {
    apiClientMock.get.mockResolvedValue({
      items: [listItem],
      page: 0,
      size: 20,
      totalItems: 1,
      totalPages: 1,
      hasNext: false,
      hasPrevious: false,
    });

    const orders = await ordersService.getOrders();

    expect(apiClientMock.get).toHaveBeenCalledWith('/orders');
    expect(orders.items).toMatchObject([{ id: 'order-1', code: 'FS-001', canCancel: true, grandTotal: 300000 }]);
  });

  it('loads a detail and posts a cancellation to the customer-only endpoint', async () => {
    apiClientMock.get.mockResolvedValue(orderResponse);
    apiClientMock.post.mockResolvedValue(orderResponse);

    await expect(ordersService.getOrderById('order-1')).resolves.toMatchObject({ id: 'order-1', code: 'FS-001' });
    await expect(ordersService.cancelOrder('order-1')).resolves.toMatchObject({ id: 'order-1', status: 'PENDING' });
    expect(apiClientMock.get).toHaveBeenCalledWith('/orders/order-1');
    expect(apiClientMock.post).toHaveBeenCalledWith('/orders/my/order-1/cancel');
  });
});
