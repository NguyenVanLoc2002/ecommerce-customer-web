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
  freeShipping?: {
    enabled: boolean; threshold: number; eligibleAmount: number; remainingAmount: number;
    qualified: boolean; currency: string; policyRevision: number;
  };
  vatSummary?: { kind: string; rateFraction?: number };
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
    availableStock: 2,
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
  options: { summary?: boolean; stockConflict?: boolean; outOfStock?: boolean; cartLoadFails?: boolean; initialCartGate?: Promise<void> } = {},
) => {
  let items = cloneCart({ id: 'cart-1', items: fixtureItems, totalItems: 2, subTotal: 2_280_000, updatedAt: '2026-11-22T00:00:00Z' }).items;
  if (options.stockConflict || options.outOfStock) {
    items = items.map((item, index) => index === 0
      ? { ...item, availableStock: options.outOfStock ? 0 : 6, quantity: 5, lineTotal: 6_450_000 }
      : item);
  }
  let cart: CartFixture = {
    id: 'cart-1',
    items,
    totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
    subTotal: items.reduce((sum, item) => sum + item.lineTotal, 0),
    updatedAt: '2026-11-22T00:00:00Z',
  };
  if (options.summary) {
    cart.freeShipping = {
      enabled: true, threshold: 1_000_000, eligibleAmount: cart.subTotal, remainingAmount: 0,
      qualified: true, currency: 'VND', policyRevision: 1,
    };
    cart.vatSummary = { kind: 'INCLUDED_SINGLE_RATE', rateFraction: 0.08 };
  }
  let conflictReturned = false;
  let cartLoadFails = Boolean(options.cartLoadFails);

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
      await options.initialCartGate;
      if (cartLoadFails) {
        await fulfillJson(route, { success: false, code: 'CART_UNAVAILABLE', message: 'Unavailable' }, 400);
        return;
      }
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
      const payload = route.request().postDataJSON() as { quantity: number };
      if (options.stockConflict && conflictReturned) expect(payload.quantity).toBe(1);
      if (options.stockConflict && !conflictReturned) {
        conflictReturned = true;
        cart = {
          ...cart,
          items: cart.items.map((item) => item.id === itemId ? { ...item, availableStock: 1 } : item),
        };
        await fulfillJson(route, { success: false, code: 'INVENTORY_NOT_ENOUGH', message: 'Stock changed. Review the updated cart.' }, 409);
        return;
      }
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
  return { recoverCart: () => { cartLoadFails = false; } };
};

const signIn = async (page: Page) => {
  await page.goto('/cart', { waitUntil: 'domcontentloaded' });
  await page.getByLabel('Địa chỉ email').fill('customer@example.test');
  await page.getByLabel('Mật khẩu', { exact: true }).fill('FixturePassword123');
  await page.getByRole('button', { name: 'Đăng nhập' }).click();
  await page.waitForURL('**/cart');
  await expect(page.getByRole('heading', { name: 'Túi đồ của bạn', exact: true })).toBeVisible({ timeout: 15_000 });
};

const signInAndOpenCart = async (page: Page) => {
  await signIn(page);
  await expect(page.getByRole('heading', { name: 'Áo blazer dáng suông' })).toBeVisible();
};

test.describe('Customer cart', () => {
  test('keeps cart interactions usable on desktop and updates quantities and removal', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 1872 });
    await installCartApi(page, { summary: true });
    await signInAndOpenCart(page);

    await expect(page.getByText('Màu: Xám đá / Cỡ: M')).toBeVisible();
    await expect(page.getByText('2.280.000')).toHaveCount(2);
    await expect(page.getByText('Được tính ở bước giao hàng')).toBeVisible();
    await expect(page.getByText('Đã bao gồm 8% VAT')).toBeVisible();
    await expect(page.getByRole('progressbar', { name: 'Tiến độ miễn phí giao hàng' })).toBeVisible();
    const summary = page.getByRole('complementary', { name: 'Tóm tắt đơn hàng' });
    await expect(summary.getByRole('link', { name: 'Chính sách giao hàng' })).toHaveAttribute('href', '/policies/shipping');
    await expect(page.getByText('Kho chỉ còn 2 sản phẩm có sẵn')).toBeVisible();
    await expect(page.getByText('Tình trạng: Còn hàng')).toBeVisible();
    await expect(page.getByText('Included')).toHaveCount(0);
    await expect(page.getByText('$0')).toHaveCount(0);

    await page.screenshot({ path: test.info().outputPath('cart-desktop.png'), animations: 'disabled' });

    await page.getByRole('button', { name: 'Increase quantity for Áo blazer dáng suông' }).click();
    await expect(page.getByText('Đã cập nhật số lượng')).toBeVisible();
    await expect(page.getByText('Thành tiền: 2.580.000 ₫')).toBeVisible();

    await page.getByRole('button', { name: 'Xóa Quần dài xếp ly khỏi giỏ hàng' }).click();
    await expect(page.getByRole('heading', { name: 'Quần dài xếp ly' })).toHaveCount(0);
  });

  test('fits the narrow mobile viewport without horizontal overflow', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 1580 });
    await installCartApi(page, { summary: true });
    await signInAndOpenCart(page);

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    expect(overflow).toBe(false);
    await page.evaluate(() => window.scrollTo(0, 0));
    expect(await page.evaluate(() => window.scrollY)).toBe(0);
    await expect(page.getByText('FASHION SHOP').first()).toBeInViewport();
    await expect(page.getByRole('navigation', { name: 'Điều hướng nhanh' })).toBeInViewport();
    await expect(page.getByRole('link', { name: 'Quay lại danh sách sản phẩm' })).toHaveAttribute('href', '/products');
    await page.screenshot({ path: test.info().outputPath('cart-mobile.png'), animations: 'disabled' });

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
    await page.getByRole('button', { name: 'Tiến hành đặt hàng' }).click();
    await expect(page).toHaveURL(/\/checkout\/address$/);
  });

  test('recovers from a cart load error and renders the empty state after clearing', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 1580 });
    let releaseCart = () => {};
    const initialCartGate = new Promise<void>((resolve) => { releaseCart = resolve; });
    const { recoverCart } = await installCartApi(page, { cartLoadFails: true, initialCartGate });
    await signIn(page);
    try {
      await expect(page.getByRole('status').filter({ hasText: 'Đang tải giỏ hàng…' })).toBeAttached();
      await expect(page.getByRole('button', { name: 'Tiến hành đặt hàng' })).toHaveCount(0);
    } finally {
      releaseCart();
    }
    await expect(page.getByRole('heading', { name: 'Tải giỏ hàng không thành công' })).toBeVisible();

    recoverCart();
    await page.getByRole('button', { name: 'Thử tải lại' }).click();
    await expect(page.getByRole('heading', { name: 'Áo blazer dáng suông' })).toBeVisible();

    await page.getByRole('button', { name: 'Xóa toàn bộ túi đồ' }).click();
    const dialog = page.getByRole('dialog');
    await dialog.getByRole('button', { name: 'Giữ lại' }).click();
    await expect(dialog).toBeHidden();
    await expect(page.getByRole('heading', { name: 'Áo blazer dáng suông' })).toBeVisible();

    await page.getByRole('button', { name: 'Xóa toàn bộ túi đồ' }).click();
    await dialog.getByRole('button', { name: 'Xóa giỏ hàng' }).click();
    await expect(page.getByRole('heading', { name: 'Túi đồ của bạn đang trống' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Khám phá bộ sưu tập' })).toHaveAttribute('href', '/products');
  });

  test('refreshes cart stock after a server conflict', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 1580 });
    await installCartApi(page, { stockConflict: true });
    await signInAndOpenCart(page);

    await page.getByRole('button', { name: 'Increase quantity for Áo blazer dáng suông' }).click();
    await expect(page.getByRole('alert').filter({ hasText: 'Cần cập nhật số lượng' })).toBeVisible();
    await expect(page.getByText('Còn 1 sản phẩm. Hãy giảm số lượng để tiếp tục.')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Tiến hành đặt hàng' })).toBeDisabled();
    await page.getByRole('button', { name: 'Giảm còn 1', exact: true }).click();
    await expect(page.getByRole('alert').filter({ hasText: 'Cần cập nhật số lượng' })).toBeHidden();
    await expect(page.getByRole('button', { name: 'Tiến hành đặt hàng' })).toBeEnabled();
  });

  test('lets the customer replace or remove a variant with zero stock', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 1580 });
    await installCartApi(page, { outOfStock: true });
    await signInAndOpenCart(page);
    await expect(page.getByText('Sản phẩm đã hết hàng.')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Increase quantity for Áo blazer dáng suông' })).toBeDisabled();
    await expect(page.getByRole('button', { name: 'Tiến hành đặt hàng' })).toBeDisabled();
    await expect(page.getByRole('link', { name: 'Chọn biến thể khác' })).toHaveAttribute('href', '/products/ao-blazer-dang-suong');
    await page.getByRole('button', { name: 'Xóa Áo blazer dáng suông khỏi giỏ hàng' }).click();
    await expect(page.getByRole('button', { name: 'Tiến hành đặt hàng' })).toBeEnabled();
  });

  test('previews a submitted voucher and revalidates it after the cart changes', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 1580 });
    await installCartApi(page);
    const quotedAmounts: number[] = [];
    await page.route('**/api/v1/vouchers/SAVE/validate', (route) => {
      const { orderAmount } = route.request().postDataJSON() as { orderAmount: number };
      quotedAmounts.push(orderAmount);
      return fulfillJson(route, wrap({ voucherCode: 'SAVE', discountAmount: 50000, orderAmount, finalAmount: orderAmount - 50000 }));
    });
    await signInAndOpenCart(page);
    await page.getByRole('textbox', { name: 'Mã ưu đãi' }).fill('save');
    expect(quotedAmounts).toEqual([]);
    await page.getByRole('button', { name: 'Áp dụng' }).click();
    await expect(page.getByText(/Giảm dự kiến 50\.000/)).toBeVisible();
    await expect.poll(() => quotedAmounts).toEqual([2_280_000]);
    await page.getByRole('button', { name: 'Xóa Quần dài xếp ly khỏi giỏ hàng' }).click();
    await expect.poll(() => quotedAmounts).toEqual([2_280_000, 1_290_000]);
    await expect(page.getByText('1.240.000')).toHaveCount(0);
    await expect(page.getByRole('progressbar')).toHaveCount(0);
    await expect(page.getByText('Thuế GTGT (VAT)')).toHaveCount(0);
    await page.getByRole('button', { name: 'Tiến hành đặt hàng' }).click();
    await expect(page).toHaveURL(/\/checkout\/address$/);
    await expect(page.getByRole('heading', { name: /Địa chỉ (nhận|giao) hàng/ })).toBeVisible();
    await expect.poll(() => page.evaluate(() => {
      const saved = localStorage.getItem('fashion-shop.checkout-draft');
      return saved ? JSON.parse(saved).state.voucherCode : null;
    })).toBe('SAVE');
  });
});
