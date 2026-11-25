import { expect, test, type Page } from '@playwright/test';

const orderId = '23d5ade1-6ff4-42a0-8faa-d59c41234abc';
const orderPath = '/orders/' + orderId;
const returnsPath = orderPath + '/returns';
const returnId = '43a8bd09-d6ff-4c90-b40b-b4a149234abc';
const replacementId = 'ffa5bd09-d6ff-4c90-b40b-b4a149234abc';
const createdAt = '2026-11-25T09:00:00Z';
const nextAt = '2026-11-25T10:00:00Z';
const envelope = (data: unknown) => ({ success: true, code: 'SUCCESS', data });
const item = {
  id: 'item-shirt', productId: 'product-shirt', productSlug: 'linen-shirt',
  productName: 'Áo sơ mi linen', variantName: 'Trắng / M', sku: 'LINEN-M',
  quantity: 3, unitPrice: 500000, lineTotal: 1500000, productImageUrl: null,
};
const anotherItem = { ...item, id: 'item-jacket', productName: 'Áo khoác', variantName: 'Đen / L', sku: 'JACKET-L' };
const order = {
  id: orderId, orderCode: 'FS-23001', status: 'DELIVERED', paymentMethod: 'COD', paymentStatus: 'PAID',
  canCancel: false, shippingReceiverName: 'Khách mẫu', shippingPhoneNumber: '0900000000',
  shippingStreetAddress: '10 Đường Mẫu', shippingCity: 'Hà Nội',
  subTotal: 3000000, discountAmount: 0, shippingFee: 0, totalAmount: 3000000,
  createdAt, updatedAt: createdAt, items: [item, anotherItem],
};
const eligibility = [
  { orderItemId: item.id, availableQuantity: 2, allowedReasons: ['DEFECTIVE', 'CHANGED_MIND'], unopenedRequiredForChangedMind: true },
  { orderItemId: anotherItem.id, availableQuantity: 1, allowedReasons: ['DEFECTIVE'], unopenedRequiredForChangedMind: false },
];
const request = {
  id: returnId, orderId, status: 'REQUESTED', reason: 'DEFECTIVE', note: 'Đường may bị lỗi.',
  createdAt, items: [{ orderItemId: item.id, quantity: 1 }],
};

const installOrder = (page: Page) => page.route('**/api/v1/**', (route) => {
  const path = new URL(route.request().url()).pathname.slice('/api/v1'.length);
  if (path === '/auth/refresh-token') {
    return route.fulfill({ json: envelope({ accessToken: 'fixture-token', tokenType: 'Bearer', expiresIn: 900 }) });
  }
  if (path === '/me') {
    return route.fulfill({ json: envelope({ id: 'customer-23', customerId: 'customer-23', roles: ['CUSTOMER'], status: 'ACTIVE' }) });
  }
  if (path === orderPath) return route.fulfill({ json: envelope(order) });
  if (path.startsWith('/shipments/order/') || path.startsWith('/payments/order/')) {
    return route.fulfill({ status: 404, json: { success: false, code: path.startsWith('/shipments') ? 'SHIPMENT_NOT_FOUND' : 'PAYMENT_NOT_FOUND' } });
  }
  return route.fulfill({ json: envelope({ items: [], totalItems: 0 }) });
});

for (const [width, device] of [[1280, 'desktop'], [390, 'mobile']] as const) {
  test('submits one eligible item and tracks the partial return on ' + device, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 900 });
    await installOrder(page);
    let posted = 0;
    let created = false;
    let inspected = false;
    let refundConfirmed = false;
    let detailReads = 0;
    let releasePost = () => {};
    const responseGate = new Promise<void>((resolve) => { releasePost = resolve; });

    await page.route('**/api/v1' + returnsPath, async (route) => {
      if (route.request().method() === 'POST') {
        posted += 1;
        expect(route.request().headers()['idempotency-key']).toMatch(/^return-/);
        expect(route.request().postDataJSON()).toEqual({
          reason: 'DEFECTIVE', note: request.note, originalCondition: false, unopened: false, items: request.items,
        });
        await responseGate;
        created = true;
        await route.fulfill({ json: envelope(request) });
        return;
      }
      await route.fulfill({
        json: envelope({
          requests: created ? [{ ...request, status: inspected ? 'INSPECTED' : 'REQUESTED' }] : [],
          eligibleItems: created ? [] : eligibility,
        }),
      });
    });
    await page.route('**/api/v1' + returnsPath + '/' + returnId, (route) => {
      detailReads += 1;
      return route.fulfill({
        json: envelope({
          request: { ...request, status: 'INSPECTED' },
          timeline: [
            { status: 'REQUESTED', occurredAt: createdAt },
            { status: 'APPROVED', occurredAt: nextAt },
            { status: 'RECEIVED', occurredAt: '2026-11-25T11:00:00Z' },
            { status: 'INSPECTED', occurredAt: '2026-11-25T12:00:00Z' },
          ],
          tracking: { carrier: 'Vận chuyển mẫu', trackingNumber: 'REVERSE-23', trackingAt: nextAt },
          inspection: [{ orderItemId: item.id, quantity: 1, restock: 1, damaged: 0 }],
          refund: { status: refundConfirmed ? 'COMPLETED' : 'PENDING', amount: 500000, createdAt, refundedAt: refundConfirmed ? nextAt : null },
          exchanges: [{ id: 'exchange-23', orderItemId: item.id, quantity: 1, status: 'REPLACEMENT_CREATED', replacementOrderId: replacementId }],
        }),
      });
    });

    await page.goto(orderPath, { waitUntil: 'domcontentloaded' });
    const panel = page.getByRole('region', { name: 'Đổi/trả hàng' });
    await expect(panel.getByText('Chưa có yêu cầu đổi/trả.')).toBeVisible();

    const openForm = panel.getByRole('button', { name: 'Yêu cầu đổi/trả', exact: true });
    await openForm.focus();
    await page.keyboard.press('Enter');
    const form = panel.getByRole('form', { name: 'Yêu cầu đổi/trả' });
    const quantity = form.getByRole('spinbutton', { name: /Áo sơ mi linen/ });
    await expect(quantity).toHaveAttribute('max', '2');
    await expect(form.getByRole('combobox')).toBeFocused();
    await form.getByRole('textbox', { name: 'Mô tả' }).fill(request.note);
    await quantity.fill('3');
    await form.getByRole('button', { name: 'Gửi yêu cầu' }).click();
    await expect(quantity).toHaveAttribute('aria-invalid', 'true');
    await expect(quantity).toBeFocused();
    expect(posted).toBe(0);
    await quantity.fill('1');
    await expect(form.getByRole('spinbutton', { name: /Áo khoác/ })).toHaveValue('0');
    await expect(await panel.evaluate((node) => node.scrollWidth <= node.clientWidth)).toBe(true);
    await panel.evaluate((node) => node.scrollIntoView({ block: 'start', behavior: 'instant' }));
    await panel.screenshot({ path: testInfo.outputPath('return-form-' + device + '.png') });

    try {
      await form.getByRole('button', { name: 'Gửi yêu cầu' }).dblclick();
      await expect(form.getByRole('button', { name: 'Đang gửi yêu cầu…' })).toBeDisabled();
      await expect.poll(() => posted).toBe(1);
    } finally {
      releasePost();
    }
    await expect(panel.getByText('Đã gửi yêu cầu đổi/trả.')).toBeVisible();
    await expect(panel.getByText('Đang chờ xét duyệt')).toBeVisible();

    inspected = true;
    await page.reload({ waitUntil: 'domcontentloaded' });
    const history = panel.locator('summary').filter({ hasText: 'Đã kiểm tra hàng trả' });
    await expect(history).toBeVisible();
    expect(detailReads).toBe(0);
    await history.click();
    await expect(panel.getByText('Áo sơ mi linen · SL 1', { exact: true })).toBeVisible();
    await expect(panel.getByText('Áo khoác')).toHaveCount(0);
    await expect(panel.getByText('Đã duyệt', { exact: true })).toBeVisible();
    await expect(panel.getByText(/REVERSE-23/)).toBeVisible();
    await expect(panel.getByText(/Đã kiểm tra 1, nhập lại kho 1/)).toBeVisible();
    await expect(panel.getByRole('region', { name: 'Hoàn tiền' })).toContainText('Chờ xác nhận hoàn tiền');
    await expect(panel.getByRole('link', { name: 'Xem đơn thay thế' })).toHaveAttribute('href', '/orders/' + replacementId);
    await expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    await panel.evaluate((node) => node.scrollIntoView({ block: 'start', behavior: 'instant' }));
    await panel.screenshot({ path: testInfo.outputPath('return-tracking-' + device + '.png') });

    refundConfirmed = true;
    await page.reload({ waitUntil: 'domcontentloaded' });
    await history.click();
    await expect(panel.getByRole('region', { name: 'Hoàn tiền' })).toContainText('Đã xác nhận hoàn tiền');
  });
}

test('announces errors and reuses the submission key after an uncertain response', async ({ page }) => {
  await installOrder(page);
  let failRead = true;
  let eligibilityChanged = false;
  const keys: string[] = [];
  let releaseRead = () => {};
  const readGate = new Promise<void>((resolve) => { releaseRead = resolve; });
  await page.route('**/api/v1' + returnsPath, async (route) => {
    if (route.request().method() === 'POST') {
      keys.push(route.request().headers()['idempotency-key']);
      if (keys.length === 1) {
        await route.abort('failed');
      } else {
        eligibilityChanged = true;
        await route.fulfill({ status: 409, json: { success: false, code: 'RETURN_QUANTITY_UNAVAILABLE' } });
      }
      return;
    }
    if (failRead) {
      await readGate;
      failRead = false;
      await route.fulfill({ status: 503, json: { success: false, code: 'REQUEST_FAILED' } });
      return;
    }
    await route.fulfill({
      json: envelope({ eligibleItems: eligibilityChanged ? [{ ...eligibility[0], availableQuantity: 1 }] : eligibility, requests: [] }),
    });
  });

  await page.goto(orderPath, { waitUntil: 'domcontentloaded' });
  const panel = page.getByRole('region', { name: 'Đổi/trả hàng' });
  try {
    await expect(panel.getByText('Đang tải yêu cầu đổi/trả…')).toBeVisible();
  } finally {
    releaseRead();
  }
  await expect(panel.getByRole('alert')).toContainText('Chưa tải được yêu cầu đổi/trả.');
  await panel.getByRole('button', { name: 'Tải lại đổi/trả' }).click();
  await panel.getByRole('button', { name: 'Yêu cầu đổi/trả', exact: true }).click();
  const form = panel.getByRole('form');
  const reason = form.getByLabel('Lý do đổi/trả');
  await reason.selectOption('CHANGED_MIND');
  await expect(form.getByRole('spinbutton', { name: /Áo khoác/ })).toHaveCount(0);
  await form.getByRole('spinbutton', { name: /Áo sơ mi linen/ }).fill('2');
  await form.getByRole('textbox', { name: 'Mô tả' }).fill('Mô tả yêu cầu.');
  const submit = form.getByRole('button', { name: 'Gửi yêu cầu' });
  await submit.click();
  await expect(form.getByLabel('Sản phẩm còn nguyên trạng', { exact: true })).toHaveAttribute('aria-invalid', 'true');
  await form.getByLabel('Sản phẩm còn nguyên trạng', { exact: true }).check();
  await submit.click();
  await expect(form.getByLabel('Sản phẩm yêu cầu còn nguyên niêm phong')).toHaveAttribute('aria-invalid', 'true');
  await form.getByLabel('Sản phẩm yêu cầu còn nguyên niêm phong').check();
  await submit.click();
  await expect(form.getByRole('alert')).toContainText('Chưa xác nhận được yêu cầu.');
  await submit.click();
  await expect(form.getByRole('alert')).toContainText('Điều kiện đổi/trả đã thay đổi.');
  await expect(form.getByRole('spinbutton')).toHaveAttribute('max', '1');
  expect(keys).toHaveLength(2);
  expect(keys[0]).toBe(keys[1]);
});
