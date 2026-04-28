# Delivery Plan — Fashion Shop Customer Web App

> Iterative implementation plan for the Customer Web App.
> Each phase builds on the previous. Do not start a phase until its dependency is complete.
> Intended for implementation with Claude — each phase is a self-contained work unit.

---

## Phase Overview

| Phase | Focus | Key Deliverable |
|---|---|---|
| 0 | Foundation | Vite + React scaffold, shared infrastructure, providers, SEO setup |
| 1 | Auth | Login, Register, token lifecycle, bootstrap |
| 2 | Routing Shell | All routes wired, lazy-loaded, layouts, page stubs |
| 3 | Homepage | Hero, categories, featured products, promo, animations |
| 4 | Product Discovery | Product listing with filters/search/infinite scroll + product detail |
| 5 | Cart | Cart management, add/remove/update, stale item detection |
| 6 | Checkout | 4-step checkout wizard, order placement |
| 7 | Orders | Order list, order detail, cancellation |
| 8 | Payment | Online payment initiation, result polling |
| 9 | Shipment Tracking | Shipment detail, event timeline |
| 10 | Reviews | Write review, my reviews, product review section |
| 11 | Notifications | Notification list, unread badge, mark read |
| 12 | Profile & Addresses | Profile edit, address book, address form |
| 13 | SEO & Polish | JSON-LD, Core Web Vitals audit, a11y pass, animations polish |

---

## Phase 0 — Foundation

### Goal
Establish the project scaffold, all shared infrastructure, SEO setup, and global providers so every subsequent phase can build on a stable base.

### Modules / Files

**Project config**
- `vite.config.ts` — React plugin, path aliases (`@/`), build optimizations
- `tsconfig.json` — strict mode, path aliases
- `tailwind.config.js` — brand colors, font families, custom tokens
- `src/index.css` — CSS custom properties (all design tokens), `@import` Google Fonts, base reset
- `.env.example`
- `index.html` — Google Fonts `<link rel="preconnect">`, `<link rel="preload">` for critical font

**Constants**
- `src/constants/config.ts` — `API_BASE_URL`, `APP_URL`, `REQUEST_TIMEOUT`, `POLLING_INTERVAL`, `POLLING_MAX_ATTEMPTS`, `SEARCH_DEBOUNCE_MS`, `NUMERIC_DEBOUNCE_MS`, `ENABLE_3D`
- `src/constants/routes.ts` — full `ROUTES` object (all route path functions)
- `src/constants/queryKeys.ts` — full query key factory for all features

**Shared types**
- `src/shared/types/api.types.ts` — `ApiResponse<T>`, `PaginatedResponse<T>`, `ApiError`, `FieldError`
- `src/shared/types/auth.types.ts` — `AuthUser`, `Tokens`
- `src/shared/types/enums.ts` — `OrderStatus`, `PaymentStatus`, `ShipmentStatus`, `ReviewStatus`, `AddressType`, `PaymentMethod`

**Shared lib**
- `src/shared/lib/axios.ts` — single Axios instance with request interceptor (Bearer token) and response interceptor (unwrap `data.data`, 401 refresh with queue, map `fieldErrors`)
- `src/shared/lib/queryClient.ts` — `QueryClient` with defaults (retry 2 for queries, 0 for mutations, staleTime 30s)
- `src/shared/lib/motionPresets.ts` — all Framer Motion variants (fadeUp, staggerContainer, cardReveal, pageVariants, drawerVariants, modalVariants, backdropVariants, stickyBarVariants)

**Shared stores**
- `src/shared/stores/authStore.ts` — `accessToken`, `user`, `isAuthenticated`, `redirectAfterLogin`, `setTokens`, `setUser`, `setRedirectAfterLogin`, `clear`
- `src/shared/stores/uiStore.ts` — `cartBadgeCount`, `setBadgeCount`, `incrementCart`, `decrementCart`, toast queue shape

**Shared utils**
- `src/shared/utils/formatMoney.ts`
- `src/shared/utils/formatDate.ts`
- `src/shared/utils/formatRelativeTime.ts`
- `src/shared/utils/seo.ts` — `generateTitle(page)`, `buildProductJsonLd(product, url)`, `buildBreadcrumbJsonLd(items)`, `buildOrganizationJsonLd()`

**Shared hooks**
- `src/shared/hooks/useDebounce.ts`
- `src/shared/hooks/useInfiniteList.ts` — wrapper for `useInfiniteQuery` + Intersection Observer trigger
- `src/shared/hooks/useScrollReveal.ts` — Intersection Observer for scroll-triggered animations
- `src/shared/hooks/useScrollLock.ts` — lock body scroll when modal/drawer open
- `src/shared/hooks/useToast.ts`
- `src/shared/hooks/useConfirmDialog.ts`

**Shared UI primitives**
- `src/shared/components/ui/Button.tsx` — variants (primary, secondary, ghost, outline, danger), sizes, loading state, `asChild` prop for link rendering
- `src/shared/components/ui/Input.tsx` — label, error, type, show/hide for password
- `src/shared/components/ui/Badge.tsx` — all status variants with colors
- `src/shared/components/ui/Avatar.tsx` — image with initials fallback
- `src/shared/components/ui/Divider.tsx`

**Feedback components**
- `src/shared/components/feedback/SkeletonCard.tsx`
- `src/shared/components/feedback/SkeletonDetail.tsx`
- `src/shared/components/feedback/SkeletonTimeline.tsx`
- `src/shared/components/feedback/EmptyState.tsx` — icon, title, description, optional CTA
- `src/shared/components/feedback/ErrorCard.tsx` — message + retry button
- `src/shared/components/feedback/Toast.tsx` + `ToastContainer.tsx`

**Layout components**
- `src/shared/components/layout/Container.tsx` — max-width centered wrapper with page padding
- `src/shared/components/layout/PageWrapper.tsx` — `<main>` + scroll-to-top on route change
- `src/shared/components/layout/SectionHeader.tsx`
- `src/shared/components/layout/ShopLayout.tsx` — `<Header>` + `<Outlet>` + `<Footer>` (stub)
- `src/shared/components/layout/AuthLayout.tsx` — centered card layout for auth pages
- `src/shared/components/layout/CheckoutLayout.tsx` — minimal header (logo only) for checkout pages

**SEO components**
- `src/shared/components/seo/PageSEO.tsx` — React Helmet Async: title, description, canonical, OG tags, robots
- `src/shared/components/seo/JsonLd.tsx` — renders `<script type="application/ld+json">`

**Overlay components**
- `src/shared/components/overlays/Modal.tsx` — focus trap, Escape to close, backdrop
- `src/shared/components/overlays/Drawer.tsx` — side (right) or bottom sheet; mobile-responsive
- `src/shared/components/overlays/ConfirmDialog.tsx` — title, description, confirm/cancel, variant (destructive)
- `src/shared/components/overlays/LoadingOverlay.tsx` — full-page blocking overlay with message
- `src/shared/components/overlays/FilterDrawer.tsx` — stub for filter panel in drawer

**Providers**
- `src/app/providers/QueryProvider.tsx` — wraps `QueryClientProvider`
- `src/app/providers/AuthProvider.tsx` — bootstraps auth from localStorage refresh hint on app start
- `src/app/providers/HelmetProvider.tsx` — wraps React Helmet Async `HelmetProvider`

**App entry**
- `src/main.tsx` — `RouterProvider` + providers
- `src/App.tsx` — `<HelmetProvider>` + `<QueryProvider>` + `<AuthProvider>` + `<RouterProvider>`

### Expected output
A runnable app skeleton that shows a blank page with header/footer layout. All shared infrastructure in place. TypeScript compiles with zero errors. CSS variables defined. Google Fonts loaded.

### Dependencies
None.

---

## Phase 1 — Authentication

### Goal
Login and register flows with form validation, API integration, token storage (memory + localStorage), and redirect handling.

### Modules / Files

**Types**
- `src/features/auth/types/auth.types.ts` — (re-export or extend shared `auth.types.ts`)

**Schemas**
- `src/features/auth/schemas/authSchema.ts` — `loginSchema`, `registerSchema` with Zod

**Services**
- `src/features/auth/services/authService.ts` — `login(body)`, `register(body)`, `refreshToken(token)`, `logout()`

**Hooks**
- `src/features/auth/hooks/useLogin.ts` — `useMutation`; on success: `setTokens`, `setUser`, navigate to `redirect` param or `/`
- `src/features/auth/hooks/useRegister.ts` — `useMutation`; on success: same as login
- `src/features/auth/hooks/useLogout.ts` — clear store + localStorage + `queryClient.clear()` + navigate to `/login`

**Components**
- `src/features/auth/components/LoginForm.tsx` — RHF + zodResolver; email, password (show/hide), submit with loading; inline errors for `INVALID_CREDENTIALS`, `ACCOUNT_DISABLED`
- `src/features/auth/components/RegisterForm.tsx` — all fields, confirm password validation, submit with loading; inline errors for `ACCOUNT_ALREADY_EXISTS`, phone conflict

**Pages**
- `src/features/auth/pages/LoginPage.tsx` — `<PageSEO noindex>` + `<LoginForm>` + link to register
- `src/features/auth/pages/RegisterPage.tsx` — `<PageSEO noindex>` + `<RegisterForm>` + link to login

**Auth bootstrap** (in `AuthProvider`)
- On mount: read `refreshToken` from localStorage → if present, call `POST /auth/refresh-token` → if success, set `accessToken` in store → continue. If fail, clear localStorage.

**Router**
- `src/app/router/ProtectedRoute.tsx` — reads `authStore.isAuthenticated`, redirects to `/login?redirect=...`
- `src/app/router/index.tsx` — wire `LoginPage`, `RegisterPage` under `AuthLayout`

**Feature index**
- `src/features/auth/index.ts`

### Expected output
User can log in, register, have tokens managed correctly. App navigates to homepage after login. Re-opening app while authenticated (with valid refresh token) bootstraps auth without re-login. Logout clears all state.

### Dependencies
Phase 0 complete.

---

## Phase 2 — Routing Shell

### Goal
All routes wired with lazy loading, all layout components complete, and all page stubs created.

### Modules / Files

**Complete `ShopLayout`** (`Header` + `Footer`)
- `src/shared/components/layout/Header.tsx` — logo, desktop nav links, search icon, cart icon badge, user menu (login/logout/profile), mobile hamburger → `<Drawer>` nav; sticky + blur on scroll
- `src/shared/components/layout/Footer.tsx` — 4-column links, social icons, copyright, payment methods
- `src/shared/components/layout/MobileNav.tsx` — slide-in drawer for mobile navigation

**Complete router** (`src/app/router/index.tsx`)
- All routes: public (Home, PLP, PDP) and protected (Cart, Checkout, Orders, Payment, Profile, Notifications)
- Lazy-loaded with `React.lazy` + `<Suspense fallback={<PageSkeleton />}>`
- Protected routes wrapped with `<ProtectedRoute>`
- Checkout routes under `<CheckoutLayout>`

**Page stubs** (empty placeholder pages for all non-auth pages, each with `<PageSEO>` stub):
- `HomePage`, `ProductListPage`, `ProductDetailPage`
- `CartPage`
- `CheckoutAddressPage`, `CheckoutPaymentPage`, `CheckoutVoucherPage`, `CheckoutReviewPage`, `OrderConfirmationPage`
- `OrderListPage`, `OrderDetailPage`
- `ShipmentTrackingPage`
- `PaymentResultPage`
- `ProfilePage`, `AddressBookPage`, `AddressFormPage`
- `MyReviewsPage`, `WriteReviewPage`
- `InvoicePage`
- `NotificationPage`
- `NotFoundPage` (404 fallback route)

**Breadcrumb component**
- `src/shared/components/layout/BreadcrumbNav.tsx` — semantic `<nav aria-label="Breadcrumb">` + `<ol>` + JSON-LD ready

### Expected output
All routes navigable. After login, user can navigate to all stub pages. Header shows cart badge placeholder. Mobile nav drawer works. 404 page shows for unknown routes.

### Dependencies
Phase 1 complete.

---

## Phase 3 — Homepage

### Goal
Full homepage with hero, category grid, featured products, promo banner, trust section, and scroll animations.

### Modules / Files

**Services**
- `src/features/products/services/productService.ts` — `getFeatured(params)`, `getNewArrivals(params)` (can stub with list endpoint + `featured=true`)
- `src/features/products/services/categoryService.ts` — `getCategories()`

**Hooks**
- `src/features/home/hooks/useFeaturedProducts.ts`
- `src/features/home/hooks/useCategories.ts`

**Components**
- `src/features/home/components/HeroSection.tsx` — full-viewport hero, Framer Motion stagger reveal (h1 lines, subtitle, CTAs, image), LCP image with `loading="eager"` + `fetchpriority="high"`
- `src/features/home/components/CategoryGrid.tsx` — 4-column grid on desktop, horizontal scroll on mobile; hover image zoom; scroll reveal
- `src/features/home/components/FeaturedProducts.tsx` — section title + `ProductGrid` (first 4); stagger reveal on scroll
- `src/features/home/components/PromoBanner.tsx` — dark full-width band; countdown timer (client-side from hardcoded date); editorial image
- `src/features/home/components/NewArrivals.tsx` — section title + `ProductGrid` (6 items); stagger reveal
- `src/features/home/components/TrustSection.tsx` — 3-column: free shipping, returns, quality; fade-in on scroll
- `src/features/home/components/NewsletterSection.tsx` — email input + submit; `<form>` with `aria-label`; placeholder POST

**Page**
- `src/features/home/pages/HomePage.tsx` — composes all sections; `<PageSEO>` with WebSite + Organization JSON-LD

**Animation**: all section use `useScrollReveal` + Framer Motion `staggerContainer` + `cardReveal`.

### Expected output
Homepage renders all sections with smooth scroll-triggered animations. Hero headline stagger works on load. Category and product grid hover states functional. Newsletter form submits (even if just a toast for now).

### Dependencies
Phase 2 complete.

---

## Phase 4 — Product Discovery

### Goal
Full product browsing: listing with filtering, URL-based state, infinite scroll, product detail with variant selection and add-to-cart.

### Modules / Files

**Types**
- `src/features/products/types/product.types.ts` — `Product`, `ProductDetail`, `ProductVariant`, `ProductMedia`, `ProductListParams`, `SortOption`

**Services**
- `src/features/products/services/productService.ts` — `getList(params)`, `getBySlug(slug)`, `getCategories()`, `getBrands()`

**Hooks**
- `src/features/products/hooks/useProducts.ts` — `useInfiniteQuery`; `staleTime: 30_000`
- `src/features/products/hooks/useProductDetail.ts` — `useQuery` by slug; `staleTime: 60_000`
- `src/features/products/hooks/useAddToCart.ts` — `useMutation` for `POST /cart/items`; on success: `incrementCart`, toast, invalidate cart

**Components**
- `src/features/products/components/ProductCard.tsx` — image (`aspect-ratio: 3/4`, `loading="lazy"`), badge overlay, title (`<h3>`), price, quick-add button (hover reveal via Framer Motion); `<a>` wraps card for SEO
- `src/features/products/components/ProductGrid.tsx` — responsive CSS grid (2→3→4 cols); Framer Motion stagger; Intersection Observer load-more trigger; skeleton cards on load
- `src/features/products/components/FilterPanel.tsx` — category, brand, price range, sort; sidebar (desktop) or `<FilterDrawer>` (mobile); URL param sync
- `src/features/products/components/SortDropdown.tsx` — sort select synced to URL param
- `src/features/products/components/ActiveFilterChips.tsx` — display + clear active filters
- `src/features/products/components/VariantSelector.tsx` — two-step (Color → Size); INACTIVE greyed; out-of-stock indicator
- `src/features/products/components/ProductMediaGallery.tsx` — main image + thumbnail strip; zoom on hover (desktop); swipe on mobile; lightbox on click
- `src/features/products/components/PurchaseBlock.tsx` — title (`<h1>`), price, variant selector, quantity stepper, add-to-cart button, wishlist button, delivery info snippet; sticky on desktop
- `src/features/products/components/StickyCartBar.tsx` — mobile only; appears when main CTA scrolls out of viewport; Framer Motion slide-up
- `src/features/products/components/BreadcrumbNav.tsx` — Home → Category → Product Name

**Pages**
- `src/features/products/pages/ProductListPage.tsx` — `<PageSEO>` with `ItemList` JSON-LD; search bar (debounced 300ms); filter panel; sort; active chips; product grid; results count; URL search params as filter state; empty/error states
- `src/features/products/pages/ProductDetailPage.tsx` — `<PageSEO>` with `Product` + `BreadcrumbList` JSON-LD; media gallery; purchase block; sticky desktop layout; product description; review section (stub, Phase 10); related products

**Feature index**
- `src/features/products/index.ts`

### Expected output
User can browse, search, filter (URL-based), infinite scroll, view product detail, select variant, and add to cart. Cart badge increments. All skeleton/error/empty states implemented. SEO meta correct per product. StickyCartBar appears on mobile scroll.

### Dependencies
Phase 3 complete.

---

## Phase 5 — Cart

### Goal
Full cart management: view, update quantity, remove (optimistic), stale item detection, and proceed to checkout.

### Modules / Files

**Types**
- `src/features/cart/types/cart.types.ts` — `Cart`, `CartItem`, `CartSummary`

**Services**
- `src/features/cart/services/cartService.ts` — `getCart()`, `addItem(body)`, `updateItem(itemId, body)`, `removeItem(itemId)`, `clearCart()`

**Hooks**
- `src/features/cart/hooks/useCart.ts` — `useQuery`; on success syncs `uiStore.setBadgeCount(cart.totalItems)`
- `src/features/cart/hooks/useUpdateCartItem.ts` — `useMutation`; handles `INVENTORY_NOT_ENOUGH`, `VARIANT_OUT_OF_STOCK`, `CART_ITEM_QUANTITY_INVALID` inline
- `src/features/cart/hooks/useRemoveCartItem.ts` — `useMutation` with optimistic update; rollback on error
- `src/features/cart/hooks/useClearCart.ts` — `useMutation` guarded by `useConfirmDialog`

**Components**
- `src/features/cart/components/CartItem.tsx` — image, product name (link), variant, SKU, quantity stepper, line total, remove button; inline error for stock issues; stale item highlight
- `src/features/cart/components/CartSummaryPanel.tsx` — subtotal, voucher entry (collapsed), discount row, "Proceed to Checkout" CTA; sticky on desktop (right sidebar)
- `src/features/cart/components/StaleItemsBanner.tsx` — amber warning banner

**Page**
- `src/features/cart/pages/CartPage.tsx` — `<PageSEO noindex>`; stale items banner; two-column layout (items left, summary right on desktop); empty state; skeleton × 3; clear cart option

**Feature index**
- `src/features/cart/index.ts`

### Expected output
User can view cart, update quantities (inline stock errors), remove items (optimistic), clear cart (with confirm dialog), see stale item warnings, and proceed to checkout. Cart badge stays in sync.

### Dependencies
Phase 4 complete.

---

## Phase 6 — Checkout & Order Placement

### Goal
4-step checkout wizard ending in order confirmation. All race conditions handled.

### Modules / Files

**Types**
- `src/features/checkout/types/checkout.types.ts` — `CheckoutState`, `CreateOrderRequest`, `OrderResponse`
- `src/features/orders/types/order.types.ts` — `Order`, `OrderItem`

**Schemas**
- `src/features/checkout/schemas/checkoutSchema.ts` — address selection, customer note (max 500 chars)

**Services**
- `src/features/orders/services/orderService.ts` — `create(body)` + stubs for other methods
- `src/features/voucher/services/voucherService.ts` — `validate(code, body)`

**Hooks**
- `src/features/checkout/hooks/useCheckoutStore.ts` — Zustand slice: `selectedAddressId`, `paymentMethod`, `voucherCode`, `voucherDiscount`, `customerNote`, setters
- `src/features/checkout/hooks/useVoucherValidation.ts` — `useMutation`; handles all `VOUCHER_*` error codes inline
- `src/features/checkout/hooks/usePlaceOrder.ts` — `useMutation` for `POST /orders`; shows `<LoadingOverlay>`; on success `navigate(ROUTES.ORDER_CONFIRMATION, { replace: true })`; handles `INVENTORY_NOT_ENOUGH`, `STOCK_RESERVATION_FAILED`, `VOUCHER_*` errors; network timeout warning without auto-retry

**Components**
- `src/features/checkout/components/CheckoutStepper.tsx` — horizontal 4-step progress bar; accessible `<ol>` with `aria-current="step"`
- `src/features/checkout/components/OrderSummaryPanel.tsx` — collapsible on mobile, sticky on desktop; shows items, subtotal, discount, total

**Pages** (all `<PageSEO noindex>`, all use `<CheckoutLayout>`):
- `CheckoutAddressPage.tsx` — saved address list (radio cards), "Add new address" push; validation gate; `<PageSEO noindex>`
- `CheckoutPaymentPage.tsx` — COD vs Online radio group
- `CheckoutVoucherPage.tsx` — code input, apply button, voucher preview, skip allowed
- `CheckoutReviewPage.tsx` — read-only summary, note input, "Place Order" (single-use disabled), error banners, `<LoadingOverlay>`
- `OrderConfirmationPage.tsx` — animated success checkmark (CSS animation), order code (click-to-copy), COD/Online branching CTA; `<PageSEO noindex>`

**Feature index**
- `src/features/checkout/index.ts`

### Expected output
User completes full checkout flow. All inventory and voucher race conditions handled. Order confirmation shows correctly. Back navigation blocked after confirmation.

### Dependencies
Phase 5 complete.

---

## Phase 7 — Orders

### Goal
Order list with status filter tabs and full order detail with cancellation.

### Modules / Files

**Types**
- `src/features/orders/types/order.types.ts` — complete `Order`, `OrderItem`, `OrderListParams`, `OrderDetail`

**Services**
- `src/features/orders/services/orderService.ts` — `getMyOrders(params)`, `getById(id)`, `cancel(id)`

**Hooks**
- `src/features/orders/hooks/useOrders.ts` — `useInfiniteQuery` with status filter; `staleTime: 30_000`
- `src/features/orders/hooks/useOrderDetail.ts` — `useQuery`; `staleTime: 60_000`
- `src/features/orders/hooks/useCancelOrder.ts` — `useMutation` guarded by `useConfirmDialog`; handles `ORDER_CANNOT_CANCEL`, `ORDER_STATUS_INVALID`

**Components**
- `src/features/orders/components/OrderCard.tsx` — order code, date, status badge, item thumbnails, total, primary CTA link
- `src/features/orders/components/OrderStatusStepper.tsx` — horizontal lifecycle stepper
- `src/features/orders/components/OrderItemRow.tsx` — snapshot item (image, name, variant, qty, line total)
- `src/features/orders/components/PricingBreakdown.tsx` — subtotal, voucher, shipping, total

**Pages**
- `OrderListPage.tsx` — `<PageSEO noindex>`; status filter tabs (horizontal scroll); order card list; infinite scroll (Intersection Observer); skeleton × 4; empty states per tab
- `OrderDetailPage.tsx` — `<PageSEO noindex>`; status stepper; items; pricing; address; payment; shipment mini-card (stub); invoice link; action buttons (Cancel / Pay Now / Write Review by status)

**Feature index**
- `src/features/orders/index.ts`

### Expected output
User can view all orders filtered by status, see order detail, cancel eligible orders. All status-driven CTAs correct. Payment expiry banner shown when applicable.

### Dependencies
Phase 6 complete.

---

## Phase 8 — Payment

### Goal
Online payment initiation, redirect to gateway, and payment result polling.

### Modules / Files

**Types**
- `src/features/payment/types/payment.types.ts`

**Services**
- `src/features/payment/services/paymentService.ts` — `initiate(orderId)`, `getByOrderId(orderId)`

**Hooks**
- `src/features/payment/hooks/useInitiatePayment.ts` — `useMutation`; handles `PAYMENT_ALREADY_PROCESSED` (409); on success `window.open(gatewayUrl, '_blank')` or navigate to payment gateway URL
- `src/features/payment/hooks/usePaymentResult.ts` — `useQuery` with polling (`refetchInterval: POLLING_INTERVAL`); stops when status ≠ `INITIATED`; max `POLLING_MAX_ATTEMPTS`

**Page**
- `PaymentResultPage.tsx` — `<PageSEO noindex>`; three branches: PAID (CSS success animation), FAILED (retry button), INITIATED/polling timeout (spinner + manual check)

**Order Detail integration**
- Wire "Pay Now" button → `useInitiatePayment`
- Payment expiry check: `payment.expiredAt < Date.now()` → amber banner, remove Pay Now

**Feature index**
- `src/features/payment/index.ts`

### Expected output
User can initiate payment, be redirected to gateway, return to result page that polls for status. All payment error codes handled. Expiry detected client-side.

### Dependencies
Phase 7 complete.

---

## Phase 9 — Shipment Tracking

### Goal
Shipment tracking page with progress bar and event timeline.

### Modules / Files

**Types**
- `src/features/shipment/types/shipment.types.ts`

**Services**
- `src/features/shipment/services/shipmentService.ts` — `getByOrderId(orderId)`

**Hooks**
- `src/features/shipment/hooks/useShipment.ts` — `useQuery`; handles `SHIPMENT_NOT_FOUND` (404)

**Components**
- `src/features/shipment/components/ShipmentProgressBar.tsx` — 4-step: PENDING → IN_TRANSIT → OUT_FOR_DELIVERY → DELIVERED
- `src/features/shipment/components/ShipmentTimeline.tsx` — vertical timeline, most recent at top, latest highlighted
- `src/features/shipment/components/ShipmentAlertBanner.tsx` — FAILED (amber), RETURNED (red), overdue (amber)

**Page**
- `ShipmentTrackingPage.tsx` — `<PageSEO noindex>`; shipment code + carrier (click-to-copy); tracking number (click-to-copy); status badge; progress bar; timeline; alerts; `SkeletonTimeline` on load

**Order Detail integration**
- Replace shipment mini-card stub with real `ShipmentMiniCard` → link to tracking page

**Feature index**
- `src/features/shipment/index.ts`

### Expected output
User can track shipment with event history. Click-to-copy works (web `navigator.clipboard.writeText`). All status banners work.

### Dependencies
Phase 7 complete.

---

## Phase 10 — Reviews

### Goal
Write review form, my reviews list, product review section on PDP.

### Modules / Files

**Types**
- `src/features/reviews/types/review.types.ts`

**Schemas**
- `src/features/reviews/schemas/reviewSchema.ts` — rating (1–5), title (optional, max 100), content (required, min 10, max 1000)

**Services**
- `src/features/reviews/services/reviewService.ts` — `create(body)`, `getMyReviews(params)`, `getProductReviews(productId, params)`

**Hooks**
- `src/features/reviews/hooks/useSubmitReview.ts` — `useMutation`; double-submit prevention; handles `REVIEW_NOT_ELIGIBLE` (403), duplicate (409)
- `src/features/reviews/hooks/useMyReviews.ts` — `useInfiniteQuery`
- `src/features/reviews/hooks/useProductReviews.ts` — `useInfiniteQuery`; used by `ReviewSection` in PDP

**Components**
- `src/features/reviews/components/StarRatingInput.tsx` — interactive 5-star selector; keyboard accessible
- `src/features/reviews/components/StarRatingDisplay.tsx` — display-only (supports fractional)
- `src/features/reviews/components/ReviewCard.tsx` — customer name, rating, title, content (3-line truncate + expand), date, status badge, rejection note
- `src/features/reviews/components/RatingDistributionBar.tsx` — horizontal bar chart 5★…1★

**Pages**
- `WriteReviewPage.tsx` — `<PageSEO noindex>`; product info (read-only); star input; title; content (character counter); submit button; all states
- `MyReviewsPage.tsx` — `<PageSEO noindex>`; review list; infinite scroll; empty state

**PDP integration**
- Replace `ReviewSection` stub with real component (summary + distribution bars + review list + load more)

**Order Detail integration**
- Wire "Đánh giá" button (COMPLETED orders) → `ROUTES.WRITE_REVIEW(orderId)`

**Feature index**
- `src/features/reviews/index.ts`

### Expected output
User can submit review for completed orders, view own reviews, read approved reviews on product pages.

### Dependencies
Phase 7 complete.

---

## Phase 11 — Notifications

### Goal
Notification list, unread badge, mark read (optimistic), navigation to related entities.

### Modules / Files

**Types**
- `src/features/notifications/types/notification.types.ts`

**Services**
- `src/features/notifications/services/notificationService.ts` — `getList(params)`, `getUnreadCount()`, `markRead(id)`, `markAllRead()`

**Hooks**
- `src/features/notifications/hooks/useNotifications.ts` — `useInfiniteQuery`
- `src/features/notifications/hooks/useUnreadCount.ts` — `useQuery`; feeds header badge
- `src/features/notifications/hooks/useMarkRead.ts` — `useMutation` with optimistic update
- `src/features/notifications/hooks/useMarkAllRead.ts` — `useMutation` with optimistic update

**Components**
- `src/features/notifications/components/NotificationItem.tsx` — type icon, title, message (expandable), relative time, unread styling
- `src/features/notifications/components/NotificationTypeBadge.tsx` — icon by type

**Page**
- `NotificationPage.tsx` — `<PageSEO noindex>`; header with count; filter tabs (All / Unread); "Mark all as read" button; notification list; infinite scroll; empty states; skeleton × 5

**Header integration**
- Wire bell icon badge → `useUnreadCount`
- Fetch `unreadCount` on authenticated app load

**Navigation on tap**
- Mark as read (optimistic) + navigate by `relatedEntityType` → `ROUTES.*`

**Feature index**
- `src/features/notifications/index.ts`

### Expected output
User sees unread badge in header. Can mark individual and all notifications as read (optimistic). Tapping navigates to related entity. Rollback on error.

### Dependencies
Phase 2 (routing) + Phase 7 (order target) + Phase 9 (shipment target).

---

## Phase 12 — Profile & Addresses

### Goal
Profile edit and full address book management.

### Modules / Files

**Types**
- `src/features/profile/types/profile.types.ts` — `UserProfile`, `UpdateProfileRequest`, `Gender`
- `src/features/profile/types/address.types.ts` — `Address`, `AddressType`, `CreateAddressRequest`

**Schemas**
- `src/features/profile/schemas/profileSchema.ts`
- `src/features/profile/schemas/addressSchema.ts`

**Services**
- `src/features/profile/services/profileService.ts` — `getMe()`, `updateMe(body)`
- `src/features/profile/services/addressService.ts` — `getAddresses()`, `createAddress(body)`, `updateAddress(id, body)`, `deleteAddress(id)`, `setDefault(id)`

**Hooks**
- `src/features/profile/hooks/useProfile.ts`
- `src/features/profile/hooks/useUpdateProfile.ts` — handles phone conflict (409) as field error; dirty guard via `useBlocker`
- `src/features/profile/hooks/useAddresses.ts`
- `src/features/profile/hooks/useCreateAddress.ts`
- `src/features/profile/hooks/useUpdateAddress.ts` — dirty guard
- `src/features/profile/hooks/useDeleteAddress.ts` — guarded by `useConfirmDialog`

**Pages**
- `ProfilePage.tsx` — `<PageSEO noindex>`; profile form with dirty guard; skeleton form on load
- `AddressBookPage.tsx` — `<PageSEO noindex>`; address cards; set default; delete (confirm dialog); add button
- `AddressFormPage.tsx` — `<PageSEO noindex>`; create or edit; dirty guard; `addressId` from URL optional

**Checkout integration**
- Replace address list stub in `CheckoutAddressPage` with `useAddresses` hook
- "Add new address" → `ROUTES.ADDRESS_NEW` with `?returnTo=checkout` param

**Feature index**
- `src/features/profile/index.ts`

### Expected output
User can view/edit profile, manage all addresses. Phone conflict handled inline. Address form reused in profile and checkout.

### Dependencies
Phase 2 (routing). Checkout integration requires Phase 6.

---

## Phase 13 — SEO & Polish

### Goal
Production readiness: SEO structured data, Core Web Vitals audit, accessibility pass, animation polish, error coverage.

### Tasks

**SEO completeness**
- Verify `<PageSEO>` on every public page (no missing title/description/canonical).
- Add `WebSite` + `Organization` JSON-LD to `HomePage`.
- Add `ItemList` JSON-LD to `ProductListPage` (first page only).
- Add `Product` + `BreadcrumbList` JSON-LD to `ProductDetailPage`.
- Verify `noindex` on all transactional pages (cart, checkout, orders, profile, payment).
- Verify URL slugs are SEO-friendly.
- Add `rel="prev"` / `rel="next"` for paginated product listing.

**Core Web Vitals**
- Audit LCP: hero image must have `loading="eager"` + `fetchpriority="high"`. Target < 2.5s.
- Audit CLS: all images have `width` + `height`. Skeleton dimensions match real content. Target < 0.1.
- Audit INP: no blocking animations near CTAs. Target < 200ms.
- Run Lighthouse in production build — target score 90+ on Performance, Accessibility, SEO.

**Accessibility pass**
- Audit every interactive element for keyboard operability.
- Audit every icon-only button for `aria-label`.
- Verify one `<h1>` per page.
- Verify heading hierarchy on all pages.
- Verify focus trap in all modals and drawers.
- Check color contrast ratios (WCAG AA minimum).
- Verify `aria-live="polite"` on toast container and dynamic content.
- Verify `role="alert"` on error messages.
- Verify `prefers-reduced-motion` respected in all animations.

**Error code coverage**
- Verify every error code in `ui-spec.md §6` has a corresponding user-facing handler.
- Test `ORDER_STATUS_INVALID` concurrency flow (toast + refetch).
- Test `PAYMENT_ALREADY_PROCESSED`.
- Test payment window expiry detection.
- Test stale cart item detection and checkout block.
- Test session expiry mid-checkout (401 → redirect → return).

**Click-to-copy**
- Verify `navigator.clipboard.writeText` + toast "Đã sao chép" on: order codes, shipment codes, invoice codes, SKUs.
- Fallback: `document.execCommand('copy')` for older browsers.

**Monospace code display**
- Verify all business codes (order, shipment, invoice, SKU) use `font-mono`.

**Double-submit guards**
- Audit all mutation buttons: place order, initiate payment, submit review, save profile, save address.

**Animation polish**
- Verify all scroll-triggered sections animate correctly.
- Verify hero stagger works on cold load.
- Verify Framer Motion `AnimatePresence` for route transitions.
- Verify no animation on checkout-critical form fields.
- Verify all animations check `useReducedMotion()`.

**Invoice page**
- `src/features/invoice/services/invoiceService.ts` — `getByOrderId(orderId)`
- `src/features/invoice/hooks/useInvoice.ts`
- `src/features/invoice/pages/InvoicePage.tsx` — invoice header, status badge, VOIDED watermark, customer snapshot, line items, pricing; print button (`window.print()`)
- Wire from `OrderDetailPage` invoice link

**Expected output**
App is fully functional across all features. Lighthouse 90+ across all categories. All edge cases handled. Accessibility compliant. Production-ready.

### Dependencies
All previous phases complete.

---

## Implementation Notes for Claude

When implementing any phase:

1. Start with `types/` → `services/` → `hooks/` → `components/` → `pages/` → `index.ts`. In that order.
2. After creating each hook, verify query key matches `queryKeys.ts`.
3. After creating each page, verify: `<PageSEO>` rendered, one `<h1>`, correct heading hierarchy, all three async states handled (skeleton, error, success).
4. After each mutation hook, verify: success invalidates correct query keys, errors handled (inline for field errors, toast for general), double-submit guard in place.
5. TypeScript must compile with zero errors before moving to next component.
6. Do not add a library not in the tech stack.
7. Use `ROUTES.*` constants — never hardcode path strings in component.
8. Use `Container` wrapper on every new page — never hardcode max-width inline.
9. All `<img>` must have `alt`, `width`, `height`.
10. Filter state lives in URL search params — not Zustand.
11. Check `useReducedMotion()` in every component that uses Framer Motion.
12. Use `navigator.clipboard.writeText` for copy actions — not `execCommand`.
