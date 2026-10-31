import test from 'node:test';
import assert from 'node:assert/strict';

import { buildCheckoutOrderPayload, buildCheckoutPreviewTotals, buildOrderPreviewFromOrder, hasCheckoutPreviewPrerequisites } from './checkoutOrder';

test('buildCheckoutOrderPayload includes carrierId when a carrier is selected', () => {
  const payload = buildCheckoutOrderPayload({
    shippingAddressId: 'address-1',
    selectedCarrierId: 'carrier-1',
    paymentMethod: 'COD',
    customerNote: 'Leave at reception',
    voucherCode: 'WELCOME',
  });

  assert.deepEqual(payload, {
    shippingAddressId: 'address-1',
    carrierId: 'carrier-1',
    paymentMethod: 'COD',
    customerNote: 'Leave at reception',
    voucherCode: 'WELCOME',
  });
});

test('buildCheckoutOrderPayload omits carrierId when no carrier is selected and never includes pricing fields', () => {
  const payload = buildCheckoutOrderPayload({
    shippingAddressId: 'address-1',
    selectedCarrierId: '   ',
    paymentMethod: 'ONLINE',
    customerNote: '',
    voucherCode: '',
  }) as Record<string, unknown>;

  assert.equal(payload.carrierId, undefined);
  assert.equal('shippingFee' in payload, false);
  assert.equal('totalAmount' in payload, false);
  assert.equal('carrierName' in payload, false);
});

test('buildCheckoutPreviewTotals maps server preview pricing into cart summary totals', () => {
  const totals = buildCheckoutPreviewTotals(
    {
      subTotal: 450000,
      discountAmount: 0,
      shippingFee: 32000,
      totalAmount: 482000,
      shippingServiceName: 'Express',
    },
    3,
  );

  assert.deepEqual(totals, {
    totalItems: 3,
    subTotal: 450000,
    shippingFee: 32000,
    discountTotal: 0,
    grandTotal: 482000,
  });
});

test('buildOrderPreviewFromOrder trusts the persisted order totals over any temporary preview', () => {
  const preview = buildOrderPreviewFromOrder({
    id: 'order-1',
    code: 'FS-001',
    status: 'PENDING',
    createdAt: '2026-05-16T00:00:00Z',
    updatedAt: '2026-05-16T00:00:00Z',
    carrierId: 'carrier-1',
    carrierCode: 'FAST',
    carrierName: 'Fast Express',
    carrierProviderType: 'AHAMOVE',
    paymentMethod: 'COD',
    customerNote: 'Call on arrival',
    voucherCode: 'WELCOME',
    items: [],
    shippingAddress: {
      id: 'address-1',
      receiverName: 'A',
      phoneNumber: '1',
      streetAddress: 'Street',
      ward: 'Ward',
      district: 'District',
      city: 'City',
      postalCode: '',
      addressType: 'HOME',
      isDefault: false,
      label: '',
      fullAddress: 'Street, Ward, District, City',
      createdAt: '2026-05-16T00:00:00Z',
    },
    canCancel: true,
    totalItems: 1,
    subTotal: 450000,
    shippingFee: 28000,
    discountTotal: 0,
    grandTotal: 478000,
  });

  assert.deepEqual(preview, {
    carrierId: 'carrier-1',
    carrierCode: 'FAST',
    carrierName: 'Fast Express',
    carrierProviderType: 'AHAMOVE',
    paymentMethod: 'COD',
    subTotal: 450000,
    discountAmount: 0,
    shippingFee: 28000,
    totalAmount: 478000,
    voucherCode: 'WELCOME',
    customerNote: 'Call on arrival',
  });
});

test('hasCheckoutPreviewPrerequisites requires a selected shipping address', () => {
  assert.equal(hasCheckoutPreviewPrerequisites('address-1'), true);
  assert.equal(hasCheckoutPreviewPrerequisites('   '), false);
});
