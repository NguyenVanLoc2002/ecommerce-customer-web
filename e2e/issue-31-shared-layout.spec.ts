
import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.route('**/api/v1/**', (route) => {
    const { pathname } = new URL(route.request().url());
    if (pathname.endsWith('/auth/refresh-token')) {
      return route.fulfill({ status: 401, json: { success: false, code: 'REFRESH_TOKEN_INVALID' } });
    }
    const data = pathname.endsWith('/products')
      ? { items: [], page: 0, totalItems: 0, totalPages: 0 }
      : [];
    return route.fulfill({ json: { success: true, code: 'SUCCESS', data } });
  });
});

test('desktop navigation links to a selected category and focuses catalog search', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/');
  const header = page.getByRole('banner');
  const categoryLink = header.getByRole('link', { name: 'Nữ', exact: true });
  await categoryLink.click();
  await expect(page).toHaveURL(/\/products\?category=womenswear$/);
  await expect(categoryLink).toHaveAttribute('aria-current', 'page');
  await header.getByRole('link', { name: 'Tìm kiếm sản phẩm' }).click();
  await expect(page.getByRole('searchbox', { name: 'Tìm theo tên sản phẩm' })).toBeFocused();
  await expect(page.getByRole('navigation', { name: 'Điều hướng nhanh' })).toBeHidden();
});

test('mobile category drawer restores focus and search and cart retain their destinations', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const navigation = page.getByRole('navigation', { name: 'Điều hướng nhanh' });
  const categories = navigation.getByRole('button', { name: 'Danh mục', exact: true });
  await categories.click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toBeHidden();
  await expect(categories).toBeFocused();

  await navigation.getByRole('link', { name: 'Tìm kiếm' }).click();
  await expect(page.getByRole('searchbox', { name: 'Tìm theo tên sản phẩm' })).toBeFocused();
  await expect(navigation).toBeInViewport();
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  await navigation.getByRole('link', { name: 'Túi đồ (0)' }).click();
  await expect(page).toHaveURL(/\/login\?redirect=%2Fcart$/);
});

test('mobile checkout shows address editing and requests a quote only for the selected carrier', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const ok = (data: unknown) => ({ success: true, code: 'SUCCESS', data });
  await page.route('**/api/v1/auth/refresh-token', (route) =>
    route.fulfill({ json: ok({ accessToken: 'fixture', tokenType: 'Bearer', expiresIn: 900 }) }),
  );
  await page.route('**/api/v1/me', (route) =>
    route.fulfill({ json: ok({ id: 'fixture', customerId: 'fixture', email: 'review@example.test', firstName: 'Mai', lastName: 'Trần', status: 'ACTIVE', roles: ['CUSTOMER'] }) }),
  );
  await page.route('**/api/v1/cart', (route) =>
    route.fulfill({ json: ok({
      id: 'cart-1', totalItems: 1, subTotal: 1290000,
      items: [{ id: 'line-1', variantId: 'variant-1', variantName: 'M', productId: 'product-1', productName: 'Áo khoác', unitPrice: 1290000, salePrice: null, quantity: 1, availableStock: 2, lineTotal: 1290000 }],
    }) }),
  );
  await page.route('**/api/v1/addresses', (route) =>
    route.fulfill({ json: ok([{ id: 'home-address', receiverName: 'Mai Trần', phoneNumber: '0900000000', streetAddress: 'Địa chỉ mẫu', ward: 'Cửa Nam', district: 'Hoàn Kiếm', city: 'Hà Nội', isDefault: true }]) }),
  );
  await page.route('**/api/v1/carriers/checkout-options', (route) =>
    route.fulfill({ json: ok([
      { id: 'standard', code: 'STANDARD', name: 'Giao tiêu chuẩn', providerType: 'MANUAL' },
      { id: 'fast', code: 'FAST', name: 'Giao nhanh', providerType: 'MANUAL' },
    ]) }),
  );
  const quotedCarriers: string[] = [];
  await page.route('**/api/v1/orders/preview', (route) => {
    const input = route.request().postDataJSON() as { shippingAddressId: string; carrierId: string };
    expect(input.shippingAddressId).toBe('home-address');
    quotedCarriers.push(input.carrierId);
    return route.fulfill({ json: ok({
      carrierId: input.carrierId, paymentMethod: 'COD', subTotal: 1290000, discountAmount: 0, shippingFee: 35000, totalAmount: 1325000,
    }) });
  });

  await page.goto('/checkout/address');
  await expect(page.getByRole('link', { name: 'Chỉnh sửa' })).toHaveAttribute('href', '/profile/addresses/home-address/edit?returnTo=checkout');
  await expect(page.getByRole('heading', { name: 'Phương thức vận chuyển' })).toBeVisible();
  expect(quotedCarriers).toEqual([]);
  await page.getByText('Giao tiêu chuẩn', { exact: true }).click();
  await expect.poll(() => quotedCarriers).toEqual(['standard']);
  await expect(page.getByText(/35\.000/).first()).toBeVisible();
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
});
