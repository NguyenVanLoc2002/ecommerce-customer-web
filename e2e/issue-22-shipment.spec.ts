import { expect, test, type Page } from '@playwright/test';

const orderId = 'e3531a04-5c7e-4d1b-855b-c5e6088acdeb';
const orderPath = '/orders/' + orderId;
const trackingPath = orderPath + '/tracking';
const shipmentPath = '/shipments/order/' + orderId;
const createdAt = '2026-11-20T09:00:00Z';
const latestAt = '2026-11-25T12:30:00Z';
const orderCode = 'FS-22001';
const trackingNumber = 'TRACK-22001';
const trackingUrl = 'https://carrier.example.test/track/22001';
const trackingAction = 'Theo dõi vận chuyển';
const navigation = { waitUntil: 'domcontentloaded' } as const;

const envelope = (data: unknown) => ({ success: true, code: 'SUCCESS', data });
const error = (code: string) => ({ success: false, code });

const order = (status: string) => ({
  id: orderId, orderCode, status, paymentMethod: 'COD', paymentStatus: 'PENDING',
  canCancel: false, carrierName: 'Vận chuyển mẫu', shippingReceiverName: 'Khách mẫu',
  shippingPhoneNumber: '0900000000', shippingStreetAddress: '10 Đường Mẫu',
  shippingWard: 'Phường Mẫu', shippingDistrict: 'Quận Mẫu', shippingCity: 'Hà Nội', subTotal: 1290000, discountAmount: 0, shippingFee: 30000,
  totalAmount: 1320000, createdAt, updatedAt: latestAt, items: [{
    id: 'item-22', productId: 'product-22', productName: 'Áo blazer dáng suông',
    quantity: 1, unitPrice: 1290000, lineTotal: 1290000, variantName: 'Xám / M',
    productImageUrl: '/src/features/home/assets/home-editorial-approved.jpg',
  }],
});

const shipment = (status: string) => ({
  id: 'shipment-22', orderId, orderCode, shipmentCode: 'SHP-22001', carrier: 'Vận chuyển mẫu',
  trackingNumber, providerTrackingUrl: trackingUrl, status, shippingFee: 30000,
  estimatedDeliveryDate: null, deliveredAt: status === 'DELIVERED' ? latestAt : null,
  createdAt, updatedAt: latestAt,
  events: [
    { id: 'start-22', status: 'PENDING', location: null, description: 'Đã tạo vận đơn', eventTime: createdAt },
    { id: 'latest-22', status, location: null, description: 'Mốc vận chuyển từ API', eventTime: latestAt },
  ],
});

const installRoutes = async (page: Page, orderStatus = 'PROCESSING') => {
  await page.route('**/api/v1/**', (route) => {
    const path = new URL(route.request().url()).pathname.slice('/api/v1'.length);
    if (path === '/auth/refresh-token') {
      return route.fulfill({ json: envelope({ accessToken: 'fixture-token', tokenType: 'Bearer', expiresIn: 900 }) });
    }
    if (path === '/me') {
      return route.fulfill({ json: envelope({ id: 'customer-22', customerId: 'customer-22', roles: ['CUSTOMER'], status: 'ACTIVE' }) });
    }
    if (path === orderPath) return route.fulfill({ json: envelope(order(orderStatus)) });
    if (path === '/payments/order/' + orderId) {
      return route.fulfill({ status: 404, json: error('PAYMENT_NOT_FOUND') });
    }
    return route.fulfill({ json: envelope({ items: [], totalItems: 0 }) });
  });
};

const lifecycle = [
  ['PENDING', 'PROCESSING', 'Chờ lấy hàng'],
  ['PICKING', 'PROCESSING', 'Đang lấy hàng'],
  ['IN_TRANSIT', 'SHIPPED', 'Đang vận chuyển'],
  ['OUT_FOR_DELIVERY', 'SHIPPED', 'Đang giao hàng'],
  ['DELIVERED', 'DELIVERED', 'Đã giao hàng'],
] as const;

for (const [status, orderStatus, label] of lifecycle) {
  test('opens tracking for ' + status, async ({ page }) => {
    await installRoutes(page, orderStatus);
    await page.route('**/api/v1' + shipmentPath, (route) => route.fulfill({ json: envelope(shipment(status)) }));

    await page.goto(orderPath, navigation);
    await expect(page.getByText('Order payment status: Pending')).toBeVisible();
    await page.getByRole('link', { name: trackingAction }).click();
    await expect(page).toHaveURL(trackingPath);
    await expect(page.locator('[aria-current="step"]')).toContainText(label);
    await expect(page.getByRole('button', { name: trackingNumber })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Tra cứu tại đơn vị vận chuyển' })).toHaveAttribute('href', trackingUrl);
  });
}

const exceptions = [
  ['FAILED', 'DELIVERY_FAILED', 'Giao hàng thất bại'],
  ['FAILED', 'CARRIER_CANCELLED', 'Đơn vị vận chuyển đã hủy vận đơn'],
  ['RETURNED', null, 'Đã hoàn về người gửi'],
] as const;

for (const [status, attention, title] of exceptions) {
  test('shows ' + (attention ?? status) + ' on order detail and tracking', async ({ page }) => {
    await installRoutes(page, 'SHIPPED');
    await page.route('**/api/v1' + shipmentPath, (route) => route.fulfill({
      json: envelope({ ...shipment(status), attention, trackingNumber: null, providerTrackingUrl: null }),
    }));
    for (const [width, device] of [[1280, 'desktop'], [390, 'mobile']] as const) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(orderPath, navigation);
      const notice = page.getByRole('status').filter({ hasText: title });
      await expect(notice).toContainText('Mốc vận chuyển từ API');
      await expect(notice).toContainText('Liên hệ bộ phận hỗ trợ');
      await expect(page.getByText('Order payment status: Pending')).toBeVisible();
      await expect(page.getByRole('button', { name: 'Hủy đơn hàng', exact: true })).toHaveCount(0);
      await expect(page.getByText('Your shipment is in transit with the carrier.')).toHaveCount(0);
      await expect(page.getByText('Đang tải giao dịch…')).toHaveCount(0);
      await page.evaluate(() => document.fonts.ready);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
      if (attention === 'CARRIER_CANCELLED') {
        await page.screenshot({ path: test.info().outputPath('detail-' + device + '.png'), fullPage: true });
      }

      await page.getByRole('link', { name: trackingAction }).click();
      await expect(page.getByRole('status').filter({ hasText: title })).toContainText('Mốc mới nhất');
      await expect(page.getByRole('region', { name: 'Hành trình vận chuyển' })
        .getByText(title, { exact: true })).toBeVisible();
      await expect(page.getByText('Chưa có mã theo dõi')).toBeVisible();
      await expect(page.getByRole('link', { name: 'Tra cứu tại đơn vị vận chuyển' })).toHaveCount(0);
      await expect(page.locator('[aria-current="step"]')).toHaveCount(0);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
      if (attention === 'CARRIER_CANCELLED') {
        await page.screenshot({ path: test.info().outputPath('tracking-' + device + '.png'), fullPage: true });
      }
    }
  });
}

test('shows empty shipment on detail and direct tracking without offering a tracking link', async ({ page }) => {
  await installRoutes(page);
  await page.route('**/api/v1' + shipmentPath, (route) => route.fulfill({ status: 404, json: error('SHIPMENT_NOT_FOUND') }));

  await page.goto(orderPath, navigation);
  await expect(page.getByText('Chưa tạo vận đơn.', { exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: trackingAction })).toHaveCount(0);
  await page.goto(trackingPath, navigation);
  await expect(page.getByRole('heading', { name: 'Chưa tạo vận đơn.' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Xem chi tiết đơn hàng' })).toHaveAttribute('href', orderPath);
});

test('keeps loading and retry local to shipment', async ({ page }) => {
  await installRoutes(page);
  let status = 502;
  let release: () => void = () => undefined;
  const responseReady = new Promise<void>((resolve) => { release = resolve; });
  await page.route('**/api/v1' + shipmentPath, async (route) => {
    await responseReady;
    return status === 200
      ? route.fulfill({ json: envelope(shipment('PICKING')) })
      : route.fulfill({ status, json: error('REQUEST_FAILED') });
  });

  await page.goto(orderPath, { waitUntil: 'domcontentloaded' });
  await expect(page.getByText('Đang tải vận đơn…')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Đơn hàng #' + orderCode })).toBeVisible();
  release();
  await expect(page.getByText('Chưa tải được vận đơn.')).toBeVisible();
  status = 200;
  await page.getByRole('button', { name: 'Thử lại' }).click();
  await expect(page.getByRole('link', { name: trackingAction })).toBeVisible();
});

test('shows an unavailable order when shipment access is denied', async ({ page }) => {
  await installRoutes(page);
  await page.route('**/api/v1' + shipmentPath, (route) => route.fulfill({ status: 404, json: error('ORDER_NOT_FOUND') }));
  await page.goto(trackingPath, navigation);
  await expect(page.getByRole('heading', { name: 'Không tìm thấy đơn hàng.' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Về danh sách đơn hàng' })).toHaveAttribute('href', '/orders');
  await expect(page.getByText('Mã theo dõi')).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Xem chi tiết đơn hàng' })).toHaveCount(0);

  await page.route('**/api/v1' + orderPath, (route) => route.fulfill({ status: 404, json: error('ORDER_NOT_FOUND') }));
  let shipmentRequests = 0;
  page.on('request', (request) => {
    if (new URL(request.url()).pathname.endsWith(shipmentPath)) shipmentRequests += 1;
  });
  await page.goto(orderPath, navigation);
  await expect(page.getByText('Order detail unavailable')).toBeVisible();
  await expect(page.getByRole('link', { name: trackingAction })).toHaveCount(0);
  expect(shipmentRequests).toBe(0);
});
