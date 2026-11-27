import { expect, test, type Page } from '@playwright/test';

const slug = 'ao-blazer-thu';
const url = '/products/' + slug;
const name = 'Áo blazer dáng suông phối lớp với đường may thủ công cổ điển';
const timestamp = '2026-11-22T00:00:00Z';
const api = (data: unknown) => ({ success: true, code: 'SUCCESS', message: 'OK', data, timestamp });
const variant = (id: string, color: string, size: string, status = 'ACTIVE') => ({
  id,
  sku: id,
  status,
  basePrice: 1490000,
  salePrice: 1290000,
  compareAtPrice: 1790000,
  attributes: [
    { attributeId: 'color', attributeCode: 'COLOR', valueId: color, displayValue: color },
    { attributeId: 'size', attributeCode: 'SIZE', valueId: size, displayValue: size },
  ],
});
const product = {
  id: 'product-blazer',
  slug,
  name,
  shortDescription: 'Áo blazer phom dáng suông.',
  description: 'Thông tin chi tiết sản phẩm.',
  status: 'PUBLISHED',
  featured: false,
  brand: { id: 'brand', name: 'Fashion Shop' },
  categories: [{ id: 'category', slug: 'womenswear', name: 'Nữ' }],
  returnPolicy: 'SEALED_ONLY',
  media: [
    { id: 'shared-1', mediaType: 'IMAGE', mediaUrl: '/not-found/womenswear.jpg' },
    { id: 'shared-2', mediaType: 'IMAGE', mediaUrl: '/not-found/accessories.jpg' },
    { id: 'gray-m', mediaType: 'IMAGE', mediaUrl: '/not-found/menswear.jpg', variantId: 'gray-m' },
    { id: 'video', mediaType: 'VIDEO', mediaUrl: '/exclude-this-video.mp4', variantId: 'gray-m' },
  ],
  variants: [variant('gray-m', 'Xám đá', 'M'), variant('gray-l', 'Xám đá', 'L', 'INACTIVE'), variant('sand-xl', 'Be cát', 'XL')],
  createdAt: timestamp,
  updatedAt: timestamp,
};

const sizeGuide = {
  id: 'guide-demo',
  name: 'Bảng size áo mẫu',
  content: {
    measurement: 'BODY',
    columns: [
      { key: 'chest', label: 'Vòng ngực', unit: 'CM' },
      { key: 'weight', label: 'Cân nặng', unit: 'KG' },
      { key: 'sleeve', label: 'Tay áo', unit: 'IN' },
    ],
    rows: [
      { size: 'S', values: { chest: { min: 84, max: 88 }, weight: { min: 45, max: 55 }, sleeve: { min: 22 } } },
      { size: 'M dài', values: { chest: { min: 88, max: 92 }, weight: { min: 55, max: 65 }, sleeve: { min: 23 } } },
    ],
    notes: 'Đo trên cơ thể, giữ thước vừa sát khi đo.',
  },
};
const badges = [
  { code: 'TIMELESS_CLASSIC', label: 'Thiết kế kinh điển' },
  { code: 'EXCLUSIVE', label: 'Độc quyền' },
  { code: 'HIDDEN_THIRD', label: 'Nhãn thứ ba' },
];

const setUp = async (page: Page, authenticated: boolean, withPresentation = false) => {
  const requests: unknown[] = [];
  const items = Array.from({ length: 4 }, (_, index) => ({
    id: 'related-' + index, name: 'Sản phẩm ' + index, slug: 'san-pham-' + index,
    badge: withPresentation && index === 0 ? badges[0] : undefined, brandName: 'Fashion Shop', minPrice: 890000, maxPrice: 890000, thumbnailUrl: '/not-found/womenswear.jpg',
  }));
  await page.route('**/api/v1/**', async (route) => {
    const path = new URL(route.request().url()).pathname.split('/api/v1')[1];
    if (path === '/auth/refresh-token') {
      await route.fulfill(authenticated
        ? { json: api({ accessToken: 'fixture-token', tokenType: 'Bearer', expiresIn: 3600 }) }
        : { status: 401, json: { success: false, code: 'UNAUTHORIZED' } });
    } else if (path === '/me') {
      await route.fulfill({ json: api({ id: 'test', email: 'customer@example.test', firstName: 'Test', lastName: 'User', status: 'ACTIVE', roles: ['CUSTOMER'] }) });
    } else if (path === '/products/slug/' + slug) {
      await route.fulfill({ json: api(withPresentation ? { ...product, sizeGuide, badges } : product) });
    } else if (path === '/products/slug/missing') {
      await route.fulfill({ status: 404, json: { success: false, code: 'PRODUCT_NOT_FOUND' } });
    } else if (path === '/products') {
      await route.fulfill({ json: api({ items, page: 0, size: 8, totalItems: 4, totalPages: 1 }) });
    } else if (path === '/categories' || path === '/brands') {
      await route.fulfill({ json: api([]) });
    } else if (path === '/cart/items') {
      requests.push(route.request().postDataJSON());
      await new Promise((resolve) => setTimeout(resolve, 450));
      if (requests.length === 1) {
        await route.fulfill({ status: 409, json: { success: false, code: 'INVENTORY_NOT_ENOUGH', message: 'Insufficient stock.' } });
      } else {
        await route.fulfill({ json: api({ id: 'cart', items: [], totalItems: 0, subTotal: 0, updatedAt: timestamp }) });
      }
    } else if (path === '/cart') {
      await route.fulfill({ json: api({ id: 'cart', items: [], totalItems: 0, subTotal: 0, updatedAt: timestamp }) });
    } else if (path.startsWith('/reviews/product/')) {
      await route.fulfill({ json: api({ items: [], page: 0, size: 20, totalItems: 0, totalPages: 0 }) });
    } else {
      await route.fulfill({ json: api(0) });
    }
  });
  return requests;
};

for (const viewport of [{ width: 1280, height: 900 }, { width: 390, height: 844 }]) {
  test('preserves PDP purchase and responsive controls at ' + viewport.width + 'px', async ({ page }, testInfo) => {
    const requests = await setUp(page, true);
    await page.setViewportSize(viewport);
    await page.goto(url);
    await expect(page.getByRole('heading', { level: 1, name })).toBeVisible();
    const gallery = page.getByRole('group', { name: /Hình ảnh/ });
    await gallery.getByRole('button').nth(1).click();
    await expect(gallery.getByRole('button').nth(1)).toHaveAttribute('aria-pressed', 'true');
    const purchase = page.locator('main aside').first();
    await expect(purchase.getByRole('button', { name: 'Chọn phân loại' })).toBeDisabled();
    await purchase.getByRole('button', { name: 'Xám đá' }).click();
    await expect(purchase.getByRole('button', { name: /L Tạm ngừng bán/ })).toBeDisabled();
    await expect(purchase.getByRole('button', { name: /XL Không có lựa chọn này/ })).toBeDisabled();
    await purchase.getByRole('button', { name: 'M', exact: true }).click();
    await expect(gallery.getByRole('button')).toHaveCount(1);
    await expect(page.locator('img[src="/exclude-this-video.mp4"]')).toHaveCount(0);
    await expect(purchase).toContainText(/1\.290\.000/);
    await expect(purchase).toContainText(/1\.790\.000/);
    await expect(purchase.getByRole('button', { name: 'Giảm số lượng' })).toBeDisabled();
    await purchase.getByRole('button', { name: 'Tăng số lượng' }).click();
    await purchase.getByText('Chính sách đổi trả & Giao nhận', { exact: true }).click();
    await expect(purchase.getByText(/còn nguyên niêm phong/)).toBeVisible();
    const cta = purchase.getByRole('button', { name: 'Thêm vào giỏ hàng' });
    await cta.click();
    const pending = purchase.getByRole('button', { name: /Đang thêm vào giỏ/ });
    await expect(pending).toBeDisabled();
    await pending.dispatchEvent('click');
    await expect(purchase.getByRole('alert')).toContainText('Tồn kho vừa thay đổi');
    expect(requests).toEqual([{ variantId: 'gray-m', quantity: 2 }]);
    await purchase.screenshot({ path: testInfo.outputPath('pdp-stock-error.png') });
    await cta.click();
    await expect(purchase.getByText('Đã thêm vào giỏ', { exact: true })).toBeVisible();
    await expect(purchase.getByRole('link', { name: 'Xem giỏ hàng' })).toHaveAttribute('href', '/cart');
    await purchase.screenshot({ path: testInfo.outputPath('pdp-cart-success.png') });
    expect(requests).toEqual([{ variantId: 'gray-m', quantity: 2 }, { variantId: 'gray-m', quantity: 2 }]);

    await purchase.getByRole('button', { name: 'M', exact: true }).click();
    await purchase.getByRole('button', { name: 'Be cát', exact: true }).click();
    await purchase.getByRole('button', { name: 'XL', exact: true }).click();
    await expect(cta).toBeEnabled();
    await expect(gallery.getByRole('button')).toHaveCount(2);
    await expect(page.locator('section[aria-labelledby="related-products-title"] article')).toHaveCount(4);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(viewport.width);
  });
}

test('keeps guest review and cart gated and renders a missing product', async ({ page }) => {
  const requests = await setUp(page, false);
  const reviewRequests: string[] = [];
  page.on('request', (request) => { if (request.url().includes('/reviews/product/')) reviewRequests.push(request.url()); });
  await page.goto(url);
  await expect(page.getByRole('button', { name: 'Hướng dẫn kích cỡ' })).toHaveCount(0);
  const reviewLink = page.getByRole('link', { name: 'Đăng nhập để xem đánh giá' });
  await expect(reviewLink).toBeVisible();
  expect(decodeURIComponent((await reviewLink.getAttribute('href')) ?? '')).toContain(url);
  await page.getByRole('button', { name: 'Xám đá', exact: true }).click();
  await page.getByRole('button', { name: 'M', exact: true }).click();
  await page.getByRole('button', { name: 'Đăng nhập để thêm vào giỏ' }).click();
  await expect(page).toHaveURL(/\/login\?/);
  expect(decodeURIComponent(page.url())).toContain(url);
  expect(reviewRequests).toEqual([]);
  expect(requests).toEqual([]);

  await page.goto('/products/missing');
  await expect(page.getByRole('heading', { level: 1, name: 'Không tìm thấy sản phẩm' })).toBeVisible();
});


for (const viewport of [{ width: 1280, height: 900 }, { width: 390, height: 844 }]) {
  test('renders configured guides and badges at ' + viewport.width + 'px', async ({ page }, testInfo) => {
    await setUp(page, false, true);
    await page.setViewportSize(viewport);
    await page.goto(url);
    const action = page.getByRole('button', { name: 'Hướng dẫn kích cỡ' });
    await expect(action).toBeVisible();
    const labels = page.getByRole('list', { name: 'Nhãn sản phẩm' });
    await expect(labels.first().getByRole('listitem')).toHaveCount(2);
    await expect(labels.first()).toContainText('Thiết kế kinh điển');
    await expect(page.getByText('Nhãn thứ ba')).toHaveCount(0);
    await expect(page.getByText('Đã bao gồm VAT')).toHaveCount(0);
    await expect(page.getByText(/Phí giao hàng được tính/)).toBeAttached();
    await page.getByRole('button', { name: 'Xám đá', exact: true }).click();
    const selectedSize = page.getByRole('button', { name: 'M', exact: true });
    await selectedSize.click();
    await expect(selectedSize).toHaveAttribute('aria-pressed', 'true');
    await page.evaluate(async () => {
      await document.fonts.ready;
      window.scrollTo({ top: 0, behavior: 'instant' });
    });
    await page.screenshot({ path: testInfo.outputPath('pdp-catalog.png'), fullPage: true, animations: 'disabled' });
    await action.click();
    const dialog = page.getByRole('dialog', { name: 'Hướng dẫn kích cỡ' });
    await expect(dialog.getByRole('columnheader', { name: 'Cân nặng (kg)' })).toBeVisible();
    await expect(dialog.getByRole('columnheader', { name: 'Tay áo (inch)' })).toBeVisible();
    await expect(dialog.getByText('84–88', { exact: true })).toBeVisible();
    await expect(dialog.getByText('M dài', { exact: true })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(viewport.width);
    await page.screenshot({ path: testInfo.outputPath('pdp-size-guide.png'), animations: 'disabled' });
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(action).toBeFocused();
    await expect(selectedSize).toHaveAttribute('aria-pressed', 'true');

    await page.goto('/products');
    const firstCard = page.getByRole('link', { name: /Sản phẩm 0/ }).first();
    await expect(firstCard.getByRole('list', { name: 'Nhãn sản phẩm' }).getByRole('listitem')).toHaveCount(1);
    await expect(page.getByRole('link', { name: /Sản phẩm 1/ }).first().getByRole('list', { name: 'Nhãn sản phẩm' })).toHaveCount(0);
    await page.screenshot({ path: testInfo.outputPath('plp-badge.png'), fullPage: true, animations: 'disabled' });
  });
}
