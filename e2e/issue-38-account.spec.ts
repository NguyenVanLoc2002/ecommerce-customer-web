import { resolve } from 'node:path';

import { expect, test, type Page, type Route } from '@playwright/test';

const timestamp = '2026-11-25T00:00:00Z';
const profile = {
  id: 'review-customer', customerId: 'review-customer', firstName: 'Thị Mai', lastName: 'Trần',
  email: 'mai@example.test', phoneNumber: '0901234321', gender: 'FEMALE', birthDate: '1994-08-15',
  status: 'ACTIVE', roles: ['CUSTOMER'], avatarUrl: null, loyaltyPoints: 120, createdAt: timestamp,
};
const home = {
  id: 'review-home', receiverName: 'Trần Thị Mai', phoneNumber: profile.phoneNumber, label: 'Nhà riêng',
  streetAddress: '123 Phố Huế', ward: 'Phường Hàng Bài', district: 'Quận Hoàn Kiếm', city: 'Hà Nội',
  postalCode: '100000', addressType: 'SHIPPING', isDefault: true, fullAddress: null, createdAt: timestamp,
};
const office = {
  ...home, id: 'review-office', receiverName: 'Trần Thị Mai (Công tác)', label: 'Văn phòng',
  streetAddress: '45 Lê Thánh Tôn', ward: 'Phường Bến Nghé', district: 'Quận 1', city: 'TP. Hồ Chí Minh',
  addressType: 'BOTH', postalCode: '700000', isDefault: false,
};

const ok = (route: Route, data: unknown, status = 200) =>
  route.fulfill({ status, json: { success: true, code: 'SUCCESS', message: 'ok', data, timestamp } });

const fail = (route: Route, status: number, code: string, message: string, errors: { field: string; message: string }[] = []) =>
  route.fulfill({ status, json: { success: false, code, message, errors, timestamp } });

const evidence = (page: Page, name: string) => page.screenshot({
  path: resolve('artifacts/issue-38/implementation', name + '.png'),
  fullPage: true,
  animations: 'disabled',
});

test.beforeEach(async ({ page }) => {
  await page.route('**/api/v1/**', (route) => ok(route, []));
  await page.route('**/api/v1/auth/refresh-token', (route) => ok(route, { accessToken: 'review-session', tokenType: 'Bearer', expiresIn: 900 }));
  await page.route('**/api/v1/me', (route) => ok(route, profile));
  await page.route('**/api/v1/addresses', (route) => ok(route, [home, office]));
  await page.route('**/api/v1/addresses/review-home', (route) => ok(route, home));
});

test('profile validation, pending and success preserve the PATCH contract', async ({ page }) => {
  let patches = 0;
  let finishPatch = () => {};
  const pending = new Promise<void>((resolve) => { finishPatch = resolve; });
  await page.route('**/api/v1/me', async (route) => {
    if (route.request().method() === 'GET') return ok(route, profile);
    patches += 1;
    expect(route.request().method()).toBe('PATCH');
    expect(route.request().headers().authorization).toBe('Bearer review-session');
    expect(route.request().postDataJSON()).toEqual({
      firstName: 'Thị An', lastName: 'Trần', phoneNumber: profile.phoneNumber, gender: 'FEMALE', birthDate: '1994-08-15',
    });
    await pending;
    await ok(route, { ...profile, firstName: 'Thị An' });
  });

  await page.goto('/profile');
  await expect(page.getByLabel('Địa chỉ email')).toHaveAttribute('readonly', '');
  await page.getByLabel('Tên', { exact: true }).fill('A');
  await page.getByRole('button', { name: 'Lưu thay đổi' }).click();
  await expect(page.getByLabel('Tên', { exact: true })).toHaveAttribute('aria-invalid', 'true');
  expect(patches).toBe(0);
  await page.getByLabel('Tên', { exact: true }).fill('Thị An');
  await page.getByRole('button', { name: 'Lưu thay đổi' }).click();
  await expect(page.getByRole('button', { name: 'Lưu thay đổi' })).toBeDisabled();
  finishPatch();
  await expect(page.getByText('Đã cập nhật hồ sơ')).toBeVisible();
  expect(patches).toBe(1);
});

test('password confirmation and server error, then existing sign-in redirect', async ({ page }) => {
  let changes = 0;
  await page.route('**/api/v1/account/password/change', (route) => {
    expect(route.request().method()).toBe('POST');
    expect(route.request().headers().authorization).toBe('Bearer review-session');
    expect(route.request().postDataJSON()).toEqual({
      currentPassword: 'DemoOld123', newPassword: 'DemoNext123', confirmPassword: 'DemoNext123',
    });
    changes += 1;
    return changes === 1 ? fail(route, 422, 'TEST_PASSWORD_ERROR', 'Vui lòng thử lại mật khẩu.') : ok(route, null);
  });
  await page.goto('/profile/security');
  const current = page.getByLabel('Mật khẩu hiện tại', { exact: true });
  await current.fill('DemoOld123');
  await page.getByRole('button', { name: 'Hiện mật khẩu hiện tại' }).click();
  await expect(current).toHaveAttribute('type', 'text');
  await page.getByLabel('Mật khẩu mới', { exact: true }).fill('DemoNext123');
  const confirm = page.getByLabel('Xác nhận mật khẩu mới', { exact: true });
  await confirm.fill('Different123');
  const submit = page.getByRole('button', { name: 'Cập nhật mật khẩu' });
  await submit.click();
  await expect(confirm).toHaveAttribute('aria-invalid', 'true');
  expect(changes).toBe(0);
  await confirm.fill('DemoNext123');
  await submit.click();
  await expect(page.getByRole('alert')).toContainText('Vui lòng thử lại mật khẩu.');
  await submit.click();
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByText('Password updated')).toBeVisible();
  expect(changes).toBe(2);
});

test('address book uses server default, confirms deletion and handles an empty result', async ({ page }) => {
  let addresses = [home, office];
  let deletes = 0;
  await page.route('**/api/v1/addresses', (route) => ok(route, addresses));
  await page.route('**/api/v1/addresses/review-office', (route) => {
    expect(route.request().method()).toBe('PATCH');
    expect(route.request().postDataJSON()).toEqual({ isDefault: true });
    addresses = [{ ...office, isDefault: true }, { ...home, isDefault: false }];
    return ok(route, addresses[0]);
  });
  await page.route('**/api/v1/addresses/review-home', (route) => {
    expect(route.request().method()).toBe('DELETE');
    deletes += 1;
    if (deletes === 1) return fail(route, 500, 'TEST_DELETE_ERROR', 'Chưa thể xóa địa chỉ.');
    addresses = [];
    return ok(route, null);
  });
  await page.goto('/profile/addresses');
  await expect(page.getByRole('article').first()).toContainText('Nhà riêng');
  await page.getByRole('button', { name: 'Đặt làm mặc định' }).click();
  await expect(page.getByRole('article').first()).toContainText('Văn phòng');
  await expect(page.getByRole('article').first()).toContainText('Mặc định');
  const remove = page.getByRole('button', { name: 'Xóa địa chỉ của Trần Thị Mai', exact: true });
  await remove.click();
  const dialog = page.getByRole('dialog', { name: 'Xóa địa chỉ nhận hàng?' });
  await expect(dialog).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(remove).toBeFocused();
  expect(deletes).toBe(0);
  await remove.click();
  await dialog.getByRole('button', { name: 'Xóa địa chỉ' }).click();
  await expect(dialog.getByRole('alert')).toContainText('Chưa thể xóa địa chỉ.');
  await dialog.getByRole('button', { name: 'Xóa địa chỉ' }).click();
  await expect(page.getByText('Bạn chưa lưu địa chỉ nào')).toBeVisible();
  expect(deletes).toBe(2);
});

test('address create validates fields and returns the saved id to checkout', async ({ page }) => {
  let writes = 0;
  await page.route('**/api/v1/addresses', (route) => {
    if (route.request().method() === 'GET') return ok(route, [home, office]);
    writes += 1;
    expect(route.request().method()).toBe('POST');
    expect(route.request().postDataJSON()).toEqual({
      receiverName: home.receiverName, phoneNumber: home.phoneNumber, streetAddress: home.streetAddress,
      ward: home.ward, district: home.district, city: home.city, postalCode: '', label: '', addressType: 'BOTH', isDefault: true,
    });
    return ok(route, { ...home, id: 'review-created', addressType: 'BOTH' }, 201);
  });
  await page.goto('/profile/addresses/new?returnTo=checkout');
  const save = page.getByRole('button', { name: 'Lưu địa chỉ' });
  await save.click();
  await expect(page.getByLabel('Họ và tên người nhận')).toHaveAttribute('aria-invalid', 'true');
  expect(writes).toBe(0);
  await page.getByLabel('Họ và tên người nhận').fill(home.receiverName);
  await page.getByLabel('Số điện thoại liên hệ').fill(home.phoneNumber);
  await page.getByLabel('Tỉnh / Thành phố').fill(home.city);
  await page.getByLabel('Quận / Huyện').fill(home.district);
  await page.getByLabel('Phường / Xã').fill(home.ward);
  await page.getByLabel('Số nhà, tòa nhà, tên đường').fill(home.streetAddress);
  await page.getByText('Giao hàng và hóa đơn', { exact: true }).click();
  await page.getByRole('checkbox', { name: /Đặt làm địa chỉ mặc định/ }).check();
  await save.click();
  await expect(page).toHaveURL(/\/checkout\/address\?selectedAddressId=review-created$/);
  expect(writes).toBe(1);
});

test('address edit applies server field errors, saves, and distinguishes a missing address', async ({ page }) => {
  let writes = 0;
  await page.route('**/api/v1/addresses/review-home', (route) => {
    if (route.request().method() === 'GET') return ok(route, home);
    writes += 1;
    expect(route.request().method()).toBe('PATCH');
    expect(route.request().postDataJSON()).toMatchObject({ addressType: 'SHIPPING', label: 'Nhà mới' });
    return writes === 1
      ? fail(route, 400, 'TEST_FIELD_ERROR', 'Địa chỉ cần kiểm tra lại.', [{ field: 'label', message: 'Kiểm tra nhãn địa chỉ.' }])
      : ok(route, { ...home, label: 'Nhà mới' });
  });
  await page.route('**/api/v1/addresses/review-missing', (route) => fail(route, 404, 'ADDRESS_NOT_FOUND', 'Not found'));
  await page.goto('/profile/addresses/review-home/edit');
  const label = page.getByLabel('Nhãn địa chỉ (tùy chọn)');
  await expect(label).toHaveValue(home.label);
  await label.fill('Nhà mới');
  const save = page.getByRole('button', { name: 'Lưu địa chỉ' });
  await save.click();
  await expect(label).toHaveAttribute('aria-invalid', 'true');
  await expect(page.getByText('Kiểm tra nhãn địa chỉ.')).toBeVisible();
  await save.click();
  await expect(page).toHaveURL(/\/profile\/addresses$/);
  await page.goto('/profile/addresses/review-missing/edit');
  await expect(page.getByText('Không tìm thấy địa chỉ')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Xóa địa chỉ' })).toHaveCount(0);
});

test('address book announces loading, retries and renders recovered data', async ({ page }) => {
  let requests = 0;
  let finishRequest = () => {};
  const pending = new Promise<void>((resolve) => { finishRequest = resolve; });
  await page.route('**/api/v1/addresses', async (route) => {
    requests += 1;
    if (requests === 1) await pending;
    if (requests <= 2) return fail(route, 500, 'TEST_LOAD_ERROR', 'Chưa thể tải địa chỉ.');
    return ok(route, [home]);
  });

  await page.goto('/profile/addresses');
  await expect(page.getByRole('status').filter({ hasText: 'Đang tải sổ địa chỉ' })).toBeVisible();
  finishRequest();
  await expect(page.getByText('Không thể tải sổ địa chỉ')).toBeVisible();
  await page.getByRole('button', { name: 'Thử lại' }).click();
  await expect(page.getByRole('article')).toContainText(home.streetAddress);
  expect(requests).toBe(3);
});

for (const [name, path] of [
  ['profile', '/profile'], ['security', '/profile/security'], ['addresses', '/profile/addresses'],
  ['new', '/profile/addresses/new'], ['edit', '/profile/addresses/review-home/edit'],
]) {
  test(`responsive account screen ${name}`, async ({ page }) => {
    for (const [device, width, height] of [['desktop', 1280, 900], ['mobile', 390, 844]] as const) {
      await page.setViewportSize({ width, height });
      await page.goto(path);
      await expect(page.getByRole('main').locator('h1')).toBeVisible();
      if (name === 'edit') await expect(page.getByLabel('Nhãn địa chỉ (tùy chọn)')).toHaveValue(home.label);
      if (name === 'profile') await expect(page.getByLabel('Địa chỉ email')).toHaveValue(profile.email);
      if (name === 'addresses') await expect(page.getByRole('article')).toHaveCount(2);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
      await expect(page.getByRole('main').getByRole('navigation', { name: 'Tài khoản' }).locator('[aria-current="page"]')).toHaveCount(1);
      if (process.env.E2E_CAPTURE_ACCOUNT_EVIDENCE) {
        await page.evaluate(() => document.fonts.ready);
        await evidence(page, name + '-' + device);
      }
    }
  });
}
