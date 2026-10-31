const rawSiteUrl = import.meta.env.VITE_SITE_URL?.trim();
const rawUseMockData = import.meta.env.VITE_USE_MOCK_DATA?.trim().toLowerCase();
/**
 * Mock data is an opt-in development aid. A missing or malformed environment
 * variable must keep the storefront connected to its configured API instead
 * of silently serving local catalog data.
 */
export const isMockDataEnabled = (value: string | undefined) => value?.trim().toLowerCase() === 'true';

export const config = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL?.trim() ?? '/api/v1',
  siteUrl:
    rawSiteUrl && rawSiteUrl.length > 0
      ? rawSiteUrl
      : typeof window !== 'undefined'
        ? window.location.origin
        : 'http://localhost:5173',
  useMockData: isMockDataEnabled(rawUseMockData),
  authUsersKey: 'fashion-shop.mock-users',
  mockCommerceKey: 'fashion-shop.mock-commerce',
  mockEngagementKey: 'fashion-shop.mock-engagement',
  checkoutDraftKey: 'fashion-shop.checkout-draft',
} as const;
