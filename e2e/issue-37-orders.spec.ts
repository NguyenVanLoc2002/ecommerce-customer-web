import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

import { expect, test, type Page } from '@playwright/test';

const orderId = 'order-lifecycle-review';
const evidenceDirectory = resolve(process.cwd(), 'artifacts/issue-37/implementation');

const apiEnvelope = <T,>(data: T) => ({ success: true, code: 'SUCCESS', message: 'ok', data, timestamp: '2026-11-23T00:00:00Z' });

const order = {
  id: orderId,
  orderCode: 'FS-37001',
  customerId: 'customer-review',
  status: 'COMPLETED',
  paymentMethod: 'ONLINE',
  paymentStatus: 'PAID',
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
      productName: 'Áo sơ mi linen',
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
  totalItems: 1,
};

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



const review = {
  id: 'review-37', orderId, orderItemId: 'previous-order-item', productId: 'product-review',
  productSlug: 'linen-shirt', productName: 'Áo sơ mi linen', rating: 5,
  comment: 'Chất liệu nhẹ và phom dáng vừa vặn.', status: 'PENDING',
  createdAt: order.createdAt,
};
const paged = <T,>(items: T[]) => ({ items, page: 0, size: 20, totalItems: items.length, totalPages: 1, hasNext: false, hasPrevious: false });

test('order lifecycle and review screens render at desktop and mobile widths', async ({ page }) => {
  test.setTimeout(120000);
  await installAuthenticatedSession(page);
  let reviewRequests = 0;
  await page.route('**/api/v1/**', async (route) => {
    const path = new URL(route.request().url()).pathname.slice('/api/v1'.length);
    if (path === '/auth/refresh-token' || path === '/me') return route.fallback();
    let data: unknown;
    if (path === '/orders') data = paged([{
      ...order,
      totalItems: 4,
      totalAmount: 4990000,
      itemsPreview: [
        { ...order.items[0], productImageUrl: '/src/features/home/assets/home-editorial-approved.jpg' },
        { ...order.items[0], id: 'item-preview-2', productName: 'Quần dài xếp ly', variantName: 'Than chì / M', productImageUrl: '/src/features/home/assets/home-hero-approved.jpg', lineTotal: 990000 },
        { ...order.items[0], id: 'item-preview-3', productName: 'Áo blazer dáng suông', variantName: 'Xám đá / M', lineTotal: 1290000 },
      ],
      remainingItemLines: 1,
    }]);
    if (path === '/orders/' + orderId) data = order;
    if (path === '/reviews/my') data = paged([review]);
    if (path === '/reviews' && route.request().method() === 'POST') {
      reviewRequests += 1;
      expect(route.request().postDataJSON()).toEqual({ orderItemId: 'item-review', rating: 5, comment: review.comment });
      data = { ...review, orderItemId: 'item-review' };
    }
    if (path === '/shipments/order/' + orderId) data = {
      id: 'shipment-37', orderId, orderCode: order.orderCode, shipmentCode: 'SHP-37', carrier: 'Vận chuyển mẫu',
      trackingNumber: 'TRACK-37', status: 'IN_TRANSIT', estimatedDeliveryDate: null, deliveredAt: null,
      shippingFee: 0, note: null, events: [{ id: 'event-37', status: 'IN_TRANSIT', location: 'Hà Nội', description: 'Đã bàn giao', eventTime: order.createdAt }],
      createdAt: order.createdAt, updatedAt: order.updatedAt,
    };
    if (path === '/invoices/order/' + orderId) data = { ...order, invoiceCode: 'INV-37', status: 'PAID', issuedAt: order.createdAt, discountAmount: 0 };
    if (path === '/payments/order/' + orderId) return route.fulfill({ status: 404, json: { success: false, code: 'PAYMENT_NOT_FOUND' } });
    return route.fulfill({ json: apiEnvelope(data ?? paged([])) });
  });
  const screens = [
    ['/orders', 'orders', '#FS-37001'],
    ['/orders/' + orderId, 'detail', 'Sản phẩm trong đơn'],
    ['/orders/' + orderId + '/tracking', 'tracking', 'Hành trình vận chuyển'],
    ['/orders/' + orderId + '/invoice', 'invoice', 'Hóa đơn INV-37'],
    ['/orders/' + orderId + '/review', 'review', 'Mức độ hài lòng'],
    ['/profile/reviews', 'my-reviews', 'Chất liệu nhẹ và phom dáng vừa vặn.'],
  ];
  mkdirSync(evidenceDirectory, { recursive: true });
  for (const [width, device] of [[1280, 'desktop'], [390, 'mobile']] as const) {
    await page.setViewportSize({ width, height: 900 });
    for (const [path, screen, content] of screens) {
      await page.goto(path, { waitUntil: 'domcontentloaded' });
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      await expect(page.getByText(content, { exact: true })).toBeVisible();
      if (screen === 'orders') {
        const products = page.getByRole('list', { name: 'Sản phẩm trong đơn' });
        await expect(products.getByRole('listitem')).toHaveCount(3);
        await expect(products.getByText('Quần dài xếp ly')).toBeVisible();
        await expect(page.getByRole('link', { name: 'Xem thêm 1 dòng sản phẩm' })).toHaveAttribute('href', '/orders/' + orderId);
      }
      if (screen === 'detail') await expect(page.getByText('Đang tải giao dịch…')).toHaveCount(0);
      await page.evaluate(() => document.fonts.ready);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
      await page.screenshot({ path: resolve(evidenceDirectory, screen + '-' + device + '.png'), fullPage: true });
    }
  }

  await page.goto('/orders/' + orderId + '/review', { waitUntil: 'domcontentloaded' });
  const submit = page.getByRole('button', { name: 'Gửi đánh giá' });
  await submit.click();
  await expect(page.getByText('Select a rating before you submit.')).toBeVisible();
  expect(reviewRequests).toBe(0);
  await page.getByRole('button', { name: 'Rate 5 stars' }).click();
  await page.getByLabel('Nhận xét').fill(review.comment);
  await submit.click();
  await expect(page.getByText('Review submitted.', { exact: true })).toBeVisible();
  expect(reviewRequests).toBe(1);

  await page.route('**/api/v1/shipments/order/*', (route) =>
    route.fulfill({ status: 404, json: { success: false, code: 'SHIPMENT_NOT_FOUND' } }));
  await page.goto('/orders/' + orderId + '/tracking', { waitUntil: 'domcontentloaded' });
  await expect(page.getByText('Shipment not created yet.')).toBeVisible();

  await page.route('**/api/v1/invoices/order/*', (route) =>
    route.fulfill({ status: 404, json: { success: false, code: 'INVOICE_NOT_FOUND' } }));
  await page.goto('/orders/' + orderId + '/invoice', { waitUntil: 'domcontentloaded' });
  await expect(page.getByText('Invoice not issued yet')).toBeVisible();
  await expect(page.getByRole('button', { name: 'In hóa đơn' })).toBeDisabled();
});
