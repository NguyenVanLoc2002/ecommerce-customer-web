const rawSiteUrl = import.meta.env.VITE_SITE_URL?.trim();
const rawUseMockData = import.meta.env.VITE_USE_MOCK_DATA?.trim().toLowerCase();
const mockDataDisabledValues = new Set(['false', '0', 'no', 'off']);

export const config = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL?.trim() ?? '/api/v1',
  siteUrl:
    rawSiteUrl && rawSiteUrl.length > 0
      ? rawSiteUrl
      : typeof window !== 'undefined'
        ? window.location.origin
        : 'http://localhost:5173',
  useMockData: !rawUseMockData || !mockDataDisabledValues.has(rawUseMockData),
  authHintKey: 'fashion-shop.refresh-token-hint',
  authUsersKey: 'fashion-shop.mock-users',
  authSessionKey: 'fashion-shop.mock-session',
  mockCommerceKey: 'fashion-shop.mock-commerce',
  mockEngagementKey: 'fashion-shop.mock-engagement',
  checkoutDraftKey: 'fashion-shop.checkout-draft',
} as const;
