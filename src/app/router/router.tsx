/* eslint-disable react-refresh/only-export-components */
import type { ComponentProps, ComponentType, LazyExoticComponent } from 'react';
import { Suspense, lazy } from 'react';
import { Navigate, Outlet, createBrowserRouter } from 'react-router-dom';

import { routes } from '@/constants/routes';
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute';
import { LoadingOverlay } from '@/shared/components/feedback/LoadingOverlay';
import { AuthLayout } from '@/shared/components/layout/AuthLayout';
import { CheckoutLayout } from '@/shared/components/layout/CheckoutLayout';
import { ShopLayout } from '@/shared/components/layout/ShopLayout';

const HomePage = lazy(() => import('@/features/home/pages/HomePage'));
const ProductListPage = lazy(() => import('@/features/products/pages/ProductListPage'));
const ProductDetailPage = lazy(() => import('@/features/products/pages/ProductDetailPage'));
const CartPage = lazy(() => import('@/features/cart/pages/CartPage'));
const CheckoutAddressPage = lazy(() => import('@/features/checkout/pages/CheckoutAddressPage'));
const CheckoutPaymentPage = lazy(() => import('@/features/checkout/pages/CheckoutPaymentPage'));
const CheckoutVoucherPage = lazy(() => import('@/features/checkout/pages/CheckoutVoucherPage'));
const CheckoutReviewPage = lazy(() => import('@/features/checkout/pages/CheckoutReviewPage'));
const CheckoutConfirmationPage = lazy(() => import('@/features/checkout/pages/CheckoutConfirmationPage'));
const OrdersPage = lazy(() => import('@/features/orders/pages/OrdersPage'));
const OrderDetailPage = lazy(() => import('@/features/orders/pages/OrderDetailPage'));
const PaymentResultPage = lazy(() => import('@/features/payment/pages/PaymentResultPage'));
const ShipmentTrackingPage = lazy(() => import('@/features/shipment/pages/ShipmentTrackingPage'));
const LoginPage = lazy(() => import('@/features/auth/pages/LoginPage'));
const RegisterPage = lazy(() => import('@/features/auth/pages/RegisterPage'));
const NotFoundPage = lazy(() => import('@/app/router/NotFoundPage'));
const PlaceholderRoutePage = lazy(() => import('@/app/router/PlaceholderRoutePage'));

const renderLazyPage = (Component: LazyExoticComponent<ComponentType<Record<string, never>>>) => (
  <Suspense fallback={<LoadingOverlay label="Loading route..." />}>
    <Component />
  </Suspense>
);

const ProtectedOutlet = () => (
  <ProtectedRoute>
    <Outlet />
  </ProtectedRoute>
);

type PlaceholderProps = {
  title: string;
  description: string;
  path: string;
};

const protectedPlaceholder = (props: PlaceholderProps) => (
  <Suspense fallback={<LoadingOverlay label="Loading route..." />}>
    <PlaceholderRoutePage {...(props as ComponentProps<typeof PlaceholderRoutePage>)} />
  </Suspense>
);

export const router = createBrowserRouter([
  {
    element: <ShopLayout />,
    children: [
      {
        index: true,
        element: renderLazyPage(HomePage),
      },
      {
        path: routes.products,
        element: renderLazyPage(ProductListPage),
      },
      {
        path: routes.productDetail,
        element: renderLazyPage(ProductDetailPage),
      },
      {
        element: <ProtectedOutlet />,
        children: [
          {
            path: routes.cart,
            element: renderLazyPage(CartPage),
          },
          {
            path: routes.orders,
            element: renderLazyPage(OrdersPage),
          },
          {
            path: routes.orderDetail,
            element: renderLazyPage(OrderDetailPage),
          },
          {
            path: routes.orderTracking,
            element: renderLazyPage(ShipmentTrackingPage),
          },
          {
            path: routes.orderInvoice,
            element: protectedPlaceholder({
              title: 'Invoice',
              path: routes.orderInvoice,
              description: 'Printable invoice surfaces are planned for a later phase.',
            }),
          },
          {
            path: routes.orderReview,
            element: protectedPlaceholder({
              title: 'Write Review',
              path: routes.orderReview,
              description: 'Structured review submission arrives in Phase 10.',
            }),
          },
          {
            path: routes.paymentResult,
            element: renderLazyPage(PaymentResultPage),
          },
          {
            path: routes.profile,
            element: protectedPlaceholder({
              title: 'Profile',
              path: routes.profile,
              description: 'Profile editing and account details arrive in Phase 12.',
            }),
          },
          {
            path: routes.profileAddresses,
            element: protectedPlaceholder({
              title: 'Address Book',
              path: routes.profileAddresses,
              description: 'Address management is planned for Phase 12.',
            }),
          },
          {
            path: routes.profileAddressNew,
            element: protectedPlaceholder({
              title: 'Add Address',
              path: routes.profileAddressNew,
              description: 'Address form reuse is planned for Phase 12.',
            }),
          },
          {
            path: routes.profileAddressEdit,
            element: protectedPlaceholder({
              title: 'Edit Address',
              path: routes.profileAddressEdit,
              description: 'Address editing is planned for Phase 12.',
            }),
          },
          {
            path: routes.profileReviews,
            element: protectedPlaceholder({
              title: 'My Reviews',
              path: routes.profileReviews,
              description: 'Review history is planned for Phase 10.',
            }),
          },
          {
            path: routes.notifications,
            element: protectedPlaceholder({
              title: 'Notifications',
              path: routes.notifications,
              description: 'Notification center work is scheduled for Phase 11.',
            }),
          },
        ],
      },
    ],
  },
  {
    element: <ProtectedOutlet />,
    children: [
      {
        element: <CheckoutLayout />,
        children: [
          {
            path: routes.checkoutAddress,
            element: renderLazyPage(CheckoutAddressPage),
          },
          {
            path: routes.checkoutPayment,
            element: renderLazyPage(CheckoutPaymentPage),
          },
          {
            path: routes.checkoutVoucher,
            element: renderLazyPage(CheckoutVoucherPage),
          },
          {
            path: routes.checkoutReview,
            element: renderLazyPage(CheckoutReviewPage),
          },
          {
            path: routes.checkoutConfirmation,
            element: renderLazyPage(CheckoutConfirmationPage),
          },
        ],
      },
    ],
  },
  {
    element: <AuthLayout />,
    children: [
      {
        path: routes.login,
        element: renderLazyPage(LoginPage),
      },
      {
        path: routes.register,
        element: renderLazyPage(RegisterPage),
      },
    ],
  },
  {
    path: routes.notFound,
    element: renderLazyPage(NotFoundPage),
  },
  {
    path: '*',
    element: <Navigate replace to={routes.notFound} />,
  },
]);
