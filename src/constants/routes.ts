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

const withReturnTo = (path: string, returnTo?: string) =>
  returnTo ? `${path}?returnTo=${encodeURIComponent(returnTo)}` : path;

const withQuery = (path: string, params: Record<string, string | undefined>) => {
  const search = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      search.set(key, value);
    }
  });

  const query = search.toString();
  return query ? `${path}?${query}` : path;
};

export const routePaths = {
  productDetail: (slug: string) => `/products/${slug}`,
  checkoutAddress: (selectedAddressId?: string) =>
    withQuery(routes.checkoutAddress, { selectedAddressId }),
  orderDetail: (orderId: string) => `/orders/${orderId}`,
  orderTracking: (orderId: string) => `/orders/${orderId}/tracking`,
  orderInvoice: (orderId: string) => `/orders/${orderId}/invoice`,
  orderReview: (orderId: string) => `/orders/${orderId}/review`,
  paymentResult: (orderId?: string) =>
    orderId ? `/payment/result?orderId=${encodeURIComponent(orderId)}` : '/payment/result',
  profileAddressNew: (returnTo?: string) => withReturnTo(routes.profileAddressNew, returnTo),
  profileAddressEdit: (id: string, returnTo?: string) => withReturnTo(`/profile/addresses/${id}/edit`, returnTo),
  loginRedirect: (redirect?: string) =>
    redirect ? `/login?redirect=${encodeURIComponent(redirect)}` : '/login',
} as const;
