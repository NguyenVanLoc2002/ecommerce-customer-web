export const queryKeys = {
  auth: {
    me: ['auth', 'me'] as const,
  },
  home: {
    featured: ['home', 'featured'] as const,
    arrivals: ['home', 'arrivals'] as const,
    categories: ['home', 'categories'] as const,
  },
  products: {
    categories: ['products', 'categories'] as const,
    brands: ['products', 'brands'] as const,
    list: (params: string) => ['products', 'list', params] as const,
    detail: (slug: string) => ['products', 'detail', slug] as const,
    related: (slug: string) => ['products', 'related', slug] as const,
  },
  cart: {
    detail: ['cart', 'detail'] as const,
  },
  checkout: {
    voucher: (code: string, amount: number) => ['checkout', 'voucher', code, amount] as const,
    confirmation: ['checkout', 'confirmation'] as const,
  },
  orders: {
    list: ['orders', 'list'] as const,
    detail: (orderId: string) => ['orders', 'detail', orderId] as const,
  },
  payments: {
    byOrder: (orderId: string) => ['payments', 'order', orderId] as const,
  },
  shipments: {
    byOrder: (orderId: string) => ['shipments', 'order', orderId] as const,
  },
} as const;
