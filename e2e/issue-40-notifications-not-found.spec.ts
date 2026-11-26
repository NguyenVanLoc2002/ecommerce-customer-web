import { resolve } from 'node:path';

import { expect, test, type Page, type Route } from '@playwright/test';

const now = '2026-11-26T08:00:00Z';
const orderId = '34bf4071-1d1e-4e9a-9183-2d831ddaed7b';

const profile = {
  id: 'visual-customer', customerId: 'visual-customer', firstName: 'Mai', lastName: 'Trần',
  email: 'mai@example.test', status: 'ACTIVE', roles: ['CUSTOMER'], avatarUrl: null, createdAt: now,
};

const notification = (id: string, type: string, title: string, body: string, referenceType: string | null, referenceId: string | null, read = false, createdAt = now) =>
  ({ id, type, title, body, referenceType, referenceId, read, readAt: read ? createdAt : null, createdAt });

const initialNotifications = [
  notification('shipping', 'ORDER_SHIPPED', 'Kiện hàng #FS-89421 đang được giao', 'Đơn hàng đang trên đường giao. Bạn có thể xem tiến trình vận chuyển trong chi tiết đơn hàng.', 'ORDER', orderId),
  notification('payment', 'PAYMENT_RECEIVED', 'Đã nhận thanh toán cho đơn #FS-89421', 'Giao dịch đã được ghi nhận. Kiểm tra trạng thái thanh toán trong đơn hàng.', 'ORDER', orderId),
  notification('order', 'ORDER_CONFIRMED', 'Đơn hàng #FS-89421 đã được xác nhận', 'Fashion Shop đang chuẩn bị đơn hàng của bạn.', 'ORDER', orderId, true, '2026-11-24T08:00:00Z'),
  notification('voucher', 'VOUCHER_RECEIVED', 'Bạn có một ưu đãi mới', 'Bạn vừa nhận được ưu đãi dành cho khách hàng Fashion Shop.', 'VOUCHER', 'voucher-1', false, '2026-11-24T07:30:00Z'),
  notification('security', 'SECURITY', 'Xác nhận hoạt động tài khoản', 'Bạn có một cập nhật về bảo mật tài khoản.', null, null, true, '2026-11-24T07:00:00Z'),
  notification('unknown', 'NEW_SERVER_TYPE', 'Thông báo từ hệ thống', 'Thông báo vẫn có thể đọc khi tham chiếu chưa được hỗ trợ.', 'PAYMENT', 'not-an-order'),
  notification('invalid', 'ORDER_CONFIRMED', 'Tham chiếu không hợp lệ', 'Không mở đường dẫn tương đối nhận từ dữ liệu.', 'ORDER', '../profile', true),
];

const ok = (route: Route, data: unknown) =>
  route.fulfill({ json: { success: true, code: 'SUCCESS', message: 'ok', data, timestamp: now } });
const fail = (route: Route, status = 500) =>
  route.fulfill({ status, json: { success: false, code: status === 404 ? 'NOT_FOUND' : 'TEST_ERROR', message: 'Fixture failure', timestamp: now } });

const loadSession = async (page: Page) => {
  await page.route('**/api/v1/**', (route) => ok(route, []));
  await page.route('**/api/v1/auth/refresh-token', (route) => ok(route, { accessToken: 'review-session', tokenType: 'Bearer', expiresIn: 900 }));
  await page.route('**/api/v1/me', (route) => ok(route, profile));
  await page.clock.setFixedTime(new Date(now));
};

const mockNotifications = async (page: Page, options: { empty?: boolean; failSingle?: boolean } = {}) => {
  let items = options.empty ? [] : structuredClone(initialNotifications);
  let attempts = 0;
  let allAttempts = 0;
  let release = () => {};
  let pending = new Promise<void>((resolve) => { release = resolve; });
  const mark = (item: (typeof items)[number]) => ({ ...item, read: true, readAt: item.readAt ?? now });

  await page.route('**/api/v1/notifications?*', (route) => {
    expect(route.request().method()).toBe('GET');
    expect(route.request().headers().authorization).toBe('Bearer review-session');
    expect(new URL(route.request().url()).searchParams).toEqual(new URLSearchParams({ page: '0', size: '20', sort: 'createdAt,desc' }));
    return ok(route, { items, page: 0, size: 20, totalItems: items.length, totalPages: 1, hasNext: false, hasPrevious: false });
  });
  await page.route('**/api/v1/notifications/unread-count', (route) => ok(route, { count: items.filter(({ read }) => !read).length }));
  await page.route('**/api/v1/notifications/shipping/read', async (route) => {
    expect(route.request().method()).toBe('PATCH');
    expect(route.request().postDataJSON()).toEqual({});
    attempts += 1;
    await pending;
    if (options.failSingle && attempts === 1) return fail(route);
    items = items.map((item) => item.id === 'shipping' ? mark(item) : item);
    return ok(route, items.find(({ id }) => id === 'shipping'));
  });
  await page.route('**/api/v1/notifications/read-all', (route) => {
    expect(route.request().method()).toBe('PATCH');
    expect(route.request().postDataJSON()).toEqual({});
    allAttempts += 1;
    items = items.map(mark);
    return route.fulfill({ json: { success: true, code: 'SUCCESS', message: 'ok', timestamp: now } });
  });

  return {
    allowWrite: () => release(),
    singleAttempts: () => attempts,
    allAttempts: () => allAttempts,
    setImmediate: () => { pending = Promise.resolve(); },
  };
};

const assertNoOverflow = async (page: Page) => {
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(page.viewportSize()?.width ?? 0);
};

const evidence = async (page: Page, name: string) => {
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: resolve('test-results/issue-40', name + '.png'), animations: 'disabled' });
};

test('marks one or all, keeps optimistic counts consistent and rolls back a failed write', async ({ page }) => {
  await loadSession(page);
  const api = await mockNotifications(page, { failSingle: true });
  await page.goto('/notifications');
  const unread = page.getByRole('checkbox', { name: /Chỉ hiện chưa đọc/ });
  const unreadLabel = page.locator('label').filter({ has: unread });
  await expect(unreadLabel).toContainText('4');
  const shipment = page.getByRole('article').filter({ hasText: 'Kiện hàng #FS-89421' });
  await shipment.getByRole('button', { name: 'Đánh dấu đã đọc' }).click();
  await expect(shipment.getByRole('button', { name: 'Đang đánh dấu…' })).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Đánh dấu đã đọc tất cả' })).toBeDisabled();
  await expect(unreadLabel).toContainText('3');
  api.allowWrite();
  await expect(page.getByRole('alert')).toContainText('Không thể đánh dấu thông báo.');
  await expect(unreadLabel).toContainText('4');
  await expect(shipment.getByText('Chưa đọc', { exact: true })).toBeVisible();

  api.setImmediate();
  await shipment.getByRole('button', { name: 'Đánh dấu đã đọc' }).click();
  await expect(page.getByText('Đã đánh dấu thông báo là đã đọc.')).toBeVisible();
  await expect(unreadLabel).toContainText('3');
  await expect(shipment.getByText('Đã đọc', { exact: true })).toBeVisible();
  await unread.check();
  await expect(shipment).toHaveCount(0);
  await page.getByRole('button', { name: 'Đánh dấu đã đọc tất cả' }).click();
  await expect(page.getByText('Đã đánh dấu tất cả thông báo là đã đọc.')).toBeVisible();
  await expect(unreadLabel).toContainText('0');
  await expect(page.getByRole('heading', { name: 'Không có thông báo phù hợp' })).toBeVisible();
  expect(api.singleAttempts()).toBe(2);
  expect(api.allAttempts()).toBe(1);
});

test('renders loading, retry and empty states', async ({ page }) => {
  await loadSession(page);
  await mockNotifications(page, { empty: true });
  let failList = true;
  let releaseList = () => {};
  const pending = new Promise<void>((resolve) => { releaseList = resolve; });
  await page.route('**/api/v1/notifications?*', async (route) => {
    await pending;
    return failList ? fail(route) : route.fallback();
  });
  await page.goto('/notifications');
  await expect(page.getByText('Đang tải thông báo', { exact: true })).toBeAttached();
  releaseList();
  await expect(page.getByRole('alert')).toContainText('Không thể tải thông báo');
  failList = false;
  await page.getByRole('button', { name: 'Thử lại' }).click();
  await expect(page.getByRole('heading', { name: 'Bạn chưa có thông báo' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Đánh dấu đã đọc tất cả' })).toBeDisabled();
});

test('uses supported reference IDs and preserves the order page fallback for missing records', async ({ page }) => {
  await loadSession(page);
  await mockNotifications(page);
  await page.route('**/api/v1/orders/' + orderId, (route) => fail(route, 404));
  await page.goto('/notifications');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
  await expect(page.getByRole('link', { name: 'Theo dõi đơn hàng' })).toHaveAttribute('href', '/orders/' + orderId + '/tracking');
  await expect(page.getByRole('link', { name: 'Xem thanh toán' })).toHaveAttribute('href', '/payment/result?orderId=' + orderId);
  for (const title of ['Thông báo từ hệ thống', 'Bạn có một ưu đãi mới', 'Tham chiếu không hợp lệ']) {
    await expect(page.getByRole('article').filter({ hasText: title }).getByRole('link')).toHaveCount(0);
  }
  await page.getByRole('button', { name: 'Thanh toán', exact: true }).click();
  await expect(page.getByRole('article')).toHaveCount(1);
  await page.getByRole('button', { name: 'Đơn hàng', exact: true }).click();
  await page.getByRole('link', { name: 'Xem đơn hàng' }).first().click();
  await expect(page.getByRole('heading', { name: 'Order detail unavailable' })).toBeVisible();
});

test('keeps notifications protected and routes unknown URLs to a noindex 404', async ({ page }) => {
  await page.route('**/api/v1/auth/refresh-token', (route) => fail(route, 401));
  await page.route('**/api/v1/products**', (route) => ok(route, { items: [], page: 0, size: 12, totalItems: 0, totalPages: 0 }));
  await page.goto('/notifications');
  await expect(page).toHaveURL(/\/login\?redirect=%2Fnotifications$/);

  await page.goto('/this-route-does-not-exist');
  await expect(page).toHaveURL(/\/404$/);
  await expect(page.getByRole('heading', { level: 1, name: /Không tìm thấy trang|Trang bạn tìm kiếm/ })).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
  const main = page.getByRole('main');
  await expect(main.getByRole('link', { name: 'Quay lại trang chủ' })).toHaveAttribute('href', '/');
  await expect(main.getByRole('link', { name: 'Khám phá sản phẩm' })).toHaveAttribute('href', '/products');
  await expect(main.getByRole('link', { name: 'Tra cứu đơn hàng' })).toHaveAttribute('href', '/orders');
  await expect(main.getByRole('link', { name: 'Xem phụ kiện' })).toHaveAttribute('href', '/products?category=accessories');
  await page.getByRole('searchbox', { name: 'Tên sản phẩm' }).fill('  Áo dài  ');
  await page.getByRole('searchbox', { name: 'Tên sản phẩm' }).press('Enter');
  await expect.poll(() => new URL(page.url()).searchParams.get('q')).toBe('Áo dài');
});

for (const [name, width] of [['desktop', 1280], ['mobile', 390]] as const) {
  test('captures ' + name + ' notifications and 404 without horizontal overflow', async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await loadSession(page);
    await mockNotifications(page);
    await page.goto('/notifications');
    await expect(page.getByRole('article')).toHaveCount(initialNotifications.length);
    await assertNoOverflow(page);
    await evidence(page, 'notifications-' + name);
    await page.route('**/api/v1/auth/refresh-token', (route) => fail(route, 401));
    await page.goto('/404');
    await expect(page.getByRole('heading', { name: /Không tìm thấy trang|Trang bạn tìm kiếm/ })).toBeVisible();
    await assertNoOverflow(page);
    await evidence(page, 'not-found-' + name);
    const catalog = page.getByRole('region', { name: 'Khám phá danh mục' });
    await catalog.evaluate((section) => window.scrollTo(0, section.getBoundingClientRect().top + window.scrollY - 100));
    await expect.poll(() => catalog.locator('img').evaluateAll((images) => images.every((image) => image instanceof HTMLImageElement && image.complete && image.naturalWidth > 0))).toBe(true);
    await evidence(page, 'not-found-catalog-' + name);
  });
}
