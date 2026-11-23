import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

import { expect, test, type Page } from '@playwright/test';

const orderId = 'order-hold-review';
const evidenceDirectory = resolve(process.cwd(), 'artifacts/issue-28/implementation');

const apiEnvelope = <T,>(data: T) => ({ success: true, code: 'SUCCESS', message: 'ok', data, timestamp: '2026-11-23T00:00:00Z' });

const cancelledOrder = (paymentStatus: string) => ({
  id: orderId,
  orderCode: 'FS-28001',
  customerId: 'customer-review',
  status: 'CANCELLED',
  paymentMethod: 'ONLINE',
  paymentStatus,
  carrierId: null,
  carrierCode: null,
  carrierName: null,
  carrierProviderType: null,
  shippingReceiverName: 'Demo Customer',
  shippingPhoneNumber: '0900000000',
  shippingStreetAddress: '10 Sample Street',
  shippingWard: 'Ward 1',
  shippingDistrict: 'District 1',
  shippingCity: 'Ho Chi Minh City',
  shippingPostalCode: null,
  subTotal: 2210000,
  discountAmount: 0,
  shippingFee: 0,
  totalAmount: 2210000,
  voucherCode: null,
  customerNote: null,
  items: [
    {
      id: 'item-review',
      productId: 'product-review',
      productSlug: 'linen-shirt',
      productName: 'Linen shirt',
      brandName: 'Fashion Shop',
      variantId: 'variant-review',
      variantName: 'Natural / M',
      sku: 'LINEN-M',
      unitPrice: 2210000,
      salePrice: null,
      quantity: 1,
      lineTotal: 2210000,
      productImageUrl: null,
    },
  ],
  createdAt: '2026-11-23T00:00:00Z',
  updatedAt: '2026-11-23T00:30:00Z',
});

const paidPayment = (status: string) => ({
  id: 'payment-review',
  orderId,
  orderCode: 'FS-28001',
  paymentCode: 'PAY-28001',
  method: 'ONLINE',
  provider: 'PAYPAL',
  status,
  amount: 2210000,
  currency: 'VND',
  paidAt: status === 'PAID' ? '2026-11-23T00:20:00Z' : null,
  createdAt: '2026-11-23T00:10:00Z',
  paymentUrl: status === 'PENDING' ? 'https://payments.example.test/continue' : null,
  transactions: status === 'PAID' ? [
    {
      id: 'transaction-review',
      transactionCode: 'TX-28001',
      status: 'SUCCESS',
      amount: 2210000,
      currency: 'VND',
      referenceType: 'LATE_SUCCESS_AFTER_CANCEL',
      referenceId: 'provider-reference-review',
      note: 'Late success after cancellation; manual reconciliation required.',
      createdAt: '2026-11-23T00:20:00Z',
    },
  ] : [],
});

const installAuthenticatedSession = async (page: Page) => {
  await page.route('**/api/v1/auth/refresh-token', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(apiEnvelope({ accessToken: 'review-token', tokenType: 'Bearer', expiresIn: 900 })),
    }),
  );
  await page.route('**/api/v1/me', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(
        apiEnvelope({
          id: 'customer-review',
          email: 'review@example.test',
          firstName: 'Demo',
          lastName: 'Customer',
          phoneNumber: '0900000000',
          status: 'ACTIVE',
          roles: ['CUSTOMER'],
          customerId: 'customer-review',
          gender: null,
          birthDate: null,
          avatarUrl: null,
          loyaltyPoints: 0,
          createdAt: '2026-11-01T00:00:00Z',
        }),
      ),
    }),
  );
};

const installOrderAndPayment = async (page: Page, paymentStatus: string) => {
  await page.route(`**/api/v1/orders/${orderId}`, (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(apiEnvelope(cancelledOrder(paymentStatus))) }));
  await page.route(`**/api/v1/payments/order/${orderId}`, (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(apiEnvelope(paidPayment(paymentStatus))) }));
};

const takeEvidence = async (page: Page, fileName: string, viewportWidth: number) => {
  if (!process.env.E2E_CAPTURE_HOLD_EVIDENCE) return;
  mkdirSync(evidenceDirectory, { recursive: true });
  await page.setViewportSize({ width: viewportWidth, height: viewportWidth > 900 ? 1000 : 900 });
  await page.screenshot({ path: resolve(evidenceDirectory, fileName), fullPage: true });
};

test.beforeEach(async ({ page }) => {
  await installAuthenticatedSession(page);
});

test('late PAID payment stays separate from a cancelled order and has no payment actions', async ({ page }) => {
  await installOrderAndPayment(page, 'PAID');
  await page.goto(`/payment/result?orderId=${orderId}`);

  await expect(page.getByRole('heading', { name: 'Payment received, order cancelled.' })).toBeVisible();
  await expect(page.getByText(/đối soát và hoàn tiền thủ công/i)).toBeVisible();
  await expect(page.getByRole('region', { name: 'Tóm tắt đơn hàng' })).toContainText('Cancelled');
  await expect(page.getByText(/ready for the next fulfillment step/i)).toHaveCount(0);
  await expect(page.getByRole('button', { name: /retry|create .* payment|continue to/i })).toHaveCount(0);

  await takeEvidence(page, 'payment-result-desktop.png', 1280);
  await takeEvidence(page, 'payment-result-mobile.png', 390);
});

test('PayPal return does not capture after the order is cancelled', async ({ page }) => {
  await installOrderAndPayment(page, 'PENDING');
  let captureCount = 0;
  await page.route(`**/api/v1/payments/order/${orderId}/capture`, async (route) => {
    captureCount += 1;
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(apiEnvelope(paidPayment('PAID'))) });
  });

  await page.goto(`/payment/paypal/return?orderId=${orderId}&token=review-provider-token`);
  await expect(page.getByRole('heading', { name: 'Đơn hàng đã hủy, không tiếp tục thanh toán.' })).toBeVisible();
  expect(captureCount).toBe(0);
  await takeEvidence(page, 'paypal-return-desktop.png', 1280);
  await takeEvidence(page, 'paypal-return-mobile.png', 390);
});

test('MoMo return and PayPal cancel keep a late payment out of fulfillment', async ({ page }) => {
  await installOrderAndPayment(page, 'PAID');

  await page.goto(`/payment/momo/return?orderId=${orderId}`);
  await expect(page.getByRole('heading', { name: 'Đã nhận tiền, đơn hàng đã hủy.' })).toBeVisible();
  await expect(page.getByText(/LATE_SUCCESS_AFTER_CANCEL/)).toHaveCount(0);
  await takeEvidence(page, 'momo-return-desktop.png', 1280);
  await takeEvidence(page, 'momo-return-mobile.png', 390);

  await page.goto(`/payment/paypal/cancel?orderId=${orderId}`);
  await expect(page.getByRole('heading', { name: 'Đã nhận tiền, đơn hàng đã hủy.' })).toBeVisible();
  await expect(page.getByRole('link', { name: /Thử lại thanh toán/i })).toHaveCount(0);
  await takeEvidence(page, 'paypal-cancel-desktop.png', 1280);
  await takeEvidence(page, 'paypal-cancel-mobile.png', 390);
});

test('cancelled paid order detail shows both statuses and keeps transaction history visible', async ({ page }) => {
  await installOrderAndPayment(page, 'PAID');
  await page.goto(`/orders/${orderId}`);

  await expect(page.getByText(/Order payment status: PAID/i)).toBeVisible();
  await expect(page.getByText(/Payment record: PAID/i)).toBeVisible();
  await expect(page.getByText(/đối soát và hoàn tiền thủ công/i)).toBeVisible();
  await expect(page.getByRole('link', { name: 'Pay now' })).toHaveCount(0);

  await takeEvidence(page, 'order-detail-desktop.png', 1280);
  await takeEvidence(page, 'order-detail-mobile.png', 390);
});

test('COD confirmation explains the Admin hold without claiming fulfillment confirmation', async ({ page }) => {
  const confirmationOrder = {
    id: orderId,
    code: 'FS-28001',
    status: 'PENDING',
    createdAt: '2026-11-23T00:00:00Z',
    updatedAt: '2026-11-23T00:00:00Z',
    paymentMethod: 'COD',
    paymentStatus: 'PENDING',
    customerNote: '',
    items: [],
    shippingAddress: {
      id: 'address-review',
      receiverName: 'Demo Customer',
      phoneNumber: '0900000000',
      streetAddress: '10 Sample Street',
      ward: 'Ward 1',
      district: 'District 1',
      city: 'Ho Chi Minh City',
      postalCode: '',
      addressType: 'HOME',
      isDefault: false,
      label: '',
      fullAddress: '10 Sample Street, Ward 1, District 1, Ho Chi Minh City',
    },
    canCancel: true,
    totalItems: 0,
    subTotal: 2210000,
    shippingFee: 0,
    discountTotal: 0,
    grandTotal: 2210000,
  };
  await page.addInitScript((order) => {
    localStorage.setItem(
      'fashion-shop.checkout-draft',
      JSON.stringify({ state: { confirmationOrder: order, paymentProvider: 'MOMO' }, version: 0 }),
    );
  }, confirmationOrder);

  await page.goto('/checkout/confirmation');
  await expect(page.getByRole('heading', { name: 'Order placed, awaiting confirmation.' })).toBeVisible();
  await expect(page.getByText(/lên đến 24 giờ/i)).toBeVisible();
  await expect(page.getByText(/chưa bắt đầu xử lý giao hàng/i)).toBeVisible();
  await expect(page.getByRole('button', { name: /Pay with MoMo/i })).toHaveCount(0);

  await takeEvidence(page, 'checkout-confirmation-desktop.png', 1280);
  await takeEvidence(page, 'checkout-confirmation-mobile.png', 390);
});

test('payment routes show separate server statuses and fit desktop and mobile', async ({ page }) => {
  const evidence = process.env.E2E_CAPTURE_PAYMENT_EVIDENCE;
  await page.route(`**/api/v1/orders/${orderId}`, (route) =>
    route.fulfill({
      json: apiEnvelope({
        ...cancelledOrder('PENDING'),
        status: 'AWAITING_PAYMENT',
        items: cancelledOrder('PENDING').items.map((item) => ({
          ...item,
          productImageUrl: '/artifacts/stitch-review/images/photo-0.jpg',
        })),
      }),
    }),
  );
  let captureCount = 0;
  await page.route(`**/api/v1/payments/order/${orderId}/capture`, (route) => {
    captureCount += 1;
    return route.fulfill({ json: apiEnvelope(paidPayment('PENDING')) });
  });
  const screens = [
    ['payment-result', '/payment/result', ''],
    ['momo-return', '/payment/momo/return', '&resultCode=0'],
    ['paypal-return', '/payment/paypal/return', '&token=review-provider-token'],
    ['paypal-cancel', '/payment/paypal/cancel', ''],
  ];
  for (const [screen, path, query] of screens) {
    const provider = screen === 'momo-return' || screen === 'payment-result' ? 'MOMO' : 'PAYPAL';
    await page.route(`**/api/v1/payments/order/${orderId}`, (route) =>
      route.fulfill({ json: apiEnvelope({ ...paidPayment('PENDING'), provider }) }),
    );
    for (const [device, width] of [['desktop', 1280], ['mobile', 390]] as const) {
      await page.setViewportSize({ width, height: device === 'desktop' ? 1000 : 900 });
      await page.goto(`${path}?orderId=${orderId}${query}`);
      await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
      await expect(page.getByText('Awaiting Payment', { exact: true })).toBeVisible();
      await expect(page.getByText('Pending', { exact: true })).toBeVisible();
      await expect(page.getByText('Paid', { exact: true })).toHaveCount(0);
      await expect(page.getByText(/2\.210\.000/).first()).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
      if (evidence) {
        await page.evaluate(() => document.fonts.ready);
        await page.screenshot({ animations: 'disabled', path: resolve(evidence, `${screen}-${device}.png`), fullPage: true });
      }
    }
  }
  expect(captureCount).toBe(2);

  await page.goto(`/payment/paypal/return?orderId=${orderId}`);
  await expect(page.getByRole('heading', { name: 'Thiếu token PayPal' })).toBeVisible();
  expect(captureCount).toBe(2);

  await page.goto('/payment/momo/return');
  await expect(page.getByRole('heading', { name: 'Thiếu mã đơn hàng' })).toBeVisible();

  if (evidence) {
    for (const [screen, path] of screens.slice(1)) {
      await page.goto(`/artifacts/stitch-review/journeys.html#${path}`);
      await page.evaluate(() => document.fonts.ready);
      await page.screenshot({ animations: 'disabled', path: resolve(evidence, `${screen}-design-mobile.png`), fullPage: true });
    }
  }
});

test('payment result renders terminal states and a recoverable API error', async ({ page }) => {
  await page.route(`**/api/v1/orders/${orderId}`, (route) =>
    route.fulfill({ json: apiEnvelope({ ...cancelledOrder('PENDING'), status: 'AWAITING_PAYMENT' }) }),
  );
  for (const [status, label] of [['FAILED', 'Failed'], ['CANCELLED', 'Cancelled'], ['EXPIRED', 'Expired']]) {
    await page.route(`**/api/v1/payments/order/${orderId}`, (route) =>
      route.fulfill({ json: apiEnvelope(paidPayment(status)), status: 200 }),
    );
    await page.goto(`/payment/result?orderId=${orderId}`);
    await expect(page.getByText(label, { exact: true })).toBeVisible();
    await expect(page.getByText('Awaiting Payment', { exact: true })).toBeVisible();
    await expect(page.getByText('Paid', { exact: true })).toHaveCount(0);
  }
  await page.route(`**/api/v1/payments/order/${orderId}`, (route) =>
    route.fulfill({ json: { ...apiEnvelope(null), success: false, code: 'INTERNAL_SERVER_ERROR' }, status: 500 }),
  );
  await page.goto(`/payment/result?orderId=${orderId}`);
  await expect(page.getByRole('alert')).toContainText('Payment lookup failed');
  await expect(page.getByRole('button', { name: 'Retry', exact: true })).toBeVisible();
});
