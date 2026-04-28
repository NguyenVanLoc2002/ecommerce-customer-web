const rawSiteUrl = import.meta.env.VITE_SITE_URL?.trim();

export const config = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL?.trim() ?? '/api/v1',
  siteUrl:
    rawSiteUrl && rawSiteUrl.length > 0
      ? rawSiteUrl
      : typeof window !== 'undefined'
        ? window.location.origin
        : 'http://localhost:5173',
  useMockData: import.meta.env.VITE_USE_MOCK_DATA !== 'false',
  authHintKey: 'fashion-shop.refresh-token-hint',
  authUsersKey: 'fashion-shop.mock-users',
  authSessionKey: 'fashion-shop.mock-session',
  mockCommerceKey: 'fashion-shop.mock-commerce',
  mockEngagementKey: 'fashion-shop.mock-engagement',
  checkoutDraftKey: 'fashion-shop.checkout-draft',
} as const;
