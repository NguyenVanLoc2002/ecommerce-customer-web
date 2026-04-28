# Customer Web App UI/UX Specification — Fashion Shop

> **Source**: Adapted from mobile ui-spec.md for the Customer Web App.
> **Platform**: React Web (React + Vite + TypeScript + Tailwind CSS)
> **Revised**: 2026-04-26
> **Backend Base URL**: `/api/v1`
> **Auth**: `Authorization: Bearer <accessToken>` on all protected endpoints.
> **Role**: `CUSTOMER` only.

---

## Table of Contents

1. [Customer Access Model](#1-customer-access-model)
2. [Global UI Conventions (Web)](#2-global-ui-conventions-web)
3. [Customer Flows & Pages](#3-customer-flows--pages)
   - [3.1 Authentication](#31-authentication)
   - [3.2 Homepage](#32-homepage)
   - [3.3 Product Discovery](#33-product-discovery)
   - [3.4 Cart](#34-cart)
   - [3.5 Checkout & Order Creation](#35-checkout--order-creation)
   - [3.6 Order Management](#36-order-management)
   - [3.7 Payment](#37-payment)
   - [3.8 Shipment Tracking](#38-shipment-tracking)
   - [3.9 Invoice](#39-invoice)
   - [3.10 Reviews](#310-reviews)
   - [3.11 Vouchers](#311-vouchers)
   - [3.12 Notifications](#312-notifications)
   - [3.13 Profile & Addresses](#313-profile--addresses)
4. [State Machines — Customer View](#4-state-machines--customer-view)
5. [Edge Cases & Race Conditions](#5-edge-cases--race-conditions)
6. [Customer Error Codes Reference](#6-customer-error-codes-reference)

---

## 1. Customer Access Model

### 1.1 Customer Endpoints

| Pattern | Public | Customer (authenticated) |
|---|---|---|
| `POST /auth/**` | ✅ | — |
| `GET /products/**`, `/categories/**`, `/brands/**` | ✅ | — |
| `POST /payments/callback` | ✅ | — |
| `/me/**`, `/addresses/**` | — | ✅ |
| `/cart/**`, `/orders/**` | — | ✅ |
| `/payments/**` (initiate, query) | — | ✅ |
| `/shipments/order/**`, `/invoices/order/**` | — | ✅ |
| `/reviews/**`, `/notifications/**` | — | ✅ |
| `/vouchers/{code}/validate` | — | ✅ |
| `/admin/**` | — | ✗ (403) |

### 1.2 Auth Flow

```
Any Protected Route
       │
       ▼
  Is authenticated? ──No──▶ /login?redirect={encodeURIComponent(pathname)}
       │ Yes
       ▼
  Render page
       │
  On 401 mid-session:
       │
       ▼
  Interceptor: POST /auth/refresh-token
       │
  ┌────┴────────┐
  │             │
Success      Failure
  │             │
Retry        Clear authStore
request      Clear localStorage refreshToken hint
             navigate('/login?redirect=...')
             Toast: "Phiên đăng nhập đã hết hạn"
```

### 1.3 SEO & Route Indexing

| Route pattern | Indexed by search engines |
|---|---|
| `/`, `/products`, `/products/:slug` | ✅ YES |
| `/cart`, `/checkout/*`, `/payment/*` | ❌ NO (`noindex`) |
| `/orders/*`, `/profile/*`, `/notifications` | ❌ NO (`noindex`) |
| `/login`, `/register` | ❌ NO (`noindex`) |

---

## 2. Global UI Conventions (Web)

### 2.1 Response Wrapper

```json
// Success
{ "success": true, "code": "SUCCESS", "message": "...", "data": { ... }, "timestamp": "..." }

// Error
{ "success": false, "code": "ORDER_NOT_FOUND", "message": "...", "path": "...", "timestamp": "...", "fieldErrors": [] }
```

### 2.2 Pagination Parameters

| Param | Type | Default |
|---|---|---|
| `page` | int | 0 (zero-based) |
| `size` | int | 20 |
| `sort` | string | `createdAt,desc` |

Response includes `totalElements`, `totalPages`, `number`, `size`.

URL pagination: `?page=2` — update URL search params on page change.

---

### 2.3 Skeleton Variants

| Skeleton Type | Used For |
|---|---|
| `skeleton-card` | Product grid, order cards, notification items |
| `skeleton-detail` | Order detail, product detail, payment detail |
| `skeleton-form` | Checkout address, profile edit |
| `skeleton-timeline` | Shipment events |

**Rules**:
- Show skeleton on **initial load** and on **hard refresh** of a page.
- Show **spinner** (not skeleton) on subsequent user-triggered actions (button clicks, filter changes).
- Never show both skeleton and real content simultaneously.
- Skeleton dimensions must match final content dimensions exactly — no CLS.

---

### 2.4 Toast / Alert System

| Type | Trigger | Auto-dismiss | Position |
|---|---|---|---|
| **Success** (green) | Mutation completed | 4s | Top-right (desktop), Bottom-center (mobile) |
| **Error** (red) | API error on mutation | 8s or manual dismiss | Same |
| **Warning** (amber) | Soft warning | 6s | Same |
| **Info** (blue) | Neutral status | 4s | Same |

**Rules**:
- Maximum 3 toasts visible at once; queue subsequent.
- Errors from `fieldErrors` go **inline** in form, not toast.
- Network timeout errors include a **"Thử lại"** action button in toast.

---

### 2.5 Confirmation Dialogs

All destructive or irreversible actions require a `<ConfirmDialog>` before API call.

On **desktop**: centered modal dialog.
On **mobile** (< 640px): bottom `<Drawer>`.

| Action | Title | Confirm Label | Style |
|---|---|---|---|
| Cancel order | "Hủy đơn hàng này?" | "Xác nhận hủy" | Destructive |
| Clear cart | "Xóa toàn bộ giỏ hàng?" | "Xóa giỏ hàng" | Destructive |
| Delete address | "Xóa địa chỉ này?" | "Xóa" | Destructive |

**Rules**:
- Destructive button is visually distinct (red).
- Cancel button always present.
- `Escape` key closes without action.
- Focus is trapped inside dialog while open.

---

### 2.6 Form State Management

- Track dirty state on forms with significant input (address form, profile edit).
- On navigating away from a dirty form: show a `<ConfirmDialog>` "Rời trang mà không lưu?" via React Router `useBlocker`.
- On successful save: clear dirty flag.
- On validation error (422): keep form open with inline errors.

---

### 2.7 HTTP Layer Patterns

#### Token Refresh

Same as mobile spec. Implement request queue: if refresh already in-flight, queue subsequent 401ed requests and replay after refresh succeeds.

#### Network Retry

- Retry **GET** requests up to **2 times** with 1s delay on network failure.
- Do **not** auto-retry **POST/PATCH/DELETE**.
- After 2 failed GETs: show inline error card with "Thử lại" button.

#### Search Debounce

- Keyword search: **300ms** debounce before firing API.
- Price range inputs: **500ms** debounce.
- Show loading spinner inside search input while debounced request is in-flight.

---

### 2.8 Optimistic Updates

Same rules as mobile spec:

| Action | Optimistic behaviour | Rollback on error |
|---|---|---|
| Mark notification as read | Immediately dim unread dot; decrement badge | Re-add dot; increment badge; toast |
| Mark all notifications read | Clear all dots; set badge to 0 | Restore previous state; toast |
| Cart item remove | Immediately remove row (Framer Motion exit animation) | Re-insert item; toast |

Do **not** use optimistic updates for: order placement, payment initiation, stock operations.

---

### 2.9 Common UI States (every page)

| State | Trigger | UI Behaviour |
|---|---|---|
| **Initial load** | First render | Appropriate skeleton |
| **Action loading** | Button mutation | Button spinner + "Đang xử lý…"; disabled |
| **Empty** | `data = []` | Illustrated empty state with contextual CTA |
| **Error** | Non-2xx or network failure on GET | `<ErrorCard>` with message + retry |
| **Validation error** | 422 `fieldErrors` | Inline per-field message; red border on field |
| **Forbidden** | 403 | "Bạn không có quyền truy cập trang này." + back button |
| **Unauthorised** | 401 (after refresh fails) | Interceptor → navigate to `/login?redirect=...` |
| **Not found** | 404 on detail page | `<NotFoundState>` with "Quay lại" button |
| **Server error** | 500 | Toast: "Đã xảy ra lỗi. Vui lòng thử lại." |
| **Stale data** | `ORDER_STATUS_INVALID` | Toast: "Dữ liệu đã thay đổi. Đang làm mới…" + auto-reload |

---

### 2.10 Money Formatting

- Display with Vietnamese locale: `1.250.000₫` or `$1,250.00`.
- **Never compute** discounts, totals, or line totals client-side — display as returned by API.
- Show `salePrice` in sale color (`--text-sale`); show `price` with `line-through` when `salePrice` is set.
- Zero discount: hide the discount row entirely.

### 2.11 Business Code Display

Monospace font (`font-mono`). Click-to-copy with `navigator.clipboard.writeText` + toast "Đã sao chép".

| Entity | Example |
|---|---|
| Order | `ORD202604060001` |
| Shipment | `SHP...` |
| Invoice | `INV...` |

### 2.12 Web-Specific Interactions

**Click-to-copy** (replaces mobile long-press):
- Clickable/tappable icon button next to code.
- `navigator.clipboard.writeText(code)` → toast "Đã sao chép".
- Fallback: `document.execCommand('copy')` for older browsers.

**Hover states** (desktop only):
- Product card: image zoom + quick-add button reveal.
- Navigation links: underline animation.
- Buttons: lift effect.

**Responsive interaction model**:
- Desktop: hover states active, sidebars visible, filters in sidebar.
- Mobile/tablet: no hover, filters in bottom drawer, sticky bars.

---

## 3. Customer Flows & Pages

---

### 3.1 Authentication

#### Page: Login (`/login`)

**SEO**: `<PageSEO noindex>` | Title: "Đăng Nhập | Fashion Shop"

**Layout**: `<AuthLayout>` — centered card, logo, no navigation.

**Components**:
- Email input (`type="email"`, required)
- Password input (`type="password"`, required, show/hide toggle button)
- "Quên mật khẩu?" link (disabled, Phase 2)
- "Đăng Nhập" button (full-width, `type="submit"`)
- Link: "Chưa có tài khoản? Đăng ký"

**API**:
```
POST /api/v1/auth/login
Body: { email, password }
Response: { user: { id, email, firstName, lastName, roles }, tokens: { accessToken, refreshToken, expiresIn } }
```

**On success**:
1. Store `accessToken` in Zustand memory.
2. Store `refreshToken` in `localStorage` (key: `refresh_token`).
3. Check `roles` — if `STAFF/ADMIN/SUPER_ADMIN`, deny access (toast error, don't navigate).
4. Navigate to `?redirect` param or `/`.

**States**:

| State | UI |
|---|---|
| Submitting | Button spinner + "Đang đăng nhập…"; form disabled |
| `INVALID_CREDENTIALS` (401) | Inline error below password: "Email hoặc mật khẩu không đúng" |
| `ACCOUNT_DISABLED` (403) | Inline error: "Tài khoản của bạn đã bị vô hiệu hóa. Vui lòng liên hệ hỗ trợ." |
| Network failure | Toast error + "Thử lại" |

**Edge cases**:
- User visits while already authenticated → redirect to `/` immediately.
- `?redirect` param present → navigate to that URL after login.

---

#### Page: Register (`/register`)

**SEO**: `<PageSEO noindex>` | Title: "Đăng Ký | Fashion Shop"

**Components**:
- First name (optional), Last name (optional)
- Email (required), Phone number (optional)
- Password (required, show/hide)
- Confirm password (client-side match only)
- "Tạo Tài Khoản" button (full-width, `type="submit"`)
- Link: "Đã có tài khoản? Đăng nhập"

**API**:
```
POST /api/v1/auth/register
Body: { email, password, firstName, lastName, phoneNumber }
Response: same as login (tokens + user)
```

**States**:

| State | UI |
|---|---|
| Submitting | Button spinner + "Đang tạo tài khoản…" |
| Passwords don't match | Inline: "Mật khẩu không khớp" — before submit |
| `ACCOUNT_ALREADY_EXISTS` (409) | Field error on email: "Email này đã được đăng ký" |
| Phone conflict (409) | Field error on phone: "Số điện thoại này đã được sử dụng" |
| 422 `fieldErrors` | Inline per-field messages |
| Success | Auto-authenticated → navigate to `/` |

---

### 3.2 Homepage (`/`)

**SEO**: `<PageSEO>` | Title: "Fashion Shop — Thời Trang Hiện Đại" | JSON-LD: `WebSite` + `Organization`

**Layout**: Full `<ShopLayout>` (Header + Footer).

**Sections** (in order):

1. **HeroSection** — full-viewport (`min-height: 100vh`). Editorial layout: large display headline (`<h1>`), subtitle, two CTA buttons (primary + ghost), editorial image. Framer Motion stagger reveal on load. Hero image: `loading="eager"` + `fetchpriority="high"`.

2. **CategoryGrid** — `<h2>` "Khám Phá Danh Mục". 4-column grid (desktop), 2-column (mobile). Each tile: square image, category name overlay, hover zoom. Scroll-triggered reveal.

3. **FeaturedProducts** — `<h2>` "Nổi Bật Tuần Này". `ProductGrid` with 4 featured products. Stagger reveal.

4. **PromoBanner** — Full-width dark band. Campaign headline, tagline, CTA button, editorial image, countdown timer (client-side).

5. **NewArrivals** — `<h2>` "Hàng Mới Về". `ProductGrid` with 6 items. "Xem tất cả →" link.

6. **TrustSection** — 3-column: shipping, returns, quality. Fade-in on scroll.

7. **NewsletterSection** — Email capture form with `aria-label`.

**Rules**:
- `<h1>` in HeroSection only — exactly once.
- All section reveals use `useScrollReveal` + Framer Motion.
- No competing animations within the same viewport.

---

### 3.3 Product Discovery

#### Page: Product Listing (`/products`)

**SEO**: `<PageSEO>` | Title: "{Category} | Fashion Shop" | Description: category description | JSON-LD: `ItemList` (page 1 only) | `rel="prev"/"next"` for pagination | `noindex` on filtered URLs (canonical = base URL)

**Layout**: `<ShopLayout>` + two-column (filter sidebar + product grid on desktop, full-width on mobile).

**Components**:
- `<BreadcrumbNav>` — Home → Category (if filtered)
- `<h1>` — category name or "Tất Cả Sản Phẩm"
- Category description paragraph (SEO-rich, shown below h1)
- `<FilterPanel>` (sidebar desktop) / `<FilterDrawer>` (mobile):
  - Category multi-select (source: `GET /api/v1/categories`)
  - Brand multi-select (source: `GET /api/v1/brands`)
  - Price range inputs (debounced 500ms)
  - Sort: Mới nhất | Giá tăng dần | Giá giảm dần | Nổi bật
- `<ActiveFilterChips>` — scrollable row, each chip has × clear
- `<SortDropdown>` (top-right of grid)
- Results count: "Tìm thấy {n} sản phẩm"
- `<ProductGrid>` — 2 cols mobile → 3 tablet → 4 desktop
- Infinite scroll trigger (Intersection Observer at bottom)
- `<EmptyState>` if no results

**URL state** (all filter state in URL search params):
```
/products?category=1&brand=2&minPrice=100000&maxPrice=500000&sort=newest&page=0&q=áo+thun
```

**API**:
```
GET /api/v1/products?page=0&size=20&sort=createdAt,desc
    &categoryId={}&brandId={}&minPrice={}&maxPrice={}&keyword={}
GET /api/v1/categories
GET /api/v1/brands
```

**States**:

| State | UI |
|---|---|
| Initial load | `SkeletonCard` × 8 (matching grid) |
| Filter/search change | Spinner overlay on grid; preserve existing results |
| Results returned | Grid renders; count updates |
| Empty (active filters) | EmptyState + "Xóa bộ lọc" button |
| Empty (no filters) | EmptyState: "Chưa có sản phẩm" |
| API error | `<ErrorCard>` + "Thử lại" |
| Load more | Spinner at bottom |

**Business rules**:
- Only `PUBLISHED` products returned — no client filtering.
- Price range displayed uses lowest `salePrice` or `price` across active variants.
- Changing filters: update URL params → `useProducts` hook reacts → new query.

---

#### Page: Product Detail (`/products/:slug`)

**SEO**: `<PageSEO>` | Title: "{Product Name} — {Brand} | Fashion Shop" | Description: product summary | Canonical: `/products/{slug}` | JSON-LD: `Product` (name, description, image, offers, aggregateRating) + `BreadcrumbList`

**Layout**: `<ShopLayout>`. Two-column on desktop (media 55% | purchase block 45%). Stacked on mobile.

**Components**:
- `<BreadcrumbNav>` — Home → Category → Product Name
- `<ProductMediaGallery>` — main image + thumbnail strip (desktop); swipeable carousel (mobile); click to zoom/lightbox; image alt: `{productName} - {colorVariant}`
- **Purchase block** (sticky on desktop: `position: sticky; top: calc(var(--layout-header-height) + 16px)`):
  - `<h1>` — product name (only `h1` on this page)
  - `<PriceDisplay>` — sale price (gold/red) + strikethrough original, or base price
  - `<RatingSummary>` — star average + review count (links to review section)
  - `<VariantSelector>` — two-step (Color → Size); INACTIVE greyed; out-of-stock indicator
  - `<QuantitySelector>` — min 1, informational max
  - "Thêm Vào Giỏ" button (full-width, primary)
  - "Yêu thích" wishlist button (outline/ghost)
  - Delivery info snippet
- `<StickyCartBar>` — mobile only; appears when main CTA scrolls out of view; slide-up animation
- `<ProductDetails>` — `<h2>` "Chi Tiết Sản Phẩm"; description, materials, care
- `<ReviewSection>` — `<h2>` "Đánh Giá"; summary + distribution bars + paginated reviews
- `<RelatedProducts>` — `<h2>` "Có Thể Bạn Thích"

**API**:
```
GET /api/v1/products/{slug}   (or /products/{id} — use slug for SEO-friendly URL)
POST /api/v1/cart/items
Body: { variantId, quantity }
```

**States**:

| State | UI |
|---|---|
| Initial load | `SkeletonDetail` |
| `PRODUCT_NOT_FOUND` (404) | `<NotFoundState>` + "Quay lại sản phẩm" |
| All variants INACTIVE | Banner: "Sản phẩm này hiện không có sẵn" |
| No variant selected | "Thêm Vào Giỏ" disabled + note "Vui lòng chọn màu sắc và kích cỡ" |
| Variant out of stock | Button disabled + "Hết hàng" badge |
| Add to cart loading | Button spinner + "Đang thêm…"; disabled |
| `INVENTORY_NOT_ENOUGH` | Inline error: "Chỉ còn {n} sản phẩm trong kho" |
| `VARIANT_OUT_OF_STOCK` | Inline error: "Sản phẩm này đã hết hàng" |
| Success | Toast: "Đã thêm vào giỏ hàng" + cart badge increment |

---

### 3.4 Cart

**Page**: `/cart` — `<PageSEO noindex>` | Title: "Giỏ Hàng | Fashion Shop"

**Layout**: Two-column on desktop (items left 60% | summary right 40%); stacked on mobile.

**Components**:
- Stale items warning banner (amber, dismissible)
- Cart item list — each row:
  - Variant image (`<img>` with fallback)
  - Product name (`<a href={ROUTES.PRODUCT_DETAIL(slug)}>`), variant name, SKU (monospace)
  - Unit price
  - Quantity stepper (`−` / count / `+`)
  - Line total (from API)
  - Remove button (icon + label); on click → `<ConfirmDialog>` only if cart becomes empty
- `<CartSummaryPanel>` (sticky on desktop, stacked below on mobile):
  - Item count
  - Subtotal
  - Voucher entry (collapsed by default)
  - Voucher discount row (only if applied)
  - "Tiến Hành Thanh Toán" button (primary, full-width)
  - Disabled if cart empty or has blocking stale items
- "Tiếp Tục Mua Sắm" link
- "Xóa Giỏ Hàng" button (top-right or below items) → `<ConfirmDialog>`
- Empty state: illustration + "Giỏ hàng trống" + "Khám Phá Ngay" link

**API**:
```
GET    /api/v1/cart
POST   /api/v1/cart/items
PATCH  /api/v1/cart/items/{itemId}  Body: { quantity }
DELETE /api/v1/cart/items/{itemId}
DELETE /api/v1/cart
```

**States**:

| State | UI |
|---|---|
| Initial load | `SkeletonCard` × 3 |
| Empty | Empty state |
| Qty change — `INVENTORY_NOT_ENOUGH` | Inline error on item row: "Chỉ còn {n} sản phẩm"; revert stepper |
| Qty change — `VARIANT_OUT_OF_STOCK` | Inline error: "Hết hàng"; disable stepper; highlight Remove |
| `CART_ITEM_QUANTITY_INVALID` | Inline error: "Số lượng tối thiểu là 1" |
| Item removal — loading | Row fades to 40% opacity with Framer Motion; spinner in remove button |
| Cart cleared | Replace with empty state + Framer Motion exit animation |

**Edge cases**: Same as mobile spec — stale cart items detection, CHECKED_OUT cart treatment.

---

### 3.5 Checkout & Order Creation

**Layout**: All checkout pages use `<CheckoutLayout>` (logo only, no nav, no footer links — minimal distraction).

**Step indicator**: `<CheckoutStepper>` — horizontal 4-step bar: Giao Hàng | Thanh Toán | Mã Ưu Đãi | Xem Lại. Accessible `<ol>` with `aria-current="step"`.

---

#### Page: Step 1 — Delivery Address (`/checkout/address`)

**Components**:
- Saved address list: radio cards; default pre-selected; each shows receiver name, phone, full address, type badge
- "Thêm địa chỉ mới" button → navigate to `/profile/addresses/new?returnTo=checkout`
- `<OrderSummaryPanel>` (collapsible on mobile, sticky on desktop)
- "Tiếp Theo: Phương Thức Thanh Toán" button (disabled until address selected)

**States**: Same as mobile spec.

---

#### Page: Step 2 — Payment Method (`/checkout/payment`)

**Components**:
- Radio group: COD vs Online Payment
- `<OrderSummaryPanel>`
- "Tiếp Theo: Mã Ưu Đãi" button

---

#### Page: Step 3 — Voucher (`/checkout/voucher`)

**Components**:
- Code input + "Áp Dụng" button
- Applied voucher chip with × remove
- Voucher preview card
- `<OrderSummaryPanel>`
- "Bỏ Qua" / "Tiếp Theo: Xem Lại" button

**States + API**: Same as mobile spec.

---

#### Page: Step 4 — Review & Place Order (`/checkout/review`)

**Components**:
- Read-only summary (address, payment, items, pricing)
- "Chỉnh Sửa" links back to each step (tapping a completed step in stepper navigates back)
- Customer note `<textarea>` (optional, max 500 chars with counter)
- `<OrderSummaryPanel>` (sticky sidebar desktop)
- "Đặt Hàng" button — **single-use** (disabled after first click)
- Error banners (inventory, voucher race conditions)
- `<LoadingOverlay>` during order placement

**API + States + Race conditions**: Same as mobile spec.

---

#### Page: Order Confirmation (`/checkout/confirmation`)

**Components**:
- CSS success checkmark animation (not Lottie — lighter for web)
- Order code with click-to-copy
- Summary: item count, total, payment method
- **COD path**: "Xem Đơn Hàng" button → `ROUTES.ORDER_DETAIL(orderId)`
- **Online path**: "Thanh Toán Ngay" button (primary CTA) → payment initiation
- "Tiếp Tục Mua Sắm" link → `/`

**Business rules**: Same as mobile. `navigate(ROUTES.ORDER_CONFIRMATION, { replace: true })` — back navigation blocked.

---

### 3.6 Order Management

#### Page: My Orders (`/orders`)

**SEO**: `<PageSEO noindex>` | Title: "Đơn Hàng Của Tôi | Fashion Shop"

**Components**:
- `<h1>` "Đơn Hàng Của Tôi"
- Status filter tabs (horizontal scroll): Tất Cả | Chờ Thanh Toán | Đang Xử Lý | Đang Giao | Hoàn Thành | Đã Hủy
- Order cards — order code, date, status badge, item thumbnails (max 3 + "+N"), total, primary CTA
- Infinite scroll (Intersection Observer)
- Skeleton × 4; empty states per tab

**Status → CTA mapping**: Same as mobile spec.

---

#### Page: Order Detail (`/orders/:orderId`)

**SEO**: `<PageSEO noindex>` | Title: "Đơn Hàng {code} | Fashion Shop"

**Components**:
- `<OrderStatusStepper>` — horizontal lifecycle (Đặt Hàng → Xác Nhận → Xử Lý → Vận Chuyển → Giao Hàng → Hoàn Thành)
- Order code (click-to-copy) + date
- Items list (snapshots): image, name, variant, SKU (monospace), price, qty, line total
- Pricing breakdown: subtotal, voucher discount, shipping, **total** (bold)
- Delivery address snapshot
- Payment summary: method, status badge, amount, paid at
- Shipment mini-card: carrier, tracking (click-to-copy), ETA, status → "Theo Dõi Vận Chuyển" link
- Invoice link → `/orders/{orderId}/invoice`
- Action buttons by status: "Hủy Đơn" / "Thanh Toán" / "Đánh Giá"

**States + Edge cases**: Same as mobile spec.

---

### 3.7 Payment

#### Payment Initiation

On web: `window.open(gatewayUrl, '_blank')` OR `window.location.href = gatewayUrl` depending on gateway requirements.

**States + API**: Same as mobile spec.

---

#### Page: Payment Result (`/payment/result`)

**SEO**: `<PageSEO noindex>`

Three branches (PAID / FAILED / polling) — same content as mobile spec but using CSS animations instead of Lottie.

**Polling**: `useQuery` with `refetchInterval: POLLING_INTERVAL`; disable when `status !== 'INITIATED'`; track attempts with ref.

---

### 3.8 Shipment Tracking

#### Page: Shipment Tracking (`/orders/:orderId/tracking`)

**SEO**: `<PageSEO noindex>` | Title: "Theo Dõi Vận Chuyển | Fashion Shop"

**Components**:
- Shipment code (click-to-copy) + carrier name
- Tracking number (click-to-copy)
- Status badge
- Estimated delivery date (or actual `deliveredAt`)
- `<ShipmentProgressBar>` — 4-step: Chờ Lấy Hàng → Đang Vận Chuyển → Đang Giao → Đã Giao
- `<ShipmentTimeline>` — vertical; most recent at top; latest event highlighted with colored left border
- Alert banners (FAILED, RETURNED, overdue)
- "Quay Lại Đơn Hàng" link

**States + API**: Same as mobile spec.

---

### 3.9 Invoice

#### Page: Invoice (`/orders/:orderId/invoice`)

**SEO**: `<PageSEO noindex>` | Title: "Hóa Đơn {code} | Fashion Shop"

**Components**: Same as mobile spec + "In Hóa Đơn" button (`window.print()`).

**Print styles**: Add `@media print { ... }` to hide header, footer, buttons — only invoice content prints.

---

### 3.10 Reviews

#### Page: Write Review (`/orders/:orderId/review`)

**SEO**: `<PageSEO noindex>`

**Components**: Same as mobile spec. `<StarRatingInput>` uses keyboard arrows for accessibility.

---

#### Page: My Reviews (`/profile/reviews`)

**SEO**: `<PageSEO noindex>` | Title: "Đánh Giá Của Tôi | Fashion Shop"

**Components**: Same as mobile spec.

---

#### Section: Product Reviews (on PDP)

**Components**: Same as mobile spec. "Tải Thêm" button (no infinite auto-load on web — explicit button better for SEO).

---

### 3.11 Vouchers

Same as mobile spec — inline in checkout Step 3. No standalone page.

---

### 3.12 Notifications

#### Page: Notifications (`/notifications`)

**SEO**: `<PageSEO noindex>` | Title: "Thông Báo | Fashion Shop"

**Header badge**: Bell icon in `<Header>` with unread count. Fetched on authenticated load.

**Components**: Same as mobile spec. Notification item click → mark read (optimistic) + `navigate(ROUTES.*)`.

**Navigation on click by `relatedEntityType`**:
| `relatedEntityType` | Navigates to |
|---|---|
| `ORDER` | `ROUTES.ORDER_DETAIL(relatedEntityId)` |
| `PAYMENT` | `ROUTES.ORDER_DETAIL(relatedEntityId)` |
| `SHIPMENT` | `ROUTES.SHIPMENT_TRACKING(relatedEntityId)` |
| `REVIEW` | `ROUTES.REVIEWS` |

---

### 3.13 Profile & Addresses

#### Page: My Profile (`/profile`)

**SEO**: `<PageSEO noindex>` | Title: "Hồ Sơ Của Tôi | Fashion Shop"

**Layout**: Two-column (account sidebar + content) on desktop; single column on mobile.

Account sidebar links: Hồ Sơ, Địa Chỉ, Đánh Giá, Đơn Hàng, Đăng Xuất.

**Components + States + API**: Same as mobile spec. Dirty guard via React Router `useBlocker`.

---

#### Page: Address Book (`/profile/addresses`)

**SEO**: `<PageSEO noindex>`

**Components**: Address cards; "Set as Default" button (hidden on current default); delete → `<ConfirmDialog>`; "Thêm Địa Chỉ" button → `ROUTES.ADDRESS_NEW`.

---

#### Page: Address Form (`/profile/addresses/new` and `/profile/addresses/:id/edit`)

**SEO**: `<PageSEO noindex>`

`addressId` from URL param (undefined = create, number = edit). Same form both cases. Dirty guard. `?returnTo=checkout` param: after save, navigate back to checkout instead of address book.

---

## 4. State Machines — Customer View

Same as mobile spec. Sections 4.1 (Order Status), 4.2 (Payment Status), 4.3 (Shipment Status), 4.4 (Review Status) — all identical, no platform difference.

---

## 5. Edge Cases & Race Conditions

All 8 edge cases from mobile spec apply unchanged to web:

1. **Inventory Race** — §5.1: detected at `POST /orders` → error banner → "Quay Lại Giỏ Hàng" button
2. **Voucher Race** — §5.2: detected at `POST /orders` → inline error on voucher row → remove + retry
3. **Payment Window Expiry** — §5.3: client compares `payment.expiredAt` to `Date.now()` → amber banner, remove Pay button
4. **Stale Cart Items** — §5.4: detected on `GET /cart` → amber banner → remove items before checkout
5. **Session Expiry During Checkout** — §5.5: 401 → interceptor → `/login?redirect=/checkout/address` → on login, navigate back; cart preserved; form re-fills empty
6. **Duplicate Review** — §5.6: server 409 → toast → navigate to `/profile/reviews`
7. **Overdue Delivery** — §5.7: client compares `estimatedDeliveryDate` to `Date.now()` → amber banner; informational only
8. **Product Archived After Cart Add** — §5.8: detected at `POST /orders` → same as §5.1 inventory race

---

## 6. Customer Error Codes Reference

All error codes identical to mobile spec. User-facing messages in Vietnamese:

| Error Code | HTTP | Screen Context | User-facing Message |
|---|---|---|---|
| `INVALID_CREDENTIALS` | 401 | Login | "Email hoặc mật khẩu không đúng" |
| `TOKEN_EXPIRED` | 401 | Any | (Silent refresh → if fails) "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại." |
| `TOKEN_INVALID` | 401 | Any | "Phiên không hợp lệ. Vui lòng đăng nhập lại." |
| `ACCOUNT_DISABLED` | 403 | Login | "Tài khoản của bạn đã bị vô hiệu hóa. Vui lòng liên hệ hỗ trợ." |
| `ACCOUNT_ALREADY_EXISTS` | 409 | Register | "Email này đã được đăng ký" |
| `PRODUCT_NOT_FOUND` | 404 | Product Detail | "Không tìm thấy sản phẩm" |
| `PRODUCT_INACTIVE` | 422 | Cart add | "Sản phẩm này hiện không có sẵn" |
| `INVENTORY_NOT_ENOUGH` | 422 | Cart, Checkout | "Không đủ hàng trong kho. Chỉ còn {n} sản phẩm." |
| `VARIANT_OUT_OF_STOCK` | 422 | Cart, PDP | "Sản phẩm này đã hết hàng" |
| `STOCK_RESERVATION_FAILED` | 422 | Checkout | "Không thể đặt trước hàng. Vui lòng quay lại giỏ hàng." |
| `CART_ITEM_QUANTITY_INVALID` | 422 | Cart | "Số lượng tối thiểu là 1" |
| `ORDER_NOT_FOUND` | 404 | Order Detail | "Không tìm thấy đơn hàng" |
| `ORDER_STATUS_INVALID` | 422 | Order actions | "Thao tác này không thể thực hiện — trạng thái đơn hàng đã thay đổi. Vui lòng làm mới." |
| `ORDER_CANNOT_CANCEL` | 422 | Cancel | "Đơn hàng này không thể hủy" |
| `PAYMENT_NOT_FOUND` | 404 | Payment | "Không tìm thấy thông tin thanh toán" |
| `PAYMENT_FAILED` | 422 | Payment result | "Thanh toán thất bại. Vui lòng thử lại." |
| `PAYMENT_ALREADY_PROCESSED` | 409 | Payment initiate | "Thanh toán này đã được xử lý." |
| `VOUCHER_NOT_FOUND` | 404 | Checkout voucher | "Không tìm thấy mã giảm giá" |
| `VOUCHER_EXPIRED` | 422 | Checkout voucher | "Mã giảm giá này đã hết hạn" |
| `VOUCHER_USAGE_LIMIT_EXCEEDED` | 422 | Checkout voucher | "Mã giảm giá này đã đạt giới hạn sử dụng" |
| `SHIPMENT_NOT_FOUND` | 404 | Tracking | "Thông tin vận chuyển chưa sẵn sàng" |
| `INVOICE_NOT_FOUND` | 404 | Invoice | "Hóa đơn chưa sẵn sàng cho đơn hàng này" |
| `REVIEW_NOT_FOUND` | 404 | Review | "Không tìm thấy đánh giá" |
| `REVIEW_NOT_ELIGIBLE` | 403 | Write Review | "Bạn chỉ có thể đánh giá sản phẩm từ đơn hàng đã hoàn thành" |
| `CONFLICT` | 409 | Register, Profile | "Dữ liệu này đã tồn tại trong hệ thống" |
| `INTERNAL_SERVER_ERROR` | 500 | Any | "Đã xảy ra lỗi. Vui lòng thử lại sau." |

---

*End of Customer Web App UI/UX Specification — Fashion Shop*
*Adapted from mobile ui-spec.md for React Web platform — 2026-04-26*
