/* eslint-disable react-refresh/only-export-components */
import type { ComponentType, LazyExoticComponent } from 'react';
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
const OrderReviewPage = lazy(() => import('@/features/orders/pages/OrderReviewPage'));
const InvoicePage = lazy(() => import('@/features/invoice/pages/InvoicePage'));
const PaymentResultPage = lazy(() => import('@/features/payment/pages/PaymentResultPage'));
const MomoReturnPage = lazy(() => import('@/features/payment/pages/MomoReturnPage'));
const PaypalReturnPage = lazy(() => import('@/features/payment/pages/PaypalReturnPage'));
const PaypalCancelPage = lazy(() => import('@/features/payment/pages/PaypalCancelPage'));
const ShipmentTrackingPage = lazy(() => import('@/features/shipment/pages/ShipmentTrackingPage'));
const MyReviewsPage = lazy(() => import('@/features/reviews/pages/MyReviewsPage'));
const NotificationsPage = lazy(() => import('@/features/notifications/pages/NotificationsPage'));
const ProfilePage = lazy(() => import('@/features/profile/pages/ProfilePage'));
const AddressBookPage = lazy(() => import('@/features/profile/pages/AddressBookPage'));
const AddressFormPage = lazy(() => import('@/features/profile/pages/AddressFormPage'));
const LoginPage = lazy(() => import('@/features/auth/pages/LoginPage'));
const RegisterPage = lazy(() => import('@/features/auth/pages/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('@/features/auth/pages/ForgotPasswordPage'));
const VerifyOtpPage = lazy(() => import('@/features/auth/pages/VerifyOtpPage'));
const ResetPasswordPage = lazy(() => import('@/features/auth/pages/ResetPasswordPage'));
const ProfileSecurityPage = lazy(() => import('@/features/auth/pages/ProfileSecurityPage'));
const NotFoundPage = lazy(() => import('@/app/router/NotFoundPage'));

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
            element: renderLazyPage(InvoicePage),
          },
          {
            path: routes.orderReview,
            element: renderLazyPage(OrderReviewPage),
          },
          {
            path: routes.paymentResult,
            element: renderLazyPage(PaymentResultPage),
          },
          {
            path: routes.paymentMomoReturn,
            element: renderLazyPage(MomoReturnPage),
          },
          {
            path: routes.paymentPaypalReturn,
            element: renderLazyPage(PaypalReturnPage),
          },
          {
            path: routes.paymentPaypalCancel,
            element: renderLazyPage(PaypalCancelPage),
          },
          {
            path: routes.profile,
            element: renderLazyPage(ProfilePage),
          },
          {
            path: routes.profileSecurity,
            element: renderLazyPage(ProfileSecurityPage),
          },
          {
            path: routes.profileAddresses,
            element: renderLazyPage(AddressBookPage),
          },
          {
            path: routes.profileAddressNew,
            element: renderLazyPage(AddressFormPage),
          },
          {
            path: routes.profileAddressEdit,
            element: renderLazyPage(AddressFormPage),
          },
          {
            path: routes.profileReviews,
            element: renderLazyPage(MyReviewsPage),
          },
          {
            path: routes.notifications,
            element: renderLazyPage(NotificationsPage),
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
      {
        path: routes.forgotPassword,
        element: renderLazyPage(ForgotPasswordPage),
      },
      {
        path: routes.verifyOtp,
        element: renderLazyPage(VerifyOtpPage),
      },
      {
        path: routes.resetPassword,
        element: renderLazyPage(ResetPasswordPage),
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
