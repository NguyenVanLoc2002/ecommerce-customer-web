import { mkdir, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { chromium } from '@playwright/test';

const baseURL = process.env.CHECKOUT_SCREENSHOT_URL ?? 'http://127.0.0.1:4173';
const outputDir = join(dirname(fileURLToPath(import.meta.url)), 'screenshots');
await mkdir(outputDir, { recursive: true });

const photo = await readFile(new URL('../stitch-review/images/photo-2.jpg', import.meta.url));
const image = {
  url: `data:image/jpeg;base64,${photo.toString('base64')}`,
  src: `data:image/jpeg;base64,${photo.toString('base64')}`,
  alt: 'Blue linen dress',
  width: 600,
  height: 750,
};
const address = {
  id: 'address-preview',
  receiverName: 'Nguyen An',
  phoneNumber: '0900000000',
  streetAddress: '12 Nguyen Hue',
  ward: 'Ben Nghe',
  district: 'District 1',
  city: 'Ho Chi Minh City',
  postalCode: '700000',
  addressType: 'HOME',
  isDefault: true,
  label: 'Home',
  fullAddress: '12 Nguyen Hue, Ben Nghe, District 1, Ho Chi Minh City',
  createdAt: '2026-11-01T00:00:00Z',
};
const cart = {
  id: 'cart-preview',
  totalItems: 1,
  subTotal: 890000,
  updatedAt: '2026-11-23T00:00:00Z',
  items: [{
    id: 'item-preview', variantId: 'variant-preview', variantName: 'Navy / M', sku: 'DRESS-01-M',
    productId: 'product-preview', productSlug: 'linen-dress', productName: 'Linen Midi Dress',
    brandName: 'Atelier', productImageUrl: image.url, unitPrice: 890000, salePrice: null,
    quantity: 1, availableStock: 5, lineTotal: 890000, createdAt: '2026-11-23T00:00:00Z',
  }],
};
const carrier = { id: 'carrier-preview', code: 'STANDARD', name: 'Standard delivery', providerType: 'INTERNAL', logoUrl: null, description: 'Estimated delivery details from carrier service.' };
const preview = { carrierId: carrier.id, carrierCode: carrier.code, carrierName: carrier.name, carrierProviderType: carrier.providerType, shippingServiceName: 'Standard', paymentMethod: 'COD', subTotal: 890000, discountAmount: 89000, shippingFee: 30000, totalAmount: 831000, voucherCode: 'WELCOME10', customerNote: null };
const order = {
  id: 'order-preview', code: 'FS-20261123-001', status: 'PENDING', createdAt: '2026-11-23T10:00:00Z', updatedAt: '2026-11-23T10:00:00Z',
  totalItems: 1, subTotal: 890000, discountTotal: 89000, shippingFee: 30000, grandTotal: 831000,
  carrierId: carrier.id, carrierCode: carrier.code, carrierName: carrier.name, carrierProviderType: carrier.providerType,
  paymentMethod: 'COD', paymentStatus: 'PENDING', customerNote: '', voucherCode: 'WELCOME10', canCancel: true,
  items: [{ id: 'order-item-preview', productId: 'product-preview', productSlug: 'linen-dress', productName: 'Linen Midi Dress', brandName: 'Atelier', variantId: 'variant-preview', sku: 'DRESS-01-M', color: 'Navy', size: 'M', quantity: 1, unitPrice: 890000, subtotal: 890000, primaryImage: image }],
  shippingAddress: address,
};

const browser = await chromium.launch({ headless: true });
try {
  for (const viewport of [{ name: 'desktop', width: 1280 }, { name: 'mobile', width: 390 }]) {
    const page = await browser.newPage({ viewport: { width: viewport.width, height: 1000 }, deviceScaleFactor: 2 });
    await page.route('**/api/v1/**', async (route) => {
      const pathname = new URL(route.request().url()).pathname;
      const data = pathname.endsWith('/cart') ? cart
        : pathname.endsWith('/addresses') ? [address]
          : pathname.endsWith('/carriers/checkout-options') ? [carrier]
            : pathname.endsWith('/orders/preview') ? preview
              : pathname.endsWith('/auth/refresh-token') ? null : {};
      await route.fulfill({ status: pathname.endsWith('/auth/refresh-token') ? 401 : 200, contentType: 'application/json', body: JSON.stringify({ data, message: null, timestamp: new Date().toISOString() }) });
    });
    await page.goto(`${baseURL}/`);
    await page.waitForTimeout(250);
    await page.evaluate(async ({ address, order }) => {
      const { useAuthStore } = await import('/src/shared/stores/authStore.ts');
      const { useCheckoutStore } = await import('/src/features/checkout/stores/checkoutStore.ts');
      useAuthStore.setState({ accessToken: 'preview-token', bootstrapStatus: 'ready', user: { id: 'preview-customer', email: 'preview@example.invalid', firstName: 'Nguyen', lastName: 'An', phoneNumber: '', role: 'CUSTOMER', roles: ['CUSTOMER'], loyaltyPoints: 0 } });
      useCheckoutStore.setState({ shippingAddressId: address.id, selectedCarrierId: 'carrier-preview', paymentMethod: 'COD', paymentProvider: 'MOMO', customerNote: 'Please call on arrival.', voucherCode: 'WELCOME10', confirmationOrder: order, orderPreview: null, previewLoading: false, previewError: null, previewRequestSignature: null, carrierSelectionError: null });
    }, { address, order });

    const captures = [
      ['address', 1420, 1587],
      ['payment', 1439, 1430],
      ['voucher', 1747, 1551],
      ['review', 1805, 1637],
      ['confirmation', 1987, 1579],
    ];
    for (const [route, desktopHeight, mobileHeight] of captures) {
      const height = viewport.name === 'desktop' ? desktopHeight : mobileHeight;
      await page.setViewportSize({ width: viewport.width, height });
      await page.evaluate((path) => {
        window.history.pushState({}, '', path);
        window.dispatchEvent(new PopStateEvent('popstate'));
      }, `/checkout/${route}`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(300);
      await page.screenshot({ path: join(outputDir, `${route}-${viewport.name}.png`), fullPage: true });
    }
    await page.close();
  }
} finally {
  await browser.close();
}
