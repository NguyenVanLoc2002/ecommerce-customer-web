const LEGACY_CUSTOMER_AUTH_STORAGE_KEYS = [
  'fashion-shop.refresh-token-hint',
  'fashion-shop.refresh-token',
  'fashion-shop.customer.refresh-token',
  'fashion-shop.auth.refresh-token',
  'fashion-shop.mock-session',
] as const;

const clearStorageKeys = (storage: Storage | undefined, keys: readonly string[]) => {
  if (!storage) {
    return;
  }

  keys.forEach((key) => {
    storage.removeItem(key);
  });
};

export const clearLegacyCustomerAuthStorage = () => {
  if (typeof window === 'undefined') {
    return;
  }

  clearStorageKeys(window.localStorage, LEGACY_CUSTOMER_AUTH_STORAGE_KEYS);
  clearStorageKeys(window.sessionStorage, LEGACY_CUSTOMER_AUTH_STORAGE_KEYS);
};
