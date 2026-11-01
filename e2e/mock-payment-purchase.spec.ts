import { expect, request as apiRequest, test, type APIRequestContext } from '@playwright/test';

type ApiEnvelope<T> = {
  data: T;
};

type LoginPayload = {
  accessToken?: string;
  tokens?: {
    accessToken?: string;
  };
};

type ProductListItem = {
  slug: string;
};

type ProductPage = {
  items: ProductListItem[];
};

type CartItem = {
  availableStock: number;
  variantId: string;
};

type Cart = {
  items: CartItem[];
};

type Order = {
  id: string;
  paymentStatus: string | null;
  status: string;
};

type Payment = {
  status: string;
};

const requiredEnvironment = ['E2E_CUSTOMER_EMAIL', 'E2E_CUSTOMER_PASSWORD', 'E2E_PRODUCT_SLUG'] as const;
const missingEnvironment = requiredEnvironment.filter((name) => !process.env[name]?.trim());

const unwrap = <T>(body: unknown): T => {
  if (!body || typeof body !== 'object' || !('data' in body)) {
    throw new Error('Expected an API response envelope containing data.');
  }

  return (body as ApiEnvelope<T>).data;
};

const loginForApi = async (request: APIRequestContext) => {
  const response = await request.post('/auth/login', {
    data: {
      email: process.env.E2E_CUSTOMER_EMAIL,
      password: process.env.E2E_CUSTOMER_PASSWORD,
    },
  });
  expect(response.ok(), 'The configured E2E customer must be able to sign in.').toBeTruthy();

  const payload = unwrap<LoginPayload>(await response.json());
  const accessToken = payload.accessToken ?? payload.tokens?.accessToken;
  if (!accessToken) {
    throw new Error('The authentication response did not contain an access token.');
  }

  return accessToken;
};

const createCustomerRequest = (accessToken: string) =>
  apiRequest.newContext({
    baseURL: process.env.E2E_API_BASE_URL ?? 'http://127.0.0.1:8080/api/v1',
    extraHTTPHeaders: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

test.describe('Mock payment purchase journey', () => {
  test.skip(missingEnvironment.length > 0, `Set ${missingEnvironment.join(', ')} before running this live E2E suite.`);

  test('purchases a product with Mock payment and persists the paid order', async ({ page }) => {
    const apiBaseUrl = process.env.E2E_API_BASE_URL ?? 'http://127.0.0.1:8080/api/v1';
    const unauthenticatedApi = await apiRequest.newContext({ baseURL: apiBaseUrl });
    const accessToken = await loginForApi(unauthenticatedApi);
    const customerApi = await createCustomerRequest(accessToken);

    try {
      const clearCartResponse = await customerApi.delete('/cart');
      expect(clearCartResponse.ok()).toBeTruthy();

      const productListResponse = await customerApi.get('/products?page=0&size=100&sort=createdAt,desc');
      expect(productListResponse.ok()).toBeTruthy();
      const productList = unwrap<ProductPage>(await productListResponse.json());
      expect(productList.items.some((product) => product.slug === process.env.E2E_PRODUCT_SLUG)).toBeTruthy();

      await page.goto('/login');
      await page.getByLabel('Email address').fill(process.env.E2E_CUSTOMER_EMAIL ?? '');
      await page.getByLabel('Password').fill(process.env.E2E_CUSTOMER_PASSWORD ?? '');
      await page.getByRole('button', { name: 'Sign in' }).click();
      await expect(page).toHaveURL(/\/$/);

      await page.goto(`/products/${process.env.E2E_PRODUCT_SLUG}`);
      await page.getByRole('button', { name: 'Add to Bag' }).click();
      await expect(page.getByText('Added to bag')).toBeVisible();

      const cartBeforeOrderResponse = await customerApi.get('/cart');
      expect(cartBeforeOrderResponse.ok()).toBeTruthy();
      const cartBeforeOrder = unwrap<Cart>(await cartBeforeOrderResponse.json());
      const selectedItem = cartBeforeOrder.items[0];
      if (!selectedItem) {
        throw new Error('The configured E2E product was not added to the customer cart.');
      }
      expect(selectedItem.availableStock).toBeGreaterThan(1);

      await page.goto('/cart');
      await page.getByRole('button', { name: 'Proceed to payment' }).click();
      await expect(page.getByRole('heading', { name: 'Shipping Destination' })).toBeVisible();

      const carrierRadios = page.locator('input[name="shipping-carrier"]');
      if ((await carrierRadios.count()) > 0) {
        await carrierRadios.first().check();
      }

      await page.getByRole('button', { name: 'Continue to payment' }).click();
      await expect(page.getByRole('heading', { name: 'Payment Method' })).toBeVisible();
      await page.getByRole('button', { name: /online/i }).first().click();
      await page.getByRole('button', { name: /Mock payment/ }).click();
      await page.getByRole('button', { name: 'Continue to rewards' }).click();
      await page.getByRole('button', { name: 'Continue to review' }).click();
      const createOrderResponse = page.waitForResponse(
        (response) => response.request().method() === 'POST' && new URL(response.url()).pathname.endsWith('/api/v1/orders'),
      );
      await page.getByRole('button', { name: 'Place order' }).click();
      await expect(page.getByRole('heading', { name: 'Order Confirmed.' })).toBeVisible();
      const createdOrder = unwrap<Order>(await (await createOrderResponse).json());

      const paymentLink = page.getByRole('button', { name: 'Continue to Mock payment' });
      await paymentLink.click();
      await page.waitForURL(/\/payments\/mock\/complete/);
      await page.goto(`/payment/result?orderId=${createdOrder.id}&provider=MOCK`);
      await expect(page.getByText('Paid', { exact: true })).toBeVisible();

      const orderResponse = await customerApi.get(`/orders/${createdOrder.id}`);
      expect(orderResponse.ok()).toBeTruthy();
      const order = unwrap<Order>(await orderResponse.json());
      expect(order.paymentStatus).toBe('PAID');
      expect(order.status).toBe('AWAITING_PAYMENT');

      const paymentResponse = await customerApi.get(`/payments/order/${createdOrder.id}`);
      expect(paymentResponse.ok()).toBeTruthy();
      expect(unwrap<Payment>(await paymentResponse.json()).status).toBe('PAID');

      const restockProbeResponse = await customerApi.post('/cart/items', {
        data: { variantId: selectedItem.variantId, quantity: 1 },
      });
      expect(restockProbeResponse.ok()).toBeTruthy();
      const restockProbe = unwrap<Cart>(await restockProbeResponse.json());
      const remainingItem = restockProbe.items.find((item) => item.variantId === selectedItem.variantId);
      expect(remainingItem?.availableStock).toBe(selectedItem.availableStock - 1);
    } finally {
      await customerApi.delete('/cart');
      await customerApi.dispose();
      await unauthenticatedApi.dispose();
    }
  });
});
