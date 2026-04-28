export const USER_ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  STAFF: 'STAFF',
  CUSTOMER: 'CUSTOMER',
} as const;

export type Role = (typeof USER_ROLES)[keyof typeof USER_ROLES];

export const SORT_OPTIONS = {
  FEATURED: 'featured',
  NEWEST: 'newest',
  PRICE_ASC: 'price-asc',
  PRICE_DESC: 'price-desc',
  RATING: 'rating',
} as const;

export type ProductSort = (typeof SORT_OPTIONS)[keyof typeof SORT_OPTIONS];

export const PAYMENT_METHODS = {
  COD: 'COD',
  ONLINE: 'ONLINE',
} as const;

export type PaymentMethod = (typeof PAYMENT_METHODS)[keyof typeof PAYMENT_METHODS];

export const ORDER_STATUSES = {
  PENDING: 'PENDING',
  AWAITING_PAYMENT: 'AWAITING_PAYMENT',
  CONFIRMED: 'CONFIRMED',
  PROCESSING: 'PROCESSING',
  SHIPPED: 'SHIPPED',
  DELIVERED: 'DELIVERED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const;

export type OrderStatus = (typeof ORDER_STATUSES)[keyof typeof ORDER_STATUSES];

export const ADDRESS_TYPES = {
  HOME: 'HOME',
  OFFICE: 'OFFICE',
} as const;

export type AddressType = (typeof ADDRESS_TYPES)[keyof typeof ADDRESS_TYPES];
