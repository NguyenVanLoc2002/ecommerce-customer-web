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
  carrierId?: string | null;
  id: string;
  paymentStatus: string | null;
  shippingFee?: number;
  status: string;
};

type Payment = {
  paymentUrl?: string | null;
  status: string;
};

type OrderPreview = {
  carrierId: string | null;
  shippingFee: number;
  totalAmount: number;
};

type CheckoutCarrierOption = {
  id: string;
};

type CheckoutRequestBody = {
  carrierId?: string;
  discountAmount?: number;
  shippingFee?: number;
  totalAmount?: number;
};

const requiredEnvironment = ['E2E_CUSTOMER_EMAIL', 'E2E_CUSTOMER_PASSWORD', 'E2E_PRODUCT_SLUG'] as const;
const missingEnvironment = requiredEnvironment.filter((name) => !process.env[name]?.trim());
const getApiBaseUrl = () => `${(process.env.E2E_API_BASE_URL ?? 'http://127.0.0.1:8080/api/v1').replace(/\/+$/, '')}/`;

const unwrap = <T>(body: unknown): T => {
  if (!body || typeof body !== 'object' || !('data' in body)) {
    throw new Error('Expected an API response envelope containing data.');
  }

  return (body as ApiEnvelope<T>).data;
};

const loginForApi = async (request: APIRequestContext) => {
  const response = await request.post('auth/login', {
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
    baseURL: getApiBaseUrl(),
    extraHTTPHeaders: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

test.describe('Mock payment purchase journey', () => {
  test.skip(missingEnvironment.length > 0, `Set ${missingEnvironment.join(', ')} before running this live E2E suite.`);

  test('purchases a product with Mock payment and persists the paid order', async ({ page }) => {
    const apiBaseUrl = getApiBaseUrl();
    const unauthenticatedApi = await apiRequest.newContext({ baseURL: apiBaseUrl });
    const accessToken = await loginForApi(unauthenticatedApi);
    const customerApi = await createCustomerRequest(accessToken);

    try {
      const clearCartResponse = await customerApi.delete('cart');
      expect(clearCartResponse.ok() || clearCartResponse.status() === 404).toBeTruthy();

      const productListResponse = await customerApi.get('products?page=0&size=100&sort=createdAt,desc');
      expect(productListResponse.ok()).toBeTruthy();
      const productList = unwrap<ProductPage>(await productListResponse.json());
      expect(productList.items.some((product) => product.slug === process.env.E2E_PRODUCT_SLUG)).toBeTruthy();

      await page.goto('/login');
      await page.getByLabel('Email address').fill(process.env.E2E_CUSTOMER_EMAIL ?? '');
      await page.getByLabel('Password').fill(process.env.E2E_CUSTOMER_PASSWORD ?? '');
      await page.getByRole('button', { name: 'Sign in' }).click();
      await expect(page).toHaveURL(/\/(?:profile)?$/);

      await page.goto(`/products/${process.env.E2E_PRODUCT_SLUG}`);
      await page.getByRole('button', { name: 'Add to Bag' }).click();
      await expect(page.getByText('Added to bag')).toBeVisible();

      const cartBeforeOrderResponse = await customerApi.get('cart');
      expect(cartBeforeOrderResponse.ok()).toBeTruthy();
      const cartBeforeOrder = unwrap<Cart>(await cartBeforeOrderResponse.json());
      const selectedItem = cartBeforeOrder.items[0];
      if (!selectedItem) {
        throw new Error('The configured E2E product was not added to the customer cart.');
      }
      expect(selectedItem.availableStock).toBeGreaterThan(1);

      const carrierOptionsResponse = page.waitForResponse(
        (response) => response.request().method() === 'GET' && new URL(response.url()).pathname.endsWith('/api/v1/carriers/checkout-options'),
      );
      await page.goto('/cart');
      await page.getByRole('button', { name: 'Proceed to payment' }).click();
      await expect(page.getByRole('heading', { name: 'Shipping Destination' })).toBeVisible();
      const carrierOptionsApiResponse = await carrierOptionsResponse;
      expect(carrierOptionsApiResponse.ok()).toBeTruthy();
      const carrierOptions = unwrap<CheckoutCarrierOption[]>(await carrierOptionsApiResponse.json());

      const carrierRadios = page.locator('input[name="shipping-carrier"]');
      let selectedCarrierId: string | null = null;
      if (carrierOptions.length > 0) {
        await expect(carrierRadios).toHaveCount(carrierOptions.length);
        selectedCarrierId = await carrierRadios.first().inputValue();
        const carrierPreviewResponse = page.waitForResponse((response) => {
          return response.request().method() === 'POST' && new URL(response.url()).pathname.endsWith('/api/v1/orders/preview');
        });
        await carrierRadios.first().check({ force: true });
        const previewResponse = await carrierPreviewResponse;
        const previewPayload = previewResponse.request().postDataJSON() as CheckoutRequestBody;
        expect(previewPayload.carrierId).toBe(selectedCarrierId);
        const carrierPreview = unwrap<OrderPreview>(await previewResponse.json());
        expect(carrierPreview.carrierId).toBe(selectedCarrierId);
        expect(carrierPreview.shippingFee).toBeGreaterThanOrEqual(0);
        expect(carrierPreview.totalAmount).toBeGreaterThan(0);
      } else {
        await expect(page.getByRole('heading', { name: 'No carrier available' })).toBeVisible();
      }

      await page.getByRole('button', { name: 'Continue to payment' }).click();
      await expect(page.getByRole('heading', { name: 'Payment Method' })).toBeVisible();
      await page.getByRole('button', { name: /online/i }).first().click();
      await page.getByRole('button', { name: /Mock payment/ }).click();
      await page.getByRole('button', { name: 'Continue to rewards' }).click();
      await page.getByRole('button', { name: 'Continue to review' }).click();
      const createOrderRequest = page.waitForRequest(
        (request) => request.method() === 'POST' && new URL(request.url()).pathname.endsWith('/api/v1/orders'),
      );
      const createOrderResponse = page.waitForResponse(
        (response) => response.request().method() === 'POST' && new URL(response.url()).pathname.endsWith('/api/v1/orders'),
      );
      await page.getByRole('button', { name: 'Place order' }).click();
      await expect(page.getByRole('heading', { name: 'Order Confirmed.' })).toBeVisible();
      const createOrderPayload = (await createOrderRequest).postDataJSON() as CheckoutRequestBody;
      expect(createOrderPayload.shippingFee).toBeUndefined();
      expect(createOrderPayload.discountAmount).toBeUndefined();
      expect(createOrderPayload.totalAmount).toBeUndefined();
      expect(createOrderPayload.carrierId ?? null).toBe(selectedCarrierId);
      const createdOrder = unwrap<Order>(await (await createOrderResponse).json());
      expect(createdOrder.carrierId ?? null).toBe(selectedCarrierId);
      expect(createdOrder.shippingFee).toBeGreaterThanOrEqual(0);

      const initiatePaymentResponse = await customerApi.post(`payments/order/${createdOrder.id}/initiate`, {
        data: { provider: 'MOCK' },
        headers: { 'Idempotency-Key': `e2e-mock-payment-${createdOrder.id}` },
      });
      expect(initiatePaymentResponse.ok()).toBeTruthy();
      const initiatedPayment = unwrap<Payment>(await initiatePaymentResponse.json());
      if (!initiatedPayment.paymentUrl) {
        throw new Error('Mock payment initiation did not return a completion URL.');
      }
      const mockCompletionResponse = await page.goto(initiatedPayment.paymentUrl);
      expect(mockCompletionResponse?.ok()).toBeTruthy();

      const orderResponse = await customerApi.get(`orders/${createdOrder.id}`);
      expect(orderResponse.ok()).toBeTruthy();
      const order = unwrap<Order>(await orderResponse.json());
      expect(order.paymentStatus).toBe('PAID');
      expect(order.status).toBe('AWAITING_PAYMENT');

      const paymentResponse = await customerApi.get(`payments/order/${createdOrder.id}`);
      expect(paymentResponse.ok()).toBeTruthy();
      expect(unwrap<Payment>(await paymentResponse.json()).status).toBe('PAID');

      const restockProbeResponse = await customerApi.post('cart/items', {
        data: { variantId: selectedItem.variantId, quantity: 1 },
      });
      expect(restockProbeResponse.ok()).toBeTruthy();
      const restockProbe = unwrap<Cart>(await restockProbeResponse.json());
      const remainingItem = restockProbe.items.find((item) => item.variantId === selectedItem.variantId);
      expect(remainingItem?.availableStock).toBe(selectedItem.availableStock - 1);
    } finally {
      await customerApi.delete('cart');
      await customerApi.dispose();
      await unauthenticatedApi.dispose();
    }
  });
});
