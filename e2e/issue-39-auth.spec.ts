import { expect, test, type Page, type Route } from '@playwright/test';

const email = 'mai.tran@example.test';
const password = 'FixturePassword123';
const otp = '012345';
const resetToken = 'fixture-reset-token';
const timestamp = '2026-11-26T00:00:00Z';
const user = {
  id: 'fixture-user', email, firstName: 'Mai', lastName: 'Trần', phoneNumber: null,
  status: 'ACTIVE', roles: ['CUSTOMER'], customerId: 'fixture-customer',
  gender: null, birthDate: null, avatarUrl: null, loyaltyPoints: 0, createdAt: timestamp,
};
const tokens = { accessToken: 'fixture-access-token', tokenType: 'Bearer', expiresIn: 900 };
const ok = (route: Route, data: unknown = null, status = 200) =>
  route.fulfill({ status, json: { success: true, code: 'SUCCESS', message: 'ok', data, timestamp } });
const fail = (route: Route, status: number, code: string) =>
  route.fulfill({ status, json: { success: false, code, message: code, timestamp } });

test.beforeEach(async ({ page }) => {
  await page.route('**/api/v1/**', (route) => ok(route, []));
  await page.route('**/api/v1/auth/refresh-token', (route) => fail(route, 401, 'REFRESH_TOKEN_INVALID'));
});

const loginForm = (page: Page) => page.locator('main form');
const enterRecovery = async (page: Page) => {
  await page.goto('/forgot-password');
  await page.getByLabel('Địa chỉ email đã đăng ký').fill(email);
  await page.getByRole('button', { name: 'Gửi mã xác thực OTP' }).click();
  await expect(page).toHaveURL(/\/verify-otp$/);
};

test('login starts empty, handles validation and credentials, and redirects back once', async ({ page }) => {
  let attempts = 0;
  let finishLogin = () => {};
  const pending = new Promise<void>((resolve) => { finishLogin = resolve; });
  await page.route('**/api/v1/me', (route) => ok(route, user));
  await page.route('**/api/v1/cart', (route) => ok(route, { items: [], totalItems: 0, subTotal: 0 }));
  await page.route('**/api/v1/auth/login', async (route) => {
    expect(route.request().method()).toBe('POST');
    expect(route.request().postDataJSON()).toEqual({ email, password });
    expect(route.request().headers().authorization).toBeUndefined();
    attempts += 1;
    if (attempts === 1) return fail(route, 401, 'INVALID_CREDENTIALS');
    await pending;
    return ok(route, { user, tokens });
  });

  await page.goto('/cart');
  const form = loginForm(page);
  const emailInput = form.getByLabel('Địa chỉ email');
  const passwordInput = form.getByLabel('Mật khẩu', { exact: true });
  const submit = form.getByRole('button', { name: 'Đăng nhập', exact: true });
  await expect(emailInput).toHaveValue('');
  await expect(passwordInput).toHaveValue('');
  await expect(page.getByText('Đăng nhập để thêm sản phẩm vào giỏ và tiếp tục mua sắm.')).toBeVisible();
  await submit.click();
  await expect(emailInput).toHaveAttribute('aria-invalid', 'true');
  expect(attempts).toBe(0);
  await emailInput.fill(email);
  await passwordInput.fill(password);
  await form.getByRole('button', { name: 'Hiện mật khẩu' }).click();
  await expect(passwordInput).toHaveAttribute('type', 'text');
  await form.getByRole('button', { name: 'Ẩn mật khẩu' }).click();
  await submit.click();
  await expect(form.getByRole('alert')).toHaveText('Email hoặc mật khẩu không chính xác.');
  await submit.click();
  await expect(form.getByRole('button', { name: 'Đang đăng nhập…' })).toBeDisabled();
  await form.evaluate((element) => (element as HTMLFormElement).requestSubmit());
  finishLogin();
  await expect(page).toHaveURL(/\/cart$/);
  expect(attempts).toBe(2);
});

test('registration distinguishes duplicate email and phone and keeps its payload and redirect', async ({ page }) => {
  let attempts = 0;
  await page.route('**/api/v1/me', (route) => ok(route, user));
  await page.route('**/api/v1/cart', (route) => ok(route, { items: [], totalItems: 0, subTotal: 0 }));
  await page.route('**/api/v1/auth/register', (route) => {
    const payload = { firstName: 'Mai', lastName: '', phoneNumber: '0901234567', email, password };
    expect(route.request().method()).toBe('POST');
    expect(route.request().postDataJSON()).toEqual(payload);
    attempts += 1;
    if (attempts === 1) return fail(route, 409, 'EMAIL_ALREADY_EXISTS');
    if (attempts === 2) return fail(route, 409, 'PHONE_ALREADY_EXISTS');
    return ok(route, { user, tokens }, 201);
  });

  await page.goto('/login?redirect=%2Fcart');
  await page.getByRole('link', { name: 'Đăng ký thành viên mới' }).click();
  await expect(page).toHaveURL(/\/register\?redirect=%2Fcart$/);
  await page.getByLabel('Tên', { exact: true }).fill('Mai');
  const emailInput = page.getByLabel('Địa chỉ email');
  const phoneInput = page.getByLabel('Số điện thoại (không bắt buộc)');
  await emailInput.fill(email);
  await phoneInput.fill('0901234567');
  await page.getByLabel('Mật khẩu', { exact: true }).fill(password);
  const submit = page.getByRole('button', { name: 'Đăng ký tài khoản', exact: true });
  await submit.click();
  await expect(emailInput).toHaveAttribute('aria-invalid', 'true');
  await expect(emailInput).toHaveAccessibleDescription('Địa chỉ email này đã được đăng ký.');
  await submit.click();
  await expect(phoneInput).toHaveAttribute('aria-invalid', 'true');
  await expect(phoneInput).toHaveAccessibleDescription('Số điện thoại này đã được sử dụng.');
  await submit.click();
  await expect(page).toHaveURL(/\/cart$/);
  expect(attempts).toBe(3);
});

test('recovery guards direct entry, handles resend and server errors, and resets with the verified token', async ({ page }) => {
  let mailRequests = 0;
  let otpRequests = 0;
  let resets = 0;
  await page.route('**/api/v1/auth/password/forgot', (route) => {
    expect(route.request().postDataJSON()).toEqual({ email });
    mailRequests += 1;
    return mailRequests === 1 ? fail(route, 429, 'OTP_RATE_LIMITED') : ok(route);
  });
  await page.route('**/api/v1/auth/password/forgot/verify', (route) => {
    expect(route.request().postDataJSON()).toEqual({ email, otp });
    otpRequests += 1;
    if (otpRequests === 1) return fail(route, 400, 'OTP_INVALID');
    if (otpRequests === 2) return fail(route, 400, 'OTP_EXPIRED');
    return ok(route, { resetToken, expiresAt: '2099-01-01T00:00:00Z' });
  });
  await page.route('**/api/v1/auth/password/reset', (route) => {
    expect(route.request().postDataJSON()).toEqual({ resetToken, newPassword: password, confirmPassword: password });
    resets += 1;
    return resets === 1 ? fail(route, 422, 'PASSWORD_REUSED') : ok(route);
  });

  await page.clock.install();
  for (const path of ['/verify-otp', '/reset-password']) {
    await page.goto(path);
    await expect(page).toHaveURL(/\/forgot-password$/);
  }
  await page.getByLabel('Địa chỉ email đã đăng ký').fill(email);
  const send = page.getByRole('button', { name: 'Gửi mã xác thực OTP' });
  await send.click();
  await expect(page.locator('main').getByRole('alert')).toContainText('Bạn đã gửi yêu cầu quá thường xuyên.');
  await send.click();
  await expect(page).toHaveURL(/\/verify-otp$/);
  await expect(page.getByText('Đã tiếp nhận yêu cầu')).toBeVisible();
  const resend = page.getByRole('button', { name: 'Gửi lại mã OTP' });
  await expect(resend).toBeDisabled();
  const code = page.getByLabel('Mã xác thực 6 chữ số');
  await code.fill(otp);
  const verify = page.getByRole('button', { name: 'Xác nhận mã OTP' });
  await verify.click();
  await expect(page.locator('main').getByRole('alert')).toContainText('Mã xác thực không chính xác.');
  await verify.click();
  await expect(page.locator('main').getByRole('alert')).toContainText('Mã xác thực đã hết hạn.');
  for (let second = 0; second < 60; second += 1) {
    await page.clock.runFor(1000);
  }
  await expect(resend).toBeEnabled();
  await resend.click();
  await expect(page.getByText('Đã yêu cầu mã mới')).toBeVisible();
  await expect(resend).toBeDisabled();
  await verify.click();
  await expect(page).toHaveURL(/\/reset-password$/);
  const confirm = page.getByLabel('Xác nhận mật khẩu mới', { exact: true });
  await page.getByLabel('Mật khẩu mới', { exact: true }).fill(password);
  await confirm.fill('DifferentPassword123');
  const save = page.getByRole('button', { name: 'Cập nhật mật khẩu' });
  await save.click();
  await expect(confirm).toHaveAccessibleDescription('Mật khẩu xác nhận không khớp.');
  expect(resets).toBe(0);
  await confirm.fill(password);
  await save.click();
  await expect(page.locator('main').getByText('Vui lòng chọn mật khẩu khác mật khẩu hiện tại.').first()).toBeVisible();
  await save.click();
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByText('Đã đặt lại mật khẩu')).toBeVisible();
  expect(mailRequests).toBe(3);
  expect(resets).toBe(2);
});

const authRoutes = [
  { path: 'login', title: 'Đăng nhập tài khoản', height: 1140 },
  { path: 'register', title: 'Đăng ký tài khoản', height: 1385 },
  { path: 'forgot-password', title: 'Quên mật khẩu?', height: 1212 },
  { path: 'verify-otp', title: 'Xác thực mã bảo mật', height: 1087 },
  { path: 'reset-password', title: 'Đặt lại mật khẩu mới', height: 1110 },
];

for (const viewport of ['desktop', 'mobile'] as const) {
  test('all auth screens at the ' + viewport + ' review viewport', async ({ page }) => {
    await page.route('**/api/v1/auth/password/forgot', (route) => ok(route));
    await page.route('**/api/v1/auth/password/forgot/verify', (route) => ok(route, { resetToken, expiresAt: '2099-01-01T00:00:00Z' }));
    for (const { path, title, height } of authRoutes) {
      await page.setViewportSize(viewport === 'desktop' ? { width: 1280, height } : { width: 390, height: 900 });
      if (path === 'verify-otp') {
        await enterRecovery(page);
      } else if (path === 'reset-password') {
        await page.getByLabel('Mã xác thực 6 chữ số').fill(otp);
        await page.getByRole('button', { name: 'Xác nhận mã OTP' }).click();
      } else {
        await page.goto('/' + path + (path === 'login' && viewport === 'desktop' ? '?redirect=%2Fcheckout%2Faddress' : ''));
      }
      await expect(page.getByRole('heading', { level: 1, name: title })).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(viewport === 'desktop' ? 1280 : 390);
      if (process.env.ISSUE_39_SCREENSHOTS) {
        await page.evaluate(async () => { await document.fonts.ready; });
        for (const dismiss of await page.getByRole('button', { name: 'Dismiss notification', exact: true }).all()) {
          await dismiss.click();
        }
        await page.screenshot({ path: 'test-results/issue-39/' + viewport + '-' + path + '.png', animations: 'disabled', fullPage: viewport === 'mobile' });
      }
    }
  });
}
