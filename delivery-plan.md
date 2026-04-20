# Delivery Plan — Fashion Shop Customer Mobile App

> Iterative implementation plan for the Customer Mobile App.
> Each phase builds on the previous. Do not start a phase until its dependency is complete.
> Intended for implementation with Claude — each phase is a self-contained work unit.

---

## Phase Overview

| Phase | Focus | Key Deliverable |
|---|---|---|
| 0 | Foundation | Project scaffold, shared infrastructure, providers |
| 1 | Auth | Login, Register, token lifecycle |
| 2 | Navigation Shell | Bottom tabs, stack navigators, screen stubs |
| 3 | Product Discovery | Product list, filters, product detail, variant selector |
| 4 | Cart | Cart management, add/remove/update items |
| 5 | Checkout | 4-step checkout wizard, order placement |
| 6 | Orders | Order list, order detail, order cancellation |
| 7 | Payment | Online payment initiation, result polling |
| 8 | Shipment Tracking | Shipment detail, event timeline |
| 9 | Reviews | Write review, my reviews, product review section |
| 10 | Notifications | Notification list, unread badge, mark read |
| 11 | Profile & Addresses | Profile edit, address book, address form |
| 12 | Polish | Pull-to-refresh everywhere, deep links, accessibility pass |

---

## Phase 0 — Foundation

### Goal
Establish the project scaffold, all shared infrastructure, and global providers so that every subsequent phase can build on a stable base.

### Modules / Files

**Project config**
- `tsconfig.json` (strict mode)
- `app.json` / `app.config.ts` (Expo config)
- `.env.example`
- `eas.json`
- `babel.config.js` (NativeWind + path aliases)
- `tailwind.config.js`

**Constants**
- `src/constants/config.ts` — `API_BASE_URL`, `REQUEST_TIMEOUT`, `POLLING_INTERVAL`, `POLLING_MAX_ATTEMPTS`, `SEARCH_DEBOUNCE_MS`, `NUMERIC_DEBOUNCE_MS`
- `src/constants/routes.ts` — all screen name constants (stubs for now)
- `src/constants/queryKeys.ts` — full query key factory for all features

**Shared types**
- `src/shared/types/api.types.ts` — `ApiResponse<T>`, `PaginatedResponse<T>`, `ApiError`, `FieldError`
- `src/shared/types/auth.types.ts` — `AuthUser`, `Tokens`
- `src/shared/types/enums.ts` — `OrderStatus`, `PaymentStatus`, `ShipmentStatus`, `ReviewStatus`, `AddressType`, `PaymentMethod`

**Shared lib**
- `src/shared/lib/secureStorage.ts` — `getAccessToken`, `setAccessToken`, `getRefreshToken`, `setRefreshToken`, `clear`
- `src/shared/lib/queryClient.ts` — `QueryClient` with default options (retry 2 for queries, 0 for mutations)
- `src/shared/lib/axios.ts` — single Axios instance with request interceptor (attach Bearer token) and response interceptor (unwrap `data.data`, handle 401 refresh with request queue, map `fieldErrors`)

**Shared stores**
- `src/shared/stores/authStore.ts` — `accessToken`, `refreshToken`, `user`, `isAuthenticated`, `redirectAfterLogin`, `setTokens`, `setUser`, `setRedirectAfterLogin`, `clear`
- `src/shared/stores/uiStore.ts` — `cartBadgeCount`, `setBadgeCount`, `increment`, `decrement`, toast queue shape

**Shared utils**
- `src/shared/utils/formatMoney.ts`
- `src/shared/utils/formatDate.ts`
- `src/shared/utils/formatRelativeTime.ts`

**Shared hooks**
- `src/shared/hooks/useDebounce.ts`
- `src/shared/hooks/useRefreshOnFocus.ts`
- `src/shared/hooks/useToast.ts`
- `src/shared/hooks/useInfiniteList.ts`

**Shared UI primitives**
- `src/shared/components/ui/Button.tsx` — variants, loading state, disabled state
- `src/shared/components/ui/Input.tsx` — label, error, secureTextEntry, show/hide toggle
- `src/shared/components/ui/Badge.tsx` — all status variants
- `src/shared/components/ui/Avatar.tsx` — image with initials fallback
- `src/shared/components/ui/Divider.tsx`

**Feedback components**
- `src/shared/components/feedback/SkeletonCard.tsx`
- `src/shared/components/feedback/SkeletonDetail.tsx`
- `src/shared/components/feedback/SkeletonTimeline.tsx`
- `src/shared/components/feedback/EmptyState.tsx`
- `src/shared/components/feedback/ErrorCard.tsx`
- `src/shared/components/feedback/Toast.tsx`

**Layout components**
- `src/shared/components/layout/ScreenWrapper.tsx` — `SafeAreaView` + `KeyboardAvoidingView`
- `src/shared/components/layout/SectionHeader.tsx`

**Overlay components**
- `src/shared/components/overlays/ConfirmBottomSheet.tsx`
- `src/shared/components/overlays/LoadingOverlay.tsx`
- `src/shared/components/overlays/FilterBottomSheet.tsx`

**Providers**
- `src/app/providers/QueryProvider.tsx` — wraps `QueryClientProvider`
- `src/app/providers/AuthProvider.tsx` — bootstraps tokens from SecureStore, shows SplashScreen while loading

**App entry**
- `src/main.tsx` — composes `AuthProvider` + `QueryProvider` + `RootNavigator`

### Expected output
A runnable app skeleton that shows a splash screen while bootstrapping auth, then resolves to a placeholder screen. All shared infrastructure is in place. TypeScript compiles with zero errors.

### Dependencies
None. This is the starting point.

---

## Phase 1 — Authentication

### Goal
Implement login and register flows, including form validation, API integration, token storage, and error handling.

### Modules / Files

**Types**
- `src/features/auth/types/auth.types.ts` (if feature-specific types needed)

**Schemas**
- `src/features/auth/schemas/authSchema.ts` — `loginSchema` (email, password), `registerSchema` (email, password, confirmPassword, firstName, lastName, phoneNumber)

**Services**
- `src/features/auth/services/authService.ts` — `login(body)`, `register(body)`, `refreshToken(refreshToken)`

**Hooks**
- `src/features/auth/hooks/useLogin.ts` — `useMutation` wrapping `authService.login`; on success stores tokens via `authStore.setTokens` + `secureStorage`, sets user, navigates to Home (or redirect target)
- `src/features/auth/hooks/useRegister.ts` — `useMutation` wrapping `authService.register`; same post-success flow

**Components**
- `src/features/auth/components/LoginForm.tsx` — RHF + zodResolver; email input, password input (show/hide), Sign In button with loading state
- `src/features/auth/components/RegisterForm.tsx` — all register fields, confirm password client validation, submit with loading state

**Screens**
- `src/features/auth/screens/LoginScreen.tsx` — composes `LoginForm`; handles `INVALID_CREDENTIALS` and `ACCOUNT_DISABLED` inline errors
- `src/features/auth/screens/RegisterScreen.tsx` — composes `RegisterForm`; handles `ACCOUNT_ALREADY_EXISTS` and phone conflict field errors

**Navigation**
- `src/app/navigation/AuthNavigator.tsx` — stack with `LoginScreen` and `RegisterScreen`
- `src/app/navigation/RootNavigator.tsx` — reads `authStore.isAuthenticated`; shows `AuthNavigator` or `MainNavigator` stub
- `src/app/navigation/types.ts` — `AuthStackParamList`

**Feature index**
- `src/features/auth/index.ts`

### Expected output
User can log in, register, and have tokens persisted securely. App navigates to a stub Main screen after login. Re-opening the app while authenticated skips login. Logout (tested via store clear) returns to login.

### Dependencies
Phase 0 complete.

---

## Phase 2 — Navigation Shell

### Goal
Build the complete navigator tree with all tab navigators, stack navigators, and screen stubs. Deep link configuration is included.

### Modules / Files

**Navigation types**
- `src/app/navigation/types.ts` — typed param lists for all navigators: `RootParamList`, `AuthStackParamList`, `HomeStackParamList`, `CartStackParamList`, `CheckoutStackParamList`, `OrdersStackParamList`, `NotificationsStackParamList`, `ProfileStackParamList`

**Navigators**
- `src/app/navigation/MainNavigator.tsx` — `BottomTabNavigator` with 5 tabs (Home, Cart, Orders, Notifications, Profile)
- `src/app/navigation/HomeNavigator.tsx` — stack for Home tab
- `src/app/navigation/CartNavigator.tsx` — stack for Cart tab + nested CheckoutStack
- `src/app/navigation/OrdersNavigator.tsx` — stack for Orders tab
- `src/app/navigation/NotificationsNavigator.tsx` — stack for Notifications tab
- `src/app/navigation/ProfileNavigator.tsx` — stack for Profile tab
- `src/app/navigation/linking.ts` — deep link config for OrderDetail, PaymentResult, ShipmentTracking

**Screen stubs** (empty placeholder screens for all non-auth screens)
- `HomeTab`: `ProductListScreen`, `ProductDetailScreen`
- `CartTab`: `CartScreen`, `CheckoutAddressScreen`, `CheckoutPaymentScreen`, `CheckoutVoucherScreen`, `CheckoutReviewScreen`, `OrderConfirmationScreen`
- `OrdersTab`: `OrderListScreen`, `OrderDetailScreen`, `PaymentResultScreen`, `ShipmentTrackingScreen`
- `NotificationsTab`: `NotificationScreen`
- `ProfileTab`: `ProfileScreen`, `AddressBookScreen`, `AddressFormScreen`, `MyReviewsScreen`, `WriteReviewScreen`, `InvoiceScreen`

**Bottom tab bar**
- Cart badge icon driven by `uiStore.cartBadgeCount`
- Notification badge icon (stub, hardcoded 0 for now)

### Expected output
All navigators are wired up. After login, user lands on the Home tab with a stub screen. All tabs are navigable. Deep link config is registered. TypeScript param list types are enforced across all `useNavigation` / `useRoute` calls.

### Dependencies
Phase 1 complete.

---

## Phase 3 — Product Discovery

### Goal
Implement the full product browsing experience: list with filtering, search, infinite scroll, and a detailed product view with variant selection and add-to-cart.

### Modules / Files

**Types**
- `src/features/products/types/product.types.ts` — `Product`, `ProductDetail`, `ProductVariant`, `ProductMedia`, `ProductListParams`

**Services**
- `src/features/products/services/productService.ts` — `getList(params)`, `getById(id)`, `getCategories()`, `getBrands()`

**Hooks**
- `src/features/products/hooks/useProducts.ts` — `useInfiniteQuery` with `queryKeys.products.list(params)`, `staleTime: 30_000`
- `src/features/products/hooks/useProductDetail.ts` — `useQuery` with `queryKeys.products.detail(id)`, `staleTime: 60_000`
- `src/features/products/hooks/useAddToCart.ts` — `useMutation` for `POST /cart/items`; on success: increment badge, show toast, invalidate cart

**Components**
- `src/features/products/components/ProductCard.tsx` — image (with placeholder + error fallback), brand, name, price display (salePrice + strikethrough), Sale/Featured badges
- `src/features/products/components/ProductGrid.tsx` — 2-column `FlatList` wrapping `ProductCard` with infinite scroll
- `src/features/products/components/VariantSelector.tsx` — two-step attribute selection (color → size); INACTIVE variants greyed; out-of-stock variants with indicator
- `src/features/products/components/ReviewSection.tsx` — rating summary bar + approved reviews list (lazy-loaded, paginated)

**Screens**
- `src/features/products/screens/ProductListScreen.tsx` — search bar (debounced 300 ms), filter bottom sheet (category, brand, price range, sort), active filter chips, product grid, results count, empty states, error state
- `src/features/products/screens/ProductDetailScreen.tsx` — image carousel, product info, variant selector, quantity stepper, sticky "Add to Cart" button, review section; all loading/error/empty states

**Feature index**
- `src/features/products/index.ts`

### Expected output
User can browse products, search and filter, scroll infinitely, view product detail, select a variant, and add to cart. Cart badge increments. All skeleton/error/empty states implemented.

### Dependencies
Phase 2 complete. Cart hooks (`useAddToCart`) require `cartService.addItem` stub or Phase 4.

---

## Phase 4 — Cart

### Goal
Implement full cart management: view, update quantity, remove items (optimistic), clear cart, stale item detection, and navigation to checkout.

### Modules / Files

**Types**
- `src/features/cart/types/cart.types.ts` — `Cart`, `CartItem`, `CartSummary`

**Services**
- `src/features/cart/services/cartService.ts` — `getCart()`, `addItem(body)`, `updateItem(itemId, body)`, `removeItem(itemId)`, `clearCart()`

**Hooks**
- `src/features/cart/hooks/useCart.ts` — `useQuery` with `queryKeys.cart.current()`; on success syncs `uiStore.setBadgeCount(cart.totalItems)`
- `src/features/cart/hooks/useAddToCart.ts` — if not already in Phase 3, implement here
- `src/features/cart/hooks/useUpdateCartItem.ts` — `useMutation` for `PATCH /cart/items/{id}`; handles `INVENTORY_NOT_ENOUGH`, `VARIANT_OUT_OF_STOCK`, `CART_ITEM_QUANTITY_INVALID` inline
- `src/features/cart/hooks/useRemoveCartItem.ts` — `useMutation` with optimistic update (remove row immediately, rollback on error)
- `src/features/cart/hooks/useClearCart.ts` — `useMutation` for `DELETE /cart`; guarded by `ConfirmBottomSheet`

**Components**
- `src/features/cart/components/CartItem.tsx` — image, product name, variant name, SKU, quantity stepper, line total, swipe-to-delete, remove button; inline error display for stock issues; stale/inactive item highlight
- `src/features/cart/components/CartSummaryPanel.tsx` — subtotal, item count, voucher entry (collapsed), "Proceed to Checkout" button
- `src/features/cart/components/StaleItemsBanner.tsx` — amber warning when INACTIVE items present

**Screens**
- `src/features/cart/screens/CartScreen.tsx` — stale items banner, cart items `FlatList`, summary panel, empty state, skeleton (3 cards), pull-to-refresh

**Feature index**
- `src/features/cart/index.ts`

### Expected output
User can view cart, change quantities (with inline stock errors), remove items (optimistic), clear cart (with confirmation), see stale item warnings, and proceed to checkout. Cart badge stays in sync.

### Dependencies
Phase 3 complete (add-to-cart flow tested end-to-end).

---

## Phase 5 — Checkout & Order Placement

### Goal
Implement the full 4-step checkout wizard ending in order confirmation. Handle all inventory and voucher race conditions.

### Modules / Files

**Types**
- `src/features/checkout/types/checkout.types.ts` — `CheckoutState`, `CreateOrderRequest`, `OrderResponse`
- `src/features/orders/types/order.types.ts` — `Order`, `OrderItem`, `OrderListParams`

**Schemas**
- `src/features/checkout/schemas/checkoutSchema.ts` — address selection validation, customer note max 500 chars

**Services**
- `src/features/orders/services/orderService.ts` — `create(body)`, plus other order methods stubbed
- `src/features/voucher/services/voucherService.ts` — `validate(code, body)` → `POST /vouchers/{code}/validate`

**Hooks**
- `src/features/checkout/hooks/useCheckoutState.ts` — Zustand slice or React state managing selected address, payment method, voucher across steps
- `src/features/checkout/hooks/useVoucherValidation.ts` — `useMutation` for voucher validate; handles all `VOUCHER_*` error codes inline
- `src/features/checkout/hooks/usePlaceOrder.ts` — `useMutation` for `POST /orders`; on success `navigation.replace('OrderConfirmation', { orderId })`; handles `INVENTORY_NOT_ENOUGH`, `STOCK_RESERVATION_FAILED`, `VOUCHER_*` errors; shows `LoadingOverlay` during in-flight; shows network timeout warning without auto-retry

**Screens**
- `src/features/checkout/screens/CheckoutAddressScreen.tsx` — saved address list (radio cards), "Add new address" → inline address form or push to `AddressFormScreen`; "Next" disabled until address selected
- `src/features/checkout/screens/CheckoutPaymentScreen.tsx` — COD vs Online radio group; no API call; "Next" always enabled
- `src/features/checkout/screens/CheckoutVoucherScreen.tsx` — code input, Apply button, voucher preview card, remove chip; "Skip" allowed
- `src/features/checkout/screens/CheckoutReviewScreen.tsx` — read-only summary, customer note input, "Place Order" button (single-use, disabled after tap); inventory and voucher error banners; network timeout toast
- `src/features/checkout/screens/OrderConfirmationScreen.tsx` — animated success checkmark, order code (copy), COD vs Online next-action branching, "Continue Shopping" link

**Stepper component**
- `src/features/checkout/components/CheckoutStepper.tsx` — horizontal 4-step progress indicator

**Feature index**
- `src/features/checkout/index.ts`

### Expected output
User can complete the full checkout flow. All inventory and voucher race conditions are handled correctly per spec. Order confirmation screen navigates properly. Back navigation is not possible after order confirmation.

### Dependencies
Phase 4 complete (cart data, badge count, address list from Phase 11 stubbed or using mock data).

---

## Phase 6 — Orders

### Goal
Implement order list with status filter tabs and full order detail including cancellation.

### Modules / Files

**Types**
- `src/features/orders/types/order.types.ts` — complete `Order`, `OrderItem`, `OrderListParams`, `OrderDetail`

**Services**
- `src/features/orders/services/orderService.ts` — `getMyOrders(params)`, `getById(id)`, `cancel(id)`

**Hooks**
- `src/features/orders/hooks/useOrders.ts` — `useInfiniteQuery` with status filter param; `staleTime: 30_000`
- `src/features/orders/hooks/useOrderDetail.ts` — `useQuery` + `useRefreshOnFocus`; `staleTime: 60_000`
- `src/features/orders/hooks/useCancelOrder.ts` — `useMutation`; guarded by `ConfirmBottomSheet`; handles `ORDER_CANNOT_CANCEL`, `ORDER_STATUS_INVALID` (toast + refetch)

**Components**
- `src/features/orders/components/OrderCard.tsx` — order code, date, status badge, item thumbnails, total, primary CTA per status
- `src/features/orders/components/OrderStatusStepper.tsx` — horizontal lifecycle stepper with completed/current/future states
- `src/features/orders/components/OrderItemRow.tsx` — snapshot item (image, name, variant, qty, line total)
- `src/features/orders/components/PricingBreakdown.tsx` — subtotal, voucher discount (hidden if 0), shipping, total

**Screens**
- `src/features/orders/screens/OrderListScreen.tsx` — horizontal scroll status filter tabs (All, To Pay, Processing, Shipped, Completed, Cancelled), `FlatList` of `OrderCard`, infinite scroll, empty states per tab, skeleton (4 cards)
- `src/features/orders/screens/OrderDetailScreen.tsx` — status stepper, items, pricing breakdown, delivery address snapshot, payment summary, shipment mini-card (if exists), invoice link, action buttons (Cancel / Pay Now / Write Review by status), all edge cases (payment expired banner, shipment not yet assigned)

**Feature index**
- `src/features/orders/index.ts`

### Expected output
User can view all orders filtered by status, see full order detail, cancel eligible orders. All status-driven CTAs behave correctly. Shipment mini-card and invoice link are stubbed (wired in Phase 8 and handled inline respectively).

### Dependencies
Phase 5 complete (order creation tested end-to-end).

---

## Phase 7 — Payment

### Goal
Implement online payment initiation, in-app browser / WebView redirect, and payment result screen with polling.

### Modules / Files

**Types**
- `src/features/payment/types/payment.types.ts` — `Payment`, `PaymentStatus`, `PaymentInitiateResponse`

**Services**
- `src/features/payment/services/paymentService.ts` — `initiate(orderId)`, `getByOrderId(orderId)`

**Hooks**
- `src/features/payment/hooks/useInitiatePayment.ts` — `useMutation` for `POST /payments/order/{id}/initiate`; handles `PAYMENT_ALREADY_PROCESSED` (409); on success opens gateway URL in in-app browser
- `src/features/payment/hooks/usePaymentResult.ts` — `useQuery` polling `GET /payments/order/{id}` every `POLLING_INTERVAL` ms, max `POLLING_MAX_ATTEMPTS` attempts; stops polling when status ≠ `INITIATED`

**Screens**
- `src/features/payment/screens/PaymentResultScreen.tsx` — three branches: PAID (success animation), FAILED (retry button), INITIATED/polling timeout (loading + "Check Order Status")

**Feature index**
- `src/features/payment/index.ts`

**Order Detail integration**
- Wire "Pay Now" button on `OrderDetailScreen` → `useInitiatePayment`
- Apply payment expiry check (`payment.expiredAt < now`) → amber banner, remove Pay Now button
- Apply `AWAITING_PAYMENT` expired state guard

### Expected output
User can initiate payment for online orders, be redirected to the gateway, and return to a result screen that polls for the final status. All payment error codes are handled correctly. Payment window expiry is detected client-side.

### Dependencies
Phase 6 complete.

---

## Phase 8 — Shipment Tracking

### Goal
Implement the shipment tracking screen with status progress bar and event timeline.

### Modules / Files

**Types**
- `src/features/shipment/types/shipment.types.ts` — `Shipment`, `ShipmentEvent`, `ShipmentStatus`

**Services**
- `src/features/shipment/services/shipmentService.ts` — `getByOrderId(orderId)`

**Hooks**
- `src/features/shipment/hooks/useShipment.ts` — `useQuery` + `useRefreshOnFocus`; handles `SHIPMENT_NOT_FOUND` (404)

**Components**
- `src/features/shipment/components/ShipmentProgressBar.tsx` — 4-step progress: PENDING → IN_TRANSIT → OUT_FOR_DELIVERY → DELIVERED; colour per status
- `src/features/shipment/components/ShipmentTimeline.tsx` — vertical timeline of `ShipmentEvent` items, most recent at top, latest event highlighted
- `src/features/shipment/components/ShipmentAlertBanner.tsx` — FAILED (amber), RETURNED (red), overdue (amber)

**Screens**
- `src/features/shipment/screens/ShipmentTrackingScreen.tsx` — shipment code + carrier (copy on long-press), tracking number (copy), status badge, progress bar, estimated delivery, event timeline, alert banners, skeleton (`SkeletonTimeline`), "Tracking not yet available" state

**Order Detail integration**
- Replace shipment mini-card stub with real `ShipmentMiniCard` component that links to `ShipmentTrackingScreen`

**Feature index**
- `src/features/shipment/index.ts`

### Expected output
User can track their shipment with event history. Copy-to-clipboard works on codes. All status banners and overdue detection work correctly.

### Dependencies
Phase 6 complete.

---

## Phase 9 — Reviews

### Goal
Implement write review form, my reviews list, and product review section on the product detail screen.

### Modules / Files

**Types**
- `src/features/reviews/types/review.types.ts` — `Review`, `ReviewStatus`, `CreateReviewRequest`, `ProductReviewSummary`

**Schemas**
- `src/features/reviews/schemas/reviewSchema.ts` — rating (1–5, required), title (optional, max 100), content (required, min 10, max 1000)

**Services**
- `src/features/reviews/services/reviewService.ts` — `create(body)`, `getMyReviews(params)`, `getProductReviews(productId, params)`

**Hooks**
- `src/features/reviews/hooks/useSubmitReview.ts` — `useMutation`; handles `REVIEW_NOT_ELIGIBLE` (403), duplicate (409); double-submit prevention
- `src/features/reviews/hooks/useMyReviews.ts` — `useInfiniteQuery`
- `src/features/reviews/hooks/useProductReviews.ts` — `useInfiniteQuery`; used by `ReviewSection` in product detail

**Components**
- `src/features/reviews/components/StarRatingInput.tsx` — interactive 5-star selector with drag preview
- `src/features/reviews/components/StarRatingDisplay.tsx` — display-only (supports fractional stars)
- `src/features/reviews/components/ReviewCard.tsx` — customer name, rating, title, content (3-line truncate + expand), date, status badge, rejection note
- `src/features/reviews/components/RatingDistributionBar.tsx` — horizontal bar chart for 5★…1★ breakdown

**Screens**
- `src/features/reviews/screens/WriteReviewScreen.tsx` — product info (read-only), star input, title, content (with character counter), submit button; all states per spec
- `src/features/reviews/screens/MyReviewsScreen.tsx` — `FlatList` of `ReviewCard`, infinite scroll, empty state

**Product detail integration**
- Replace `ReviewSection` stub in `ProductDetailScreen` with real component (rating summary + distribution + review list)

**Order detail integration**
- Wire "Write a Review" button (visible on COMPLETED orders) → `WriteReviewScreen` with `productId` + `orderId` params

**Feature index**
- `src/features/reviews/index.ts`

### Expected output
User can submit a review for completed orders, view their own reviews with status badges, and read approved reviews on product pages.

### Dependencies
Phase 6 complete (COMPLETED order status needed to access Write Review).

---

## Phase 10 — Notifications

### Goal
Implement notification list with unread badge, mark read (optimistic), and navigation to related entities.

### Modules / Files

**Types**
- `src/features/notifications/types/notification.types.ts` — `Notification`, `NotificationType`, `RelatedEntityType`, `NotificationListParams`

**Services**
- `src/features/notifications/services/notificationService.ts` — `getList(params)`, `getUnreadCount()`, `markRead(id)`, `markAllRead()`

**Hooks**
- `src/features/notifications/hooks/useNotifications.ts` — `useInfiniteQuery`; filter tab (all / unread) param
- `src/features/notifications/hooks/useUnreadCount.ts` — `useQuery` with `queryKeys.notifications.unreadCount()`; result feeds the Notifications tab badge
- `src/features/notifications/hooks/useMarkRead.ts` — `useMutation` with optimistic update; rollback on error
- `src/features/notifications/hooks/useMarkAllRead.ts` — `useMutation` with optimistic update; only shown when unread > 0

**Components**
- `src/features/notifications/components/NotificationItem.tsx` — type icon, title, message (expandable), relative timestamp, unread styling (left border + bold)
- `src/features/notifications/components/NotificationTypeBadge.tsx` — icon by `type` (ORDER / PAYMENT / SHIPMENT / REVIEW / PROMO / SYSTEM)

**Screens**
- `src/features/notifications/screens/NotificationScreen.tsx` — header with count, filter tabs (All / Unread), "Mark all as read" button, `FlatList` of `NotificationItem`, infinite scroll, empty states, skeleton (5 cards)

**Navigation integration**
- On tap, mark as read (optimistic) then navigate to `relatedEntityType` → screen mapping
- Wire Notifications tab badge to `useUnreadCount` hook
- Fetch `unreadCount` on app load (in `MainNavigator` or `AuthProvider` post-login)

**Feature index**
- `src/features/notifications/index.ts`

### Expected output
User sees unread notification badge on the tab. Can view, expand, mark individual and all notifications as read. Tapping navigates to the related entity. Optimistic updates work with correct rollback.

### Dependencies
Phase 2 (navigation) + Phase 6 (order navigation target) + Phase 8 (shipment navigation target).

---

## Phase 11 — Profile & Addresses

### Goal
Implement profile edit and full address book management (CRUD with default address).

### Modules / Files

**Types**
- `src/features/profile/types/profile.types.ts` — `UserProfile`, `UpdateProfileRequest`, `Gender`
- `src/features/profile/types/address.types.ts` — `Address`, `AddressType`, `CreateAddressRequest`, `UpdateAddressRequest`

**Schemas**
- `src/features/profile/schemas/profileSchema.ts` — firstName, lastName, phoneNumber, gender, birthDate
- `src/features/profile/schemas/addressSchema.ts` — street (required), ward (required), district (required), city (required), postalCode (optional), addressType, isDefault

**Services**
- `src/features/profile/services/profileService.ts` — `getMe()`, `updateMe(body)`
- `src/features/profile/services/addressService.ts` — `getAddresses()`, `createAddress(body)`, `updateAddress(id, body)`, `deleteAddress(id)`, `setDefault(id)` (via PATCH)

**Hooks**
- `src/features/profile/hooks/useProfile.ts` — `useQuery`
- `src/features/profile/hooks/useUpdateProfile.ts` — `useMutation`; handles phone conflict (409) as field error; dirty guard
- `src/features/profile/hooks/useAddresses.ts` — `useQuery`
- `src/features/profile/hooks/useCreateAddress.ts` — `useMutation`
- `src/features/profile/hooks/useUpdateAddress.ts` — `useMutation`; dirty guard
- `src/features/profile/hooks/useDeleteAddress.ts` — `useMutation`; guarded by `ConfirmBottomSheet`

**Screens**
- `src/features/profile/screens/ProfileScreen.tsx` — avatar placeholder, form fields, Save button (disabled until dirty), loading skeleton (`SkeletonForm`), all states per spec
- `src/features/profile/screens/AddressBookScreen.tsx` — address cards with Edit / Set as Default / Delete (swipe), Add Address button, empty state
- `src/features/profile/screens/AddressFormScreen.tsx` — create or edit address; all required fields; dirty guard; `addressId` param optional

**Feature index**
- `src/features/profile/index.ts`

**Checkout integration**
- Replace address list stub in `CheckoutAddressScreen` with `useAddresses` hook
- "Add new address" in checkout pushes `AddressFormScreen` with param indicating checkout context

### Expected output
User can view and edit profile, manage all addresses (create, edit, set default, delete). Phone number conflict handled inline. Address form is reused in both profile tab and checkout flow.

### Dependencies
Phase 2 (navigation shell). Checkout integration requires Phase 5.

---

## Phase 12 — Polish & Hardening

### Goal
Complete the app to production readiness: pull-to-refresh everywhere, deep links verified, accessibility pass, offline banner, and final error handling coverage.

### Tasks

**Pull-to-refresh**
- Verify `RefreshControl` on every `FlatList` screen (product list, cart, order list, order detail, notification list, address book, my reviews, shipment tracking).

**Deep links**
- End-to-end test all three deep link paths: `fashionshop://orders/:orderId`, `fashionshop://orders/:orderId/payment`, `fashionshop://orders/:orderId/tracking`.
- Verify that deep links to protected screens redirect to login if unauthenticated, then navigate after login.

**Offline banner**
- Wire `@react-native-community/netinfo` to show/hide persistent offline banner.

**Accessibility pass**
- Audit every `<Pressable>` for `accessibilityLabel`.
- Audit icon-only buttons for `accessibilityLabel`.
- Verify `accessibilityRole` is correct on all interactive and semantic elements.
- Check contrast ratios on all text (minimum 4.5:1).

**Error code coverage**
- Verify every error code in Section 6 of `ui-spec.md` has a corresponding user-facing handler.
- Test `ORDER_STATUS_INVALID` concurrency flow (toast + auto-refetch).
- Test `PAYMENT_ALREADY_PROCESSED` flow.
- Test payment window expiry detection.
- Test stale cart item detection and checkout block.

**Invoice screen**
- `src/features/invoice/services/invoiceService.ts` — `getByOrderId(orderId)`
- `src/features/invoice/hooks/useInvoice.ts`
- `src/features/invoice/screens/InvoiceScreen.tsx` — invoice header, status badge, VOIDED watermark, customer snapshot, line items, pricing
- Wire from `OrderDetailScreen` invoice link

**Copy-to-clipboard**
- Verify long-press copy on: order codes, shipment codes, invoice codes, SKUs. Toast "Copied" after each.

**Monospace code display**
- Verify all business codes (order, shipment, invoice) use `font-mono`.

**Double-submit guards**
- Audit all mutation buttons: place order, initiate payment, submit review, save profile, save address.

**Expected output**
The app is fully functional across all features with consistent UX, all edge cases handled, accessibility compliant, and offline-aware.

### Dependencies
All previous phases complete.

---

## Implementation Notes for Claude

When implementing any phase:

1. Start with `types/` → `services/` → `hooks/` → `components/` → `screens/` → `index.ts`. In that order.
2. After creating each hook, verify the query key matches `queryKeys.ts`.
3. After creating each screen, verify all three states are handled: loading (skeleton), error (`ErrorCard`), success (content).
4. After each mutation hook, verify: success invalidates the right query keys, errors are handled (inline for field errors, toast for general errors), and the double-submit guard is in place.
5. TypeScript must compile with zero errors before moving to the next component.
6. Do not add a library not in the tech stack.
7. Check `routes.ts` constants before using any screen name string.
8. Use `ScreenWrapper` on every new screen — never build SafeArea + KeyboardAvoid from scratch.
