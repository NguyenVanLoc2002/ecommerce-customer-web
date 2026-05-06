# CLAUDE-WEB.md

## 1. Project Overview

Customer Web App cho hệ thống **Fashion Shop** — trang web mua sắm thời trang dành cho khách hàng (role: `CUSTOMER`).

**Tech Stack**:
- React 18 + Vite 5
- TypeScript (strict mode)
- React Router v6 (`createBrowserRouter`)
- TanStack Query v5 (server state)
- Zustand (client state)
- React Hook Form + Zod (forms & validation)
- Axios (HTTP client)
- Tailwind CSS v3 + CSS Variables (styling)
- Framer Motion (animations)
- React Helmet Async (SEO)
- Lucide React (icons)

**Backend**: REST API tại `http://localhost:8080/api/v1`
**Auth**: JWT Bearer token. Access token lives in memory (Zustand). Refresh token lives only in the backend-managed `HttpOnly` cookie and must never be stored in `localStorage` or `sessionStorage`.
**Role**: `CUSTOMER` only — web app không phục vụ admin hay staff.

---

## 2. Folder Structure

Feature-based architecture. Mỗi feature tự chứa đủ các lớp của nó.

```text
src/
│
├── app/                            # App entry & global setup
│   ├── main.tsx
│   ├── App.tsx
│   ├── router/
│   │   ├── index.tsx               # createBrowserRouter config
│   │   ├── ProtectedRoute.tsx      # Auth guard wrapper
│   │   └── routes.ts               # Route path constants
│   └── providers/
│       ├── QueryProvider.tsx
│       ├── AuthProvider.tsx        # Bootstrap auth via credentialed refresh-cookie request
│       └── HelmetProvider.tsx      # React Helmet Async wrapper
│
├── features/
│   ├── auth/
│   │   ├── components/
│   │   │   ├── LoginForm.tsx
│   │   │   └── RegisterForm.tsx
│   │   ├── hooks/
│   │   │   ├── useLogin.ts
│   │   │   └── useRegister.ts
│   │   ├── pages/
│   │   │   ├── LoginPage.tsx
│   │   │   └── RegisterPage.tsx
│   │   ├── schemas/
│   │   │   └── authSchema.ts
│   │   ├── services/
│   │   │   └── authService.ts
│   │   └── index.ts
│   │
│   ├── home/
│   │   ├── components/
│   │   │   ├── HeroSection.tsx
│   │   │   ├── CategoryGrid.tsx
│   │   │   ├── FeaturedProducts.tsx
│   │   │   └── PromoBanner.tsx
│   │   ├── pages/
│   │   │   └── HomePage.tsx
│   │   └── index.ts
│   │
│   ├── products/
│   │   ├── components/
│   │   │   ├── ProductCard.tsx
│   │   │   ├── ProductGrid.tsx
│   │   │   ├── FilterPanel.tsx
│   │   │   ├── SortDropdown.tsx
│   │   │   ├── VariantSelector.tsx
│   │   │   ├── ProductMediaGallery.tsx
│   │   │   ├── PurchaseBlock.tsx
│   │   │   ├── StickyCartBar.tsx      # Mobile sticky CTA
│   │   │   └── ReviewSection.tsx
│   │   ├── hooks/
│   │   │   ├── useProducts.ts
│   │   │   └── useProductDetail.ts
│   │   ├── pages/
│   │   │   ├── ProductListPage.tsx
│   │   │   └── ProductDetailPage.tsx
│   │   ├── services/
│   │   │   └── productService.ts
│   │   ├── types/
│   │   │   └── product.types.ts
│   │   └── index.ts
│   │
│   ├── cart/
│   ├── checkout/
│   │   ├── pages/
│   │   │   ├── CheckoutAddressPage.tsx    # Step 1
│   │   │   ├── CheckoutPaymentPage.tsx    # Step 2
│   │   │   ├── CheckoutVoucherPage.tsx    # Step 3
│   │   │   ├── CheckoutReviewPage.tsx     # Step 4
│   │   │   └── OrderConfirmationPage.tsx
│   │   └── ...
│   ├── orders/
│   ├── payment/
│   ├── shipment/
│   ├── invoice/
│   ├── reviews/
│   ├── notifications/
│   └── profile/
│       ├── pages/
│       │   ├── ProfilePage.tsx
│       │   └── AddressBookPage.tsx
│       └── ...
│
├── shared/
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Divider.tsx
│   │   │   └── Avatar.tsx
│   │   ├── feedback/
│   │   │   ├── Toast.tsx
│   │   │   ├── SkeletonCard.tsx
│   │   │   ├── SkeletonDetail.tsx
│   │   │   ├── SkeletonTimeline.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   └── ErrorCard.tsx
│   │   ├── layout/
│   │   │   ├── PageWrapper.tsx        # HTML <main> + scroll-to-top on route change
│   │   │   ├── Container.tsx          # Max-width centered wrapper
│   │   │   ├── Header.tsx             # Sticky nav
│   │   │   ├── Footer.tsx
│   │   │   └── SectionHeader.tsx
│   │   ├── seo/
│   │   │   ├── PageSEO.tsx            # Helmet title + meta + canonical + OG
│   │   │   └── JsonLd.tsx             # JSON-LD structured data
│   │   └── overlays/
│   │       ├── Modal.tsx
│   │       ├── Drawer.tsx             # Side or bottom sheet
│   │       ├── ConfirmDialog.tsx      # Replaces ConfirmBottomSheet
│   │       ├── LoadingOverlay.tsx
│   │       └── FilterDrawer.tsx
│   ├── hooks/
│   │   ├── useDebounce.ts
│   │   ├── useInfiniteList.ts
│   │   ├── useScrollReveal.ts         # Intersection Observer reveal
│   │   ├── useScrollLock.ts           # Lock body scroll when modal open
│   │   └── useToast.ts
│   ├── lib/
│   │   ├── axios.ts
│   │   ├── queryClient.ts
│   │   └── analytics.ts              # Optional: page view tracking
│   ├── stores/
│   │   ├── authStore.ts
│   │   └── uiStore.ts
│   ├── types/
│   │   ├── api.types.ts
│   │   ├── auth.types.ts
│   │   └── enums.ts
│   └── utils/
│       ├── formatMoney.ts
│       ├── formatDate.ts
│       ├── formatRelativeTime.ts
│       └── seo.ts                    # generateTitle, buildProductJsonLd, buildBreadcrumbJsonLd
│
├── constants/
│   ├── queryKeys.ts
│   ├── routes.ts                     # Route path constants (strings)
│   └── config.ts
│
└── main.tsx
```

### Rules

- **Cross-feature imports cấm.** Feature A không được import từ `features/B/components/...`. Nếu cần dùng chung, chuyển vào `shared/`.
- `index.ts` trong mỗi feature chỉ export những gì public.
- **Pages** chỉ compose components + gọi hooks. Không chứa API call hay business logic trực tiếp.
- Không tạo `helpers/` hay `utils/` chung lẫn lộn.

---

## 3. Routing Structure

### 3.1 Route Tree

```
/                             → HomePage
/products                     → ProductListPage
/products/:slug               → ProductDetailPage
/cart                         → CartPage
/checkout/address             → CheckoutAddressPage  (protected)
/checkout/payment             → CheckoutPaymentPage  (protected)
/checkout/voucher             → CheckoutVoucherPage  (protected)
/checkout/review              → CheckoutReviewPage   (protected)
/checkout/confirmation        → OrderConfirmationPage (protected)
/orders                       → OrderListPage        (protected)
/orders/:orderId              → OrderDetailPage      (protected)
/orders/:orderId/tracking     → ShipmentTrackingPage (protected)
/payment/result               → PaymentResultPage    (protected)
/profile                      → ProfilePage          (protected)
/profile/addresses            → AddressBookPage      (protected)
/profile/addresses/new        → AddressFormPage      (protected)
/profile/addresses/:id/edit   → AddressFormPage      (protected)
/profile/reviews              → MyReviewsPage        (protected)
/orders/:orderId/review       → WriteReviewPage      (protected)
/orders/:orderId/invoice      → InvoicePage          (protected)
/notifications                → NotificationPage     (protected)
/login                        → LoginPage
/register                     → RegisterPage
```

### 3.2 Route Config (`src/app/router/index.tsx`)

```ts
import { createBrowserRouter } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { ProtectedRoute } from './ProtectedRoute';
import { ShopLayout } from '@/shared/components/layout/ShopLayout';
import { AuthLayout } from '@/shared/components/layout/AuthLayout';

const HomePage = lazy(() => import('@/features/home/pages/HomePage'));
const ProductListPage = lazy(() => import('@/features/products/pages/ProductListPage'));
// ... other lazy imports

export const router = createBrowserRouter([
  {
    element: <ShopLayout />,  // Header + Footer
    children: [
      { path: '/', element: <Suspense fallback={<PageSkeleton />}><HomePage /></Suspense> },
      { path: '/products', element: <Suspense fallback={<PageSkeleton />}><ProductListPage /></Suspense> },
      { path: '/products/:slug', element: <Suspense fallback={<PageSkeleton />}><ProductDetailPage /></Suspense> },
      {
        element: <ProtectedRoute />,
        children: [
          { path: '/cart', element: <Suspense fallback={<PageSkeleton />}><CartPage /></Suspense> },
          { path: '/checkout/address', element: <CheckoutAddressPage /> },
          // ... all protected routes
        ],
      },
    ],
  },
  {
    element: <AuthLayout />,  // Logo only, no nav
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
    ],
  },
]);
```

### 3.3 ProtectedRoute

```tsx
// src/app/router/ProtectedRoute.tsx
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/shared/stores/authStore';

export function ProtectedRoute() {
  const { isAuthenticated } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  return <Outlet />;
}
```

### 3.4 Route Constants (`src/constants/routes.ts`)

```ts
export const ROUTES = {
  HOME: '/',
  PRODUCTS: '/products',
  PRODUCT_DETAIL: (slug: string) => `/products/${slug}`,
  CART: '/cart',
  CHECKOUT_ADDRESS: '/checkout/address',
  CHECKOUT_PAYMENT: '/checkout/payment',
  CHECKOUT_VOUCHER: '/checkout/voucher',
  CHECKOUT_REVIEW: '/checkout/review',
  ORDER_CONFIRMATION: '/checkout/confirmation',
  ORDERS: '/orders',
  ORDER_DETAIL: (orderId: number) => `/orders/${orderId}`,
  SHIPMENT_TRACKING: (orderId: number) => `/orders/${orderId}/tracking`,
  PAYMENT_RESULT: '/payment/result',
  PROFILE: '/profile',
  ADDRESSES: '/profile/addresses',
  ADDRESS_NEW: '/profile/addresses/new',
  ADDRESS_EDIT: (id: number) => `/profile/addresses/${id}/edit`,
  REVIEWS: '/profile/reviews',
  WRITE_REVIEW: (orderId: number) => `/orders/${orderId}/review`,
  INVOICE: (orderId: number) => `/orders/${orderId}/invoice`,
  NOTIFICATIONS: '/notifications',
  LOGIN: '/login',
  REGISTER: '/register',
} as const;
```

### 3.5 Navigation Rules

- Dùng `<Link>` và `useNavigate()` — không dùng `window.location`.
- Sau đặt hàng thành công: `navigate(ROUTES.ORDER_CONFIRMATION, { replace: true })` — không để user back về checkout.
- `?redirect=` param: khi session expire mid-flow, sau login navigate đến `redirect` param target.
- Scroll to top trên mỗi route change: handle trong `PageWrapper`.

---

## 4. Coding Rules

### 4.1 TypeScript

- `strict: true`. Không tắt bất kỳ strict flag nào.
- Không dùng `any`. Dùng `unknown` + type guard khi shape không biết trước.
- Không dùng `as SomeType` trừ khi đã validate trước đó.
- Luôn type data từ API — không để response type là `any`.
- Dùng `type` cho data shapes, `interface` cho contracts có thể extend.
- Enum từ backend map sang `const` object + union type:

```ts
export const OrderStatus = {
  PENDING: 'PENDING',
  AWAITING_PAYMENT: 'AWAITING_PAYMENT',
  CONFIRMED: 'CONFIRMED',
  PROCESSING: 'PROCESSING',
  SHIPPED: 'SHIPPED',
  DELIVERED: 'DELIVERED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  REFUNDED: 'REFUNDED',
} as const;

export type OrderStatus = typeof OrderStatus[keyof typeof OrderStatus];
```

### 4.2 Component Rules

- Functional components only.
- Một file = một component chính.
- Props phải có type rõ ràng.
- Component không gọi API trực tiếp. Data fetching qua custom hook.
- Named export cho components:

```ts
// Good
export function ProductCard({ product }: ProductCardProps) { ... }

// Bad — tránh anonymous default export
export default () => <div />;
```

- Không dùng `index.tsx` làm tên file component. File name phải match component name: `ProductCard.tsx`.

### 4.3 Web-Specific Rules

- Dùng HTML semantic elements đúng: `<nav>`, `<main>`, `<section>`, `<article>`, `<header>`, `<footer>`.
- Tất cả `<img>` phải có `alt` mô tả nội dung.
- Tất cả `<img>` phải định nghĩa `width` + `height` để tránh CLS.
- Hero / LCP image: `loading="eager"` + `fetchpriority="high"`.
- Các image khác: `loading="lazy"`.
- Dùng `<button>` cho interactive elements — không dùng `<div onClick>`.
- Tất cả buttons trong `<form>` phải có `type="button"` hoặc `type="submit"` rõ ràng.
- Không dùng `<a href="#">` — dùng `<button>` nếu không có URL thật.
- Lists dài (product grid): dùng windowing nếu > 100 items, hoặc infinite scroll + pagination thay vì render toàn bộ.

### 4.4 Naming Conventions

| Thing | Convention | Example |
|---|---|---|
| Page file | PascalCase + suffix `Page` | `ProductDetailPage.tsx` |
| Component file | PascalCase | `ProductCard.tsx` |
| Hook file | camelCase, prefix `use` | `useProductDetail.ts` |
| Service file | camelCase, suffix `Service` | `productService.ts` |
| Schema file | camelCase, suffix `Schema` | `checkoutSchema.ts` |
| Type file | camelCase, suffix `.types` | `product.types.ts` |
| Store file | camelCase, suffix `Store` | `authStore.ts` |
| Route constant | `ROUTES.PRODUCT_DETAIL(slug)` | see §3.4 |

### 4.5 General

- Không để `console.log` trong code.
- Không hardcode URL, route path, hay API path trong component. Dùng `ROUTES.*` và `config.ts`.
- Xử lý loading, error, empty state ở mọi page.
- Không dùng `Math.random()` hay index làm React key. Dùng id từ data.
- Không viết comment giải thích WHAT. Viết comment khi WHY là non-obvious.

---

## 5. API Integration Rules

### 5.1 Axios Instance

File: `src/shared/lib/axios.ts`

```ts
import axios from 'axios';
import { API_BASE_URL, REQUEST_TIMEOUT } from '@/constants/config';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: REQUEST_TIMEOUT,
});
```

**Request interceptor**: Attach `Authorization: Bearer <accessToken>` từ `authStore`.

**Response interceptor**:
- Unwrap `data.data` từ `ApiResponse<T>` wrapper.
- 401 → attempt token refresh via `POST /auth/refresh-token`:
  - Success → retry original request once.
  - Fail → clear `authStore` + clear legacy auth storage keys → `navigate('/login?redirect=...')`.
- Map `fieldErrors[]` thành `Record<string, string>` để feed vào React Hook Form.

Chỉ có một Axios instance duy nhất trong app.

### 5.2 Response Types

Giống hoàn toàn với mobile spec — không thay đổi API contract:

```ts
export interface ApiResponse<T> {
  success: boolean;
  code: string;
  message: string;
  data: T;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;   // zero-based
  size: number;
}

export interface ApiError {
  success: false;
  code: string;
  message: string;
  path: string;
  timestamp: string;
  fieldErrors?: FieldError[];
}

export interface FieldError {
  field: string;
  message: string;
}
```

### 5.3 Service Layer

```ts
// features/orders/services/orderService.ts
import { apiClient } from '@/shared/lib/axios';
import type { Order, CreateOrderRequest } from '../types/order.types';
import type { PaginatedResponse } from '@/shared/types/api.types';

export const orderService = {
  getMyOrders: (params: OrderListParams) =>
    apiClient.get<PaginatedResponse<Order>>('/orders', { params }),
  getById: (id: number) =>
    apiClient.get<Order>(`/orders/${id}`),
  create: (body: CreateOrderRequest) =>
    apiClient.post<Order>('/orders', body),
  cancel: (id: number) =>
    apiClient.post(`/orders/my/${id}/cancel`),
};
```

### 5.4 Query Keys

```ts
// src/constants/queryKeys.ts
export const queryKeys = {
  products: {
    all: ['products'] as const,
    list: (params: ProductListParams) => ['products', 'list', params] as const,
    detail: (slug: string) => ['products', 'detail', slug] as const,
  },
  cart: {
    current: () => ['cart', 'current'] as const,
  },
  orders: {
    list: (params: OrderListParams) => ['orders', 'list', params] as const,
    detail: (id: number) => ['orders', 'detail', id] as const,
  },
  notifications: {
    list: (params?: object) => ['notifications', 'list', params] as const,
    unreadCount: () => ['notifications', 'unread-count'] as const,
  },
};
```

### 5.5 TanStack Query Rules

- GET → `useQuery` hoặc `useInfiniteQuery`.
- POST/PATCH/DELETE → `useMutation`.
- `staleTime`: 30s cho lists, 60s cho details.
- Sau mutation thành công: `queryClient.invalidateQueries`.
- Không gọi API trong `useEffect`.
- Infinite scroll (product list, order list): `useInfiniteQuery` + Intersection Observer trigger.

```ts
// Infinite scroll trigger (web pattern, không phải FlatList)
const { ref: loadMoreRef } = useScrollReveal(0.1);

useEffect(() => {
  if (isIntersecting && hasNextPage && !isFetchingNextPage) {
    fetchNextPage();
  }
}, [isIntersecting, hasNextPage, isFetchingNextPage]);

// At bottom of list:
<div ref={loadMoreRef} />
```

---

## 6. UI/UX Rules for Web

### 6.1 Click Targets

- Minimum click target: **44×44px** (WCAG 2.5.5).
- Primary buttons: `height: 44px` minimum, comfortable padding.
- Icon buttons: `40×40px` minimum with padding.

### 6.2 Keyboard & Focus

- Mọi interactive element phải operable bằng keyboard.
- Visible focus ring trên tất cả elements: `outline: 2px solid var(--border-focus); outline-offset: 2px`.
- Modals và Drawers phải trap focus khi mở và restore focus khi đóng.
- Form fields: `Tab` moves focus forward, `Shift+Tab` moves back.
- Modal: `Escape` key đóng modal.
- Dropdown/Select: `Arrow keys` navigate options.

### 6.3 Loading States

| Situation | UI |
|---|---|
| Initial page load (route) | Skeleton matching page structure |
| Initial data load (GET) | Skeleton component (`SkeletonCard`, `SkeletonDetail`) |
| Button mutation | Button `loading` prop → spinner replaces label; button disabled |
| Load more (infinite) | Spinner at bottom of list |
| Full-screen blocking (place order, payment) | `<LoadingOverlay>` với message |
| Route-level lazy load | `<PageSkeleton>` trong Suspense fallback |

**Rules**:
- Skeleton khi initial load. Spinner khi user-triggered action.
- Không show skeleton và content cùng lúc.
- Loading không được gây layout shift (CLS).

### 6.4 Empty States

```tsx
<EmptyState
  icon={<ShoppingBag className="w-12 h-12" />}
  title="Giỏ hàng của bạn đang trống"
  description="Thêm sản phẩm để bắt đầu mua sắm"
  cta={<Button asChild><Link to={ROUTES.PRODUCTS}>Khám phá ngay</Link></Button>}
/>
```

### 6.5 Error States

```tsx
if (isError) {
  if (isApiError(error) && error.code === 'ORDER_NOT_FOUND') {
    return <NotFoundState message="Không tìm thấy đơn hàng" onBack={() => navigate(-1)} />;
  }
  return <ErrorCard message={error?.message} onRetry={refetch} />;
}
```

### 6.6 Toast System

```ts
const toast = useToast();

toast.success('Đã thêm vào giỏ hàng');
toast.error('Thanh toán thất bại. Vui lòng thử lại.');
toast.warning('Một số sản phẩm không còn hàng.');
toast.info('Phiên đăng nhập đã hết hạn.');
```

**Rules**:
- Position: top-right (desktop), bottom-center (mobile).
- Max 3 toasts cùng lúc.
- Success/Info: auto-dismiss 4s. Warning: 6s. Error: manual dismiss hoặc 8s.
- Field errors (`fieldErrors[]`) đi inline trong form — không dùng toast.

### 6.7 Confirmation Dialogs (Web)

Thay `ConfirmBottomSheet` của mobile bằng `<ConfirmDialog>` (Modal) trên desktop, và `<Drawer>` (slide từ bottom) trên mobile:

```tsx
const { confirm } = useConfirmDialog();

const handleCancelOrder = async () => {
  const ok = await confirm({
    title: 'Hủy đơn hàng này?',
    description: 'Hành động này không thể hoàn tác.',
    confirmLabel: 'Xác nhận hủy',
    cancelLabel: 'Quay lại',
    variant: 'destructive',
  });
  if (!ok) return;
  cancelOrder.mutate(orderId);
};
```

### 6.8 Image Handling

- Tất cả `<img>` phải có `alt`, `width`, `height`.
- Hero image: `loading="eager"` + `fetchpriority="high"` + kích thước cụ thể.
- Product images: `loading="lazy"`, `aspect-ratio: 3/4`, `object-fit: cover`.
- Fallback khi lỗi: grey placeholder với icon.

```tsx
<img
  src={product.imageUrl}
  alt={`${product.name} - ${variant.colorName}`}
  width={400}
  height={533}
  loading="lazy"
  className="w-full h-full object-cover"
  onError={(e) => { e.currentTarget.src = '/images/placeholder-product.svg'; }}
/>
```

### 6.9 Scroll Behavior

- `scroll-behavior: smooth` trong CSS cho anchor links.
- Scroll to top trên mỗi route change (trong `PageWrapper` với `useEffect`).
- Infinite scroll dùng Intersection Observer — không dùng scroll event listener.
- Sticky elements: Header (`position: sticky; top: 0`), PDP purchase block (desktop sticky sidebar), checkout order summary.

### 6.10 Responsiveness

| Breakpoint | Width | Key changes |
|---|---|---|
| Mobile | < 640px | Single column, hamburger nav, bottom drawers |
| Tablet | 640–1023px | 2-col product grid, collapsed sidebar |
| Desktop | ≥ 1024px | Full nav, 3–4 col grid, sidebars visible |

Tất cả component phải define explicit responsive behavior. Dùng Tailwind responsive prefixes: `sm:`, `md:`, `lg:`, `xl:`.

### 6.11 Accessibility

- Một `<h1>` visible per page.
- Heading hierarchy đúng: `h1 → h2 → h3`.
- `<nav aria-label="...">` cho mọi navigation region.
- `role="alert"` cho toast và error messages.
- `aria-live="polite"` cho dynamic content updates.
- `aria-label` cho icon-only buttons.
- Color không phải sole conveyor của state.
- Tất cả form inputs liên kết với label qua `htmlFor` / `id`.

---

## 7. State Management Rules

### 7.1 Phân loại state

| Loại state | Tool |
|---|---|
| Server data (products, orders, cart...) | TanStack Query |
| Form state | React Hook Form |
| Global auth state (accessToken, user info) | Zustand `authStore` |
| Global UI state (cart badge count, toast queue) | Zustand `uiStore` |
| Local UI state (modal open, selected tab) | `useState` |
| URL / filter state | React Router search params |

**Không dùng Zustand cho server data.**
**Filter state nên ở URL params** (`?category=ao-thun&sort=newest`) — không phải Zustand. Lý do: bookmarkable, shareable, SEO-friendly.

### 7.2 Auth Store

```ts
// src/shared/stores/authStore.ts
interface AuthState {
  accessToken: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  redirectAfterLogin: string | null;
  setTokens: (tokens: Tokens) => void;
  setUser: (user: AuthUser) => void;
  setRedirectAfterLogin: (path: string | null) => void;
  clear: () => void;
}
```

**Token storage trên web**:
- `accessToken`: Zustand memory only.
- `refreshToken`: backend `HttpOnly` cookie only. Frontend không được lưu hay đọc token này trong JavaScript.
- Khi app khởi động: xóa legacy refresh-token keys trong storage → gọi `POST /auth/refresh-token` với `withCredentials: true` → nếu success, set access token mới vào store.

### 7.3 Cart Badge & UI Store

```ts
// src/shared/stores/uiStore.ts
interface UIState {
  cartBadgeCount: number;
  setBadgeCount: (count: number) => void;
  incrementCart: () => void;
  decrementCart: () => void;
  // Toast queue managed here
}
```

### 7.4 URL as Filter State

```ts
// Trong ProductListPage
const [searchParams, setSearchParams] = useSearchParams();

const filters: ProductListParams = {
  keyword: searchParams.get('q') ?? undefined,
  categoryId: searchParams.get('category') ? Number(searchParams.get('category')) : undefined,
  brandId: searchParams.get('brand') ? Number(searchParams.get('brand')) : undefined,
  minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
  maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
  sort: (searchParams.get('sort') as SortOption) ?? 'createdAt,desc',
  page: searchParams.get('page') ? Number(searchParams.get('page')) : 0,
};
```

---

## 8. Forms & Validation

Giống mobile spec — React Hook Form + Zod + zodResolver. Thay `TextInput` bằng HTML `<input>`.

```tsx
// features/auth/components/LoginForm.tsx
export function LoginForm({ onSubmit }: LoginFormProps) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <Input
        label="Email"
        type="email"
        error={errors.email?.message}
        {...register('email')}
      />
      <Button type="submit" loading={isSubmitting} className="w-full">
        Đăng nhập
      </Button>
    </form>
  );
}
```

**Dirty state guard** — trên web dùng `beforeunload` event và React Router `useBlocker`:

```ts
// Cảnh báo khi user navigate away từ form đang dirty
const blocker = useBlocker(
  ({ currentLocation, nextLocation }) =>
    isDirty && currentLocation.pathname !== nextLocation.pathname
);
```

---

## 9. SEO Rules

Mọi page phải render `<PageSEO>`:

```tsx
<PageSEO
  title="Áo Thun Trắng Basic | Fashion Shop"
  description="Mua áo thun trắng basic chất lượng cao tại Fashion Shop. Vải cotton mềm mại, dễ phối đồ."
  canonical="https://fashionshop.vn/products/ao-thun-trang-basic"
  ogImage="https://cdn.fashionshop.vn/products/ao-thun-trang-basic-og.jpg"
/>
```

JSON-LD cho các page quan trọng:

```tsx
// ProductDetailPage
<JsonLd
  type="Product"
  data={buildProductJsonLd(product, canonicalUrl)}
/>
```

Rules:
- Một `<h1>` visible per page. KHÔNG ẩn `h1` bằng `display: none`.
- Product URLs: `/products/{slug}` — slug thân thiện.
- Canonical URL: luôn set, không có trailing slash.
- Images trong `<img>` thật (không CSS background) để crawler index.
- `noindex` cho: `/cart`, `/checkout/*`, `/payment/*`, `/orders/*`, `/profile/*`, `/login`, `/register`.

---

## 10. Animation Rules

```ts
// Luôn check reduced motion trước khi animate
import { useReducedMotion } from 'framer-motion';
const shouldReduce = useReducedMotion();
```

Dùng presets từ `src/shared/lib/motionPresets.ts` — không viết motion values inline trong component.

Không animate: checkout form fields, validation error messages, cart quantity stepper.

---

## 11. Error Handling

```ts
function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'success' in error &&
    (error as ApiError).success === false
  );
}
```

Xử lý tương tự mobile spec — chỉ thay platform-specific UI (Alert.alert → ConfirmDialog, SafeArea → padding-top).

---

## 12. Branching & Commit Conventions

### Branch types
- `dev`: branch chính của web team
- `feat/`: tính năng mới
- `bugfix/`: sửa lỗi
- `hotfix/`: fix gấp production
- `refactor/`: tái cấu trúc

### Branch naming
```
{type}/{task_id}_{title}
```

Ví dụ: `feat/2001_product_list_page`

### Commit format
```
{type}({feature}): {title}

{description nếu cần}

{Fixes/Complete #issue_number}
```

---

## 13. Environment Config

```ts
// src/constants/config.ts
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL!;
export const SITE_URL = import.meta.env.VITE_SITE_URL!;
export const REQUEST_TIMEOUT = 15_000;
export const POLLING_INTERVAL = 3_000;
export const POLLING_MAX_ATTEMPTS = 10;
export const SEARCH_DEBOUNCE_MS = 300;
export const NUMERIC_DEBOUNCE_MS = 500;
export const ENABLE_3D = import.meta.env.VITE_ENABLE_3D === 'true';
```

```env
# .env.local
VITE_API_BASE_URL=http://localhost:8080/api/v1
VITE_SITE_URL=http://localhost:5173
VITE_APP_NAME=Fashion Shop
VITE_ENABLE_3D=false

# .env.production
VITE_API_BASE_URL=https://api.fashionshop.com/api/v1
VITE_SITE_URL=https://fashionshop.vn
VITE_APP_NAME=Fashion Shop
VITE_ENABLE_3D=true
```

---

## 14. Development Priorities

### Phase 1 — Core Customer Flow
- auth (login / register / token refresh / bootstrap)
- homepage
- product listing + filtering
- product detail + variant selection
- cart management
- checkout 4-step flow
- order list + detail
- order cancellation

### Phase 2
- online payment flow + result screen
- shipment tracking
- invoice view
- voucher entry

### Phase 3
- review write + my reviews
- notifications
- profile + address book
- SEO structured data
- 3D scenes (optional, lazy-loaded)

---

## 15. AI Collaboration Instructions

Khi AI hỗ trợ code trong project này:

1. Không tự ý thêm thư viện ngoài stack đã định nghĩa.
2. Luôn viết TypeScript strict — không dùng `any`, không bỏ qua type error.
3. Mọi API call đi qua: service → custom hook → page. Không shortcut.
4. Khi tạo feature mới: tạo đủ service, hook(s), schema, types, components, page(s), SEO meta.
5. Khi tạo form: Zod schema + React Hook Form + field error display + dirty guard nếu cần.
6. Không viết business logic trong page/component. Page chỉ render và handle UI event.
7. Luôn handle 3 state của async operation: loading (skeleton/spinner), error (`ErrorCard`), success.
8. Mọi action destructive phải qua `ConfirmDialog` — không dùng `window.confirm`.
9. Token lưu đúng nơi: `accessToken` trong Zustand memory, `refreshToken` trong backend `HttpOnly` cookie only.
10. Không auto-retry POST/PATCH/DELETE. Mutation failure phải do user trigger lại.
11. Filter state phải ở URL search params — không Zustand.
12. Mọi page phải render `<PageSEO>` với đầy đủ title, description, canonical.
13. Giữ nhất quán naming convention, file structure, và import pattern với phần còn lại của codebase.
14. Animations phải check `useReducedMotion()` trước khi render.
