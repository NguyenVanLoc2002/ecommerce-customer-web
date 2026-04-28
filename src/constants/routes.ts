export const routes = {
  home: '/',
  products: '/products',
  productDetail: '/products/:slug',
  cart: '/cart',
  checkoutAddress: '/checkout/address',
  checkoutPayment: '/checkout/payment',
  checkoutVoucher: '/checkout/voucher',
  checkoutReview: '/checkout/review',
  checkoutConfirmation: '/checkout/confirmation',
  orders: '/orders',
  orderDetail: '/orders/:orderId',
  orderTracking: '/orders/:orderId/tracking',
  orderInvoice: '/orders/:orderId/invoice',
  orderReview: '/orders/:orderId/review',
  paymentResult: '/payment/result',
  profile: '/profile',
  profileAddresses: '/profile/addresses',
  profileAddressNew: '/profile/addresses/new',
  profileAddressEdit: '/profile/addresses/:id/edit',
  profileReviews: '/profile/reviews',
  notifications: '/notifications',
  login: '/login',
  register: '/register',
  notFound: '/404',
} as const;

export const routePaths = {
  productDetail: (slug: string) => `/products/${slug}`,
  orderDetail: (orderId: string) => `/orders/${orderId}`,
  orderTracking: (orderId: string) => `/orders/${orderId}/tracking`,
  orderInvoice: (orderId: string) => `/orders/${orderId}/invoice`,
  orderReview: (orderId: string) => `/orders/${orderId}/review`,
  paymentResult: (orderId?: string) =>
    orderId ? `/payment/result?orderId=${encodeURIComponent(orderId)}` : '/payment/result',
  profileAddressEdit: (id: string) => `/profile/addresses/${id}/edit`,
  loginRedirect: (redirect?: string) =>
    redirect ? `/login?redirect=${encodeURIComponent(redirect)}` : '/login',
} as const;
