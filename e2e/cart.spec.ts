import { expect, test, type Page, type Route } from '@playwright/test';

test.use({ deviceScaleFactor: 2 });

type CartItemFixture = {
  id: string;
  variantId: string;
  variantName: string;
  sku: string;
  productId: string;
  productSlug: string;
  productName: string;
  brandName: string;
  productImageUrl: string;
  unitPrice: number;
  salePrice: number | null;
  quantity: number;
  availableStock: number;
  lineTotal: number;
  createdAt: string;
};

type CartFixture = {
  id: string;
  items: CartItemFixture[];
  totalItems: number;
  subTotal: number;
  updatedAt: string;
};

const fixtureItems: CartItemFixture[] = [
  {
    id: 'line-blazer',
    variantId: 'variant-blazer',
    variantName: 'Màu: Xám đá / Cỡ: M',
    sku: 'BLAZER-GREY-M',
    productId: 'product-blazer',
    productSlug: 'ao-blazer-dang-suong',
    productName: 'Áo blazer dáng suông',
    brandName: 'Maison Aure',
    productImageUrl: '/artifacts/stitch-review/images/photo-4.jpg',
    unitPrice: 1_490_000,
    salePrice: 1_290_000,
    quantity: 1,
    availableStock: 5,
    lineTotal: 1_290_000,
    createdAt: '2026-11-22T00:00:00Z',
  },
  {
    id: 'line-trousers',
    variantId: 'variant-trousers',
    variantName: 'Màu: Than chì / Cỡ: M',
    sku: 'TROUSERS-CHARCOAL-M',
    productId: 'product-trousers',
    productSlug: 'quan-dai-xep-ly',
    productName: 'Quần dài xếp ly',
    brandName: 'Maison Aure',
    productImageUrl: '/artifacts/stitch-review/images/photo-7.jpg',
    unitPrice: 990_000,
    salePrice: null,
    quantity: 1,
    availableStock: 4,
    lineTotal: 990_000,
    createdAt: '2026-11-22T00:00:00Z',
  },
];

const cloneCart = (cart: CartFixture): CartFixture => JSON.parse(JSON.stringify(cart)) as CartFixture;

const wrap = (data: unknown) => ({ success: true, code: 'SUCCESS', message: 'OK', data, timestamp: '2026-11-22T00:00:00Z' });

const fulfillJson = (route: Route, body: unknown, status = 200) =>
  route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });

const installCartApi = async (
  page: Page,
  options: { stockConflict?: boolean } = {},
) => {
  let items = cloneCart({ id: 'cart-1', items: fixtureItems, totalItems: 2, subTotal: 2_280_000, updatedAt: '2026-11-22T00:00:00Z' }).items;
  if (options.stockConflict) {
    items = items.map((item, index) => index === 0 ? { ...item, quantity: 2, lineTotal: 2_580_000 } : item);
  }
  let cart: CartFixture = {
    id: 'cart-1',
    items,
    totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
    subTotal: items.reduce((sum, item) => sum + item.lineTotal, 0),
    updatedAt: '2026-11-22T00:00:00Z',
  };
  let conflictReturned = false;

  await page.route('**/api/v1/auth/refresh-token', (route) => fulfillJson(route, { success: false, code: 'UNAUTHORIZED', message: 'No session.' }, 401));
  await page.route('**/api/v1/auth/login', (route) =>
    fulfillJson(route, {
      ...wrap({
        user: {
          id: 'customer-1',
          email: 'customer@fashion-shop.com',
          firstName: 'Fashion',
          lastName: 'Customer',
          phoneNumber: null,
          status: 'ACTIVE',
          roles: ['CUSTOMER'],
          customerId: 'customer-1',
          gender: null,
          birthDate: null,
          avatarUrl: null,
          loyaltyPoints: 0,
          createdAt: '2026-11-22T00:00:00Z',
        },
        tokens: { accessToken: 'e2e-access-token', tokenType: 'Bearer', expiresIn: 3600 },
      }),
    }),
  );
  await page.route('**/api/v1/cart', async (route) => {
    if (route.request().method() === 'GET') {
      await fulfillJson(route, wrap(cart));
      return;
    }
    if (route.request().method() === 'DELETE') {
      cart = { ...cart, items: [], totalItems: 0, subTotal: 0 };
      await fulfillJson(route, wrap(null));
      return;
    }
    await route.continue();
  });
  await page.route('**/api/v1/cart/items/**', async (route) => {
    const url = new URL(route.request().url());
    const itemId = url.pathname.split('/').at(-1);
    if (route.request().method() === 'PATCH' && itemId) {
      if (options.stockConflict && !conflictReturned) {
        conflictReturned = true;
        cart = {
          ...cart,
          items: cart.items.map((item) => item.id === itemId ? { ...item, availableStock: 1 } : item),
        };
        await fulfillJson(route, { success: false, code: 'INVENTORY_NOT_ENOUGH', message: 'Stock changed. Review the updated cart.' }, 409);
        return;
      }
      const payload = route.request().postDataJSON() as { quantity: number };
      cart = {
        ...cart,
        items: cart.items.map((item) => item.id === itemId ? { ...item, quantity: payload.quantity, lineTotal: (item.salePrice ?? item.unitPrice) * payload.quantity } : item),
      };
      cart = {
        ...cart,
        totalItems: cart.items.reduce((sum, item) => sum + item.quantity, 0),
        subTotal: cart.items.reduce((sum, item) => sum + item.lineTotal, 0),
      };
      await fulfillJson(route, wrap(cart));
      return;
    }
    if (route.request().method() === 'DELETE' && itemId) {
      cart = { ...cart, items: cart.items.filter((item) => item.id !== itemId) };
      cart = {
        ...cart,
        totalItems: cart.items.reduce((sum, item) => sum + item.quantity, 0),
        subTotal: cart.items.reduce((sum, item) => sum + item.lineTotal, 0),
      };
      await fulfillJson(route, wrap(cart));
      return;
    }
    await route.continue();
  });
};

const signInAndOpenCart = async (page: Page) => {
  await page.goto('/cart');
  await page.getByLabel('Địa chỉ email').fill('customer@example.test');
  await page.getByLabel('Mật khẩu', { exact: true }).fill('FixturePassword123');
  await page.getByRole('button', { name: 'Đăng nhập' }).click();
  await expect(page.getByRole('heading', { name: 'Túi đồ của bạn' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Áo blazer dáng suông' })).toBeVisible();
};

test.describe('Customer cart', () => {
  test('keeps cart interactions usable on desktop and updates quantities and removal', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 1872 });
    await installCartApi(page);
    await signInAndOpenCart(page);

    await expect(page.getByText('Màu: Xám đá / Cỡ: M')).toBeVisible();
    await expect(page.getByText('2.280.000')).toBeVisible();
    await expect(page.getByText('Phí vận chuyển và ưu đãi (nếu có) sẽ được tính ở bước thanh toán.')).toBeVisible();
    await expect(page.getByText('Included')).toHaveCount(0);
    await expect(page.getByText('$0')).toHaveCount(0);

    await page.screenshot({ path: 'artifacts/issue-34/cart-desktop.png' });

    await page.getByRole('button', { name: 'Increase quantity for Áo blazer dáng suông' }).click();
    await expect(page.getByText('Đã cập nhật số lượng')).toBeVisible();
    await expect(page.getByText('2.580.000')).toBeVisible();

    await page.getByRole('button', { name: 'Xóa Quần dài xếp ly khỏi giỏ hàng' }).click();
    await expect(page.getByRole('heading', { name: 'Quần dài xếp ly' })).toHaveCount(0);
  });

  test('fits the narrow mobile viewport without horizontal overflow', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 1580 });
    await installCartApi(page);
    await signInAndOpenCart(page);

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    expect(overflow).toBe(false);
    await page.evaluate(() => window.scrollTo(0, 0));
    expect(await page.evaluate(() => window.scrollY)).toBe(0);
    await expect(page.getByText('FASHION SHOP').first()).toBeInViewport();
    await expect(page.locator('nav.fixed')).toBeInViewport();
    await page.screenshot({ path: 'artifacts/issue-34/cart-mobile.png' });

    const removeButton = page.getByRole('button', { name: 'Xóa Áo blazer dáng suông khỏi giỏ hàng' });
    const removeBounds = await removeButton.boundingBox();
    const productNameBounds = await page.getByRole('heading', { name: 'Áo blazer dáng suông' }).boundingBox();
    if (!removeBounds || !productNameBounds) throw new Error('Mobile cart item controls must be visible.');
    expect(removeBounds.width).toBeGreaterThanOrEqual(44);
    expect(removeBounds.height).toBeGreaterThanOrEqual(44);
    expect(productNameBounds.x + productNameBounds.width).toBeLessThanOrEqual(removeBounds.x);
    await removeButton.click();
    await expect(page.getByRole('heading', { name: 'Áo blazer dáng suông' })).toHaveCount(0);
    await expect(page.getByRole('heading', { name: 'Tóm tắt đơn hàng' })).toBeVisible();
  });

  test('refreshes cart stock after a server conflict', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 1580 });
    await installCartApi(page, { stockConflict: true });
    await signInAndOpenCart(page);

    await page.getByRole('button', { name: 'Increase quantity for Áo blazer dáng suông' }).click();
    await expect(page.getByRole('alert').filter({ hasText: 'Cần cập nhật số lượng' })).toBeVisible();
    await expect(page.getByText('Còn 1 sản phẩm. Hãy giảm số lượng để tiếp tục.')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Tiếp tục thanh toán' })).toBeDisabled();
  });
});
