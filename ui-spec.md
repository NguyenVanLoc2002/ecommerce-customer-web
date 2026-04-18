# Customer Mobile App UI/UX Specification — Fashion Shop

> **Source**: Extracted from `ui-spec.md` (derived strictly from backend codebase).
> **Platform**: React Native mobile app
> **Revised**: 2026-04-18
> **Backend Base URL**: `/api/v1`
> **Auth**: `Authorization: Bearer <accessToken>` on all protected endpoints.
> **Role**: `CUSTOMER` only.

---

## Table of Contents

1. [Customer Access Model](#1-customer-access-model)
2. [Global UI Conventions (Mobile)](#2-global-ui-conventions-mobile)
3. [Customer Flows & Screens](#3-customer-flows--screens)
   - [3.1 Authentication](#31-authentication)
   - [3.2 Product Discovery](#32-product-discovery)
   - [3.3 Cart](#33-cart)
   - [3.4 Checkout & Order Creation](#34-checkout--order-creation)
   - [3.5 Order Management](#35-order-management)
   - [3.6 Payment](#36-payment)
   - [3.7 Shipment Tracking](#37-shipment-tracking)
   - [3.8 Invoice](#38-invoice)
   - [3.9 Reviews](#39-reviews)
   - [3.10 Vouchers](#310-vouchers)
   - [3.11 Notifications](#311-notifications)
   - [3.12 Profile & Addresses](#312-profile--addresses)
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
Any Protected Screen
       │
       ▼
  Is authenticated? ──No──▶ /login?redirect=<path>
       │ Yes
       ▼
  Render screen
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
Retry        Clear tokens
request      → Login screen (with redirect param)
```

---

## 2. Global UI Conventions (Mobile)

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

---

### 2.3 Skeleton Variants

| Skeleton Type | Used For |
|---|---|
| `skeleton-card` | Product grid, order cards, notification items |
| `skeleton-detail` | Order detail, product detail, payment detail |
| `skeleton-form` | Checkout address, profile edit |
| `skeleton-timeline` | Shipment events |

**Rules**:
- Show skeleton on **initial load** and on **hard refresh** of a screen.
- Show **spinner** (not skeleton) on subsequent user-triggered actions (button taps, filter changes).
- Never show both skeleton and real content simultaneously.
- Animate skeletons with a left-to-right shimmer.

---

### 2.4 Toast / Alert System

| Type | Trigger | Auto-dismiss | Position |
|---|---|---|---|
| **Success** (green) | Mutation completed (add to cart, save, submit) | 4 s | Bottom of screen |
| **Error** (red) | API error on mutation | No — requires manual dismiss | Bottom of screen |
| **Warning** (amber) | Soft warning (stale cart items, overdue delivery) | 6 s | Bottom of screen |
| **Info** (blue) | Neutral status update | 4 s | Bottom of screen |

**Rules**:
- Maximum 3 toasts visible at once; queue subsequent ones.
- Errors from `fieldErrors` array go **inline** (not toast).
- Network timeout errors always include a **Retry** action in the toast.

---

### 2.5 Confirmation Dialogs (Bottom Sheet)

All destructive or irreversible actions require a confirmation bottom sheet before calling the API.

| Action | Title | Confirm Label | Style |
|---|---|---|---|
| Cancel order | "Cancel this order?" | "Yes, cancel" | Destructive (red) |
| Clear cart | "Clear your cart?" | "Clear cart" | Destructive |
| Delete address | "Remove address?" | "Remove" | Destructive |

**Rules**:
- Destructive confirm button is always the bottom option (most reachable, but visually dangerous).
- Cancel is always above the confirm button.
- Swipe-down dismisses without action.

---

### 2.6 Form State Management

- Track dirty state on forms with significant input (address form, profile edit).
- On navigating away from a dirty form: show a confirmation bottom sheet "Leave without saving?".
- On successful save: clear dirty flag; do not prompt on next navigation.
- On validation error (422): keep form open with inline errors; do not navigate away.

---

### 2.7 HTTP Layer Patterns

#### Token Refresh Interceptor

```
Request →
  attach Authorization header →
    if 401 response:
      call POST /auth/refresh-token with refreshToken
        if refresh succeeds:
          store new tokens (secure storage)
          retry original request once
        if refresh fails (401 again):
          clear all tokens
          navigate to Login screen (with redirect param)
          show toast: "Session expired. Please sign in again."
```

- Implement request queue: if a token refresh is already in-flight, queue subsequent 401ed requests and replay them all after refresh.

#### Network Retry

- Retry **GET** requests up to **2 times** with 1 s delay on network failure.
- Do **not** auto-retry **POST/PATCH/DELETE** — mutations must be user-triggered to avoid double-submit.
- After 2 failed GETs: show inline error with a manual "Retry" button.

#### Search Debounce

- Debounce keyword search inputs: **300 ms** before firing the API request.
- Debounce numeric filter inputs (price range): **500 ms**.
- Show an activity indicator inside the search input while the debounced request is in-flight.

---

### 2.8 Optimistic Updates

Apply optimistic UI only where the failure rate is negligible and rollback is trivial:

| Action | Optimistic behaviour | Rollback on error |
|---|---|---|
| Mark notification as read | Immediately dim unread dot; decrement badge count | Re-add dot; increment badge; show toast |
| Mark all notifications read | Immediately clear all dots; set badge to 0 | Restore previous state; show toast |
| Cart item remove | Immediately remove row from list | Re-insert item at previous position; show toast |

Do **not** use optimistic updates for: order placement, payment initiation, stock operations.

---

### 2.9 Common UI States (every screen)

| State | Trigger | UI Behaviour |
|---|---|---|
| **Initial load** | First render | Appropriate skeleton variant (§2.3) |
| **Action loading** | Button-triggered mutation | Button shows activity indicator; label changes to "Saving…"; button disabled |
| **Empty** | `data = []` or `data = null` | Illustrated empty state with contextual CTA |
| **Error** | Non-2xx or network failure on GET | Inline error card with message + "Retry" button |
| **Validation error** | 422 `fieldErrors` | Inline per-field message below input; red border on field |
| **Forbidden** | 403 | "You don't have permission to view this." with back button |
| **Unauthorised** | 401 (after refresh fails) | Interceptor clears tokens → navigate to Login |
| **Not found** | 404 on detail screen | Illustrated 404 + "Go back" button |
| **Server error** | 500 | Toast: "Something went wrong. Please try again." |
| **Stale data** | `ORDER_STATUS_INVALID` concurrency error | Toast: "This record was updated. Refreshing…" + auto-reload |

---

### 2.10 Money Formatting

- All money is `DECIMAL(18,2)`. Display with locale currency symbol, two decimal places.
- **Never compute** discounts, totals, or line totals client-side — display values as returned by API.
- Show `salePrice` in accent colour; show `price` with strikethrough when `salePrice` is set.
- Zero discount: hide the discount row entirely (do not show "- $0.00").

### 2.11 Business Code Display

Monospace font, copy-to-clipboard on long-press.

| Entity | Example |
|---|---|
| Order | `ORD202604060001` |
| Shipment | `SHP...` |
| Invoice | `INV...` |

---

## 3. Customer Flows & Screens

---

### 3.1 Authentication

#### Screen: Login

**Purpose**: Authenticate and obtain JWT tokens.

**Components**:
- Email input (`keyboardType="email-address"`, required)
- Password input (secureTextEntry, required, show/hide toggle)
- "Forgot password?" link (Phase 2 — render but disable)
- "Sign In" button (full-width)
- Link: "Don't have an account? Register"

**API**:
```
POST /api/v1/auth/login
Body: { email, password }
Response: { user: { id, email, firstName, lastName, roles }, tokens: { accessToken, refreshToken, expiresIn } }
```

**On success**:
1. Store `accessToken` + `refreshToken` in secure storage (Keychain / Keystore).
2. Extract `roles` from response — if `STAFF`/`ADMIN`/`SUPER_ADMIN`, deny access (customer app only).
3. Navigate to Home (or `redirect` param target).

**States**:

| State | UI |
|---|---|
| Submitting | Button activity indicator + "Signing in…"; form disabled |
| `INVALID_CREDENTIALS` (401) | Inline error below password: "Email or password is incorrect" |
| `ACCOUNT_DISABLED` (403) | Inline error: "Your account has been disabled. Contact support." |
| Network failure | Toast error + Retry |

**Edge cases**:
- User opens app while already authenticated → skip to Home immediately.
- `redirect` param present after session expiry → after login, navigate to saved screen.
- Login while checkout is in-progress → navigate back to checkout with cart intact.

**Business rules**:
- No password-strength validation on login (only on register).
- Access token is short-lived; interceptor handles transparent refresh (§2.7).

---

#### Screen: Register

**Purpose**: Create a new customer account.

**Components**:
- First name (optional), Last name (optional)
- Email (required), Phone number (optional)
- Password (required, secureTextEntry, show/hide toggle)
- Confirm password (client-side match validation only)
- "Create Account" button (full-width)
- Link: "Already have an account? Sign in"

**API**:
```
POST /api/v1/auth/register
Body: { email, password, firstName, lastName, phoneNumber }
Response: same as login (tokens + user)
```

**States**:

| State | UI |
|---|---|
| Submitting | Button activity indicator + "Creating account…" |
| Passwords don't match (client) | Inline: "Passwords do not match" — before submit |
| `ACCOUNT_ALREADY_EXISTS` (409) | Field error on email: "An account with this email already exists" |
| Phone conflict (409) | Field error on phone: "This phone number is already registered" |
| 422 `fieldErrors` | Inline per-field messages |
| Success | Auto-authenticated (tokens stored) → navigate to Home |

**Business rules**:
- Successful registration returns tokens — no separate login step needed.

---

### 3.2 Product Discovery

#### Flow

```
[Screen: Product Listing]
  │
  ├── search / filter (debounced 300ms)
  │
  └── tap product card
         │
         ▼
  [Screen: Product Detail]
         │
         ├── select variant attributes (Color → Size)
         │       │
         │       ├── variant ACTIVE + in stock → enable "Add to Cart"
         │       └── variant INACTIVE or out of stock → disable "Add to Cart"
         │
         └── "Add to Cart" → POST /cart/items
                │
                ├── Success → cart icon badge +1, toast "Added to cart"
                └── Error → inline error (stock, inactive)
```

---

#### Screen: Product Listing

**Purpose**: Browse published products with filtering and pagination.

**Components**:
- Search bar — debounced 300 ms, triggers `?keyword=` param
- Filter bottom sheet:
  - Category multi-select (source: `GET /api/v1/categories`)
  - Brand multi-select (source: `GET /api/v1/brands`)
  - Price range slider (min/max inputs)
  - Sort select: Newest | Price: Low → High | Price: High → Low | Featured
- Active filter chips (scrollable row above grid, each with ×)
- Product grid (2 columns) — each card:
  - Primary image (fallback: placeholder illustration on error)
  - Product name
  - Brand name
  - Price display: sale price in accent + strikethrough original, or base price only
  - "Featured" badge if `featured = true`
  - "Sale" badge if any variant has `salePrice < price`
- Infinite scroll (load more on scroll-to-bottom)
- Results count: "X products found"

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
| Initial load | `skeleton-card` × 6 grid (2 columns) |
| Filter/search change | Activity indicator overlay; keep existing results visible |
| Results returned | Grid renders; "X products found" updates |
| Empty (with active filters) | Illustration + "No products match your filters" + "Clear filters" button |
| Empty (no filters) | "No products available yet" |
| API error | Inline error card + "Retry" button |
| Load more — loading | Activity indicator at bottom of list |
| Image load failure | Grey placeholder with product initial |

**Business rules**:
- Only `PUBLISHED` products returned — no client-side filtering needed.
- Price range displayed uses lowest `salePrice` or `price` across all active variants.

---

#### Screen: Product Detail

**Purpose**: View product info and add a variant to cart.

**Components**:
- Image gallery with swipeable carousel (fallback: placeholder on error)
- Product name, brand (tappable → brand filter), category chips
- Short description; "Show more" to expand full description
- **Variant selector** (two-step):
  - Step 1: Color swatches (or first attribute group)
  - Step 2: Size buttons (or second attribute group)
  - Combinations with `status = INACTIVE`: greyed out, `not-allowed` indicator, tooltip "Unavailable"
  - Out-of-stock combinations: shown with `○` indicator and "Out of stock" label
- Selected variant panel:
  - SKU (monospace, copy on long-press)
  - Price: `salePrice` (accent) + strikethrough `price`, or `price` alone
  - Stock indicator: In Stock (green) / Low Stock ≤ 5 (amber) / Out of Stock (red)
  - Quantity stepper: min 1, max guided by stock indicator; server is authoritative
- "Add to Cart" button (full-width, sticky at bottom)
  - Disabled states: no variant selected | `INACTIVE` | out of stock
  - Disabled tooltips shown as inline note below button
- Reviews section (lazy-loaded, paginated — see §3.9)

**API**:
```
GET /api/v1/products/{id}
Response: ProductDetailResponse {
  id, name, slug, brand, categories, shortDescription, description,
  status, featured, variants: ProductVariantResponse[], media: []
}

POST /api/v1/cart/items
Body: { variantId, quantity }
```

**States**:

| State | UI |
|---|---|
| Initial load | `skeleton-detail` |
| `PRODUCT_NOT_FOUND` (404) | Illustrated 404 + "Back to products" |
| All variants `INACTIVE` | Banner: "This product is currently unavailable" |
| No variant selected | "Add to Cart" disabled + note "Select a size and colour first" |
| Variant selected, out of stock | "Add to Cart" disabled + "Out of stock" badge |
| Add to cart — loading | Button activity indicator, disabled |
| Add to cart — `INVENTORY_NOT_ENOUGH` | Inline error: "Only {n} left in stock" |
| Add to cart — `VARIANT_OUT_OF_STOCK` | Inline error: "This item is out of stock" |
| Add to cart — success | Toast: "Added to cart" + badge increment |

**Edge cases**:
- Variant was in stock when screen loaded but sold out while user browsed: error surfaces on "Add to Cart" tap.
- Product visited directly via deep link while `ARCHIVED`: show 404 (backend returns `PRODUCT_NOT_FOUND` for non-published).

**Business rules**:
- Only `ACTIVE` variants are selectable.
- Stock indicator is informational only; server validates actual availability on cart add.
- `salePrice` is never shown higher than `price` (server enforces; display unconditionally trusts API values).

---

### 3.3 Cart

#### Flow

```
[Product Detail] ──Add to Cart──▶ optimistic badge +1
                                        │
                                 POST /cart/items
                                        │
                          ┌─────────────┴──────────────┐
                          │                             │
                       Success                       Error
                          │                             │
                   Refresh cart                 Show inline error
                          │
                   [Screen: Cart]
                          │
               ┌──────────┴──────────┐
               │                     │
          Edit qty               Remove item
               │                     │
        PATCH /cart/items        DELETE /cart/items/{id}
               │                     │
          (optimistic            (optimistic
           update,               remove,
           rollback on err)      rollback on err)
               │
          [Checkout] ──────▶ [Screen: Checkout Step 1]
```

---

#### Screen: Cart

**Purpose**: Review and edit items before checkout.

**Components**:
- Stale items warning banner (amber, dismissible) — see edge cases below
- Cart item list — each row:
  - Variant image (fallback: placeholder)
  - Product name (link to product detail) + variant name
  - SKU
  - Unit price (sale or base)
  - Quantity stepper (−/qty/+); disable `+` when quantity = available stock (informational)
  - Line total (from API)
  - "Remove" button (swipe-to-delete gesture + trash icon, optimistic)
- Order summary panel (below list, above CTA):
  - Item count
  - Subtotal (from API)
  - Voucher entry with "Apply" button (collapsed by default; expand on tap)
  - Voucher discount row (only if applied)
- "Proceed to Checkout" button (full-width, sticky at bottom)
  - Disabled if cart is empty or has stale items blocking checkout
- "Continue Shopping" link
- "Clear Cart" option (accessible via swipe or top-right menu) with confirmation bottom sheet
- Empty state: cart illustration + "Your cart is empty" + "Start Shopping" → product listing

**API**:
```
GET    /api/v1/cart
POST   /api/v1/cart/items           Body: { variantId, quantity }
PATCH  /api/v1/cart/items/{itemId}  Body: { quantity }
DELETE /api/v1/cart/items/{itemId}
DELETE /api/v1/cart
```

**States**:

| State | UI |
|---|---|
| Initial load | `skeleton-card` × 3 list |
| Empty | Empty state (see above) |
| Qty stepper — `INVENTORY_NOT_ENOUGH` | Inline error on item row: "Only {n} left in stock"; revert stepper |
| Qty stepper — `VARIANT_OUT_OF_STOCK` | Inline error: "Out of stock"; disable stepper; highlight "Remove" |
| `CART_ITEM_QUANTITY_INVALID` | Inline error: "Quantity must be at least 1" |
| Item removal — loading | Row fades to 40% opacity; activity indicator in remove button |
| Cart cleared | Replace with empty state |
| API error (GET) | Inline error card + "Retry" |

**Edge cases**:

**Stale cart items** — a variant may have become `INACTIVE` or out of stock since the item was added:
- On `GET /cart`, check each item's variant status in response.
- If any item is `INACTIVE`: amber warning banner "Some items in your cart are no longer available and must be removed before checkout." Highlight affected rows in amber with "Remove" button; disable "Proceed to Checkout".
- If item goes out of stock (detected on qty change): show per-row inline error; do not block checkout outright.

**Cart after successful checkout**:
- Cart status becomes `CHECKED_OUT` server-side.
- On next `GET /cart`, server creates a fresh empty cart automatically.
- UI treats `CHECKED_OUT` cart as an empty cart; show empty state.

**Business rules**:
- `lineTotal` comes from API — never computed client-side.
- The cart has exactly one `ACTIVE` instance per customer; `GET /cart` creates it if absent.
- Quantity stepper max is informational; authoritative check is server-side on order creation.

---

### 3.4 Checkout & Order Creation

#### Full Checkout Flow

```
[Screen: Cart] → [Proceed to Checkout]
                          │
                          ▼
              ┌───────────────────────┐
              │  Step 1: Delivery     │
              │  Address              │◀─── validation gate (address required)
              └───────────┬───────────┘
                          │ Next
                          ▼
              ┌───────────────────────┐
              │  Step 2: Payment      │
              │  Method               │◀─── validation gate (method required)
              └───────────┬───────────┘
                          │ Next
                          ▼
              ┌───────────────────────┐
              │  Step 3: Voucher      │
              │  (optional)           │ ← no gate; skip allowed
              └───────────┬───────────┘
                          │ Next
                          ▼
              ┌───────────────────────┐
              │  Step 4: Review &     │
              │  Place Order          │◀─── final summary; POST /orders
              └───────────┬───────────┘
                          │
               ┌──────────┴────────────┐
               │                       │
            Success                 Error
               │                       │
  [Screen: Order Confirmation]    Handle per error code
```

**Step indicator**: horizontal stepper at top — "Delivery | Payment | Voucher | Review". Completed steps show checkmark; current step highlighted; future steps greyed. Tapping a completed step navigates back (with dirty-state guard).

---

#### Screen: Checkout — Step 1: Delivery Address

**Components**:
- Saved address list (`GET /api/v1/addresses`):
  - Radio cards; default address pre-selected
  - Each card: receiver name, phone, full address, type badge
  - "Default" chip on default address
- "Add new address" → new screen (push navigation):
  - Street (required), Ward (required), District (required), City (required)
  - Postal code (optional)
  - Address type (HOME / OFFICE / OTHER)
  - "Set as default" toggle
  - "Save address" button → `POST /api/v1/addresses`
  - On success: pop back; new address auto-selected
- "Next: Payment Method" button (full-width, disabled until address selected)

**States**:

| State | UI |
|---|---|
| Loading addresses | `skeleton-card` × 2 |
| No saved addresses | Show "Add new address" prompt open by default |
| Address save — loading | "Saving address…" button activity indicator |
| Address save — success | Pop back to step; new card appears, auto-selected |

**Edge cases**:
- Session expired while filling address form → interceptor navigates to Login with redirect → after login, return to checkout (cart preserved; address form re-opens empty).

---

#### Screen: Checkout — Step 2: Payment Method

**Components**:
- Radio group:
  - **Cash on Delivery (COD)** — description: "Pay when your order arrives"
  - **Online Payment** — description: "Pay securely now via payment gateway"
- "Back" button (returns to Step 1, keeps selections)
- "Next: Voucher" button (full-width)

**States**: No API call on this step. Always ready.

---

#### Screen: Checkout — Step 3: Voucher (Optional)

**Components**:
- Voucher code input + "Apply" button
- Applied voucher chip: `[SUMMER20 — -$15.00 ×]`
- Voucher preview card: promotion name, discount amount, validity window, remaining uses
- "Skip" / "Next: Review" button (full-width)

**API**:
```
POST /api/v1/vouchers/{code}/validate
Body: { orderAmount, orderItems: [{ variantId, quantity }] }
Response: { code, promotionName, discountAmount, validityWindow, remainingUsages }
```

**States**:

| State | UI |
|---|---|
| Validate — loading | "Apply" button activity indicator |
| `VOUCHER_NOT_FOUND` | Field error: "Voucher code not found" |
| `VOUCHER_EXPIRED` | Field error: "This voucher has expired" |
| `VOUCHER_USAGE_LIMIT_EXCEEDED` | Field error: "This voucher has reached its usage limit" |
| Valid | Green chip with discount amount; success micro-animation |
| Voucher removed (×) | Clear chip; re-show input; discount removed from summary |

**Business rules**:
- `POST /vouchers/{code}/validate` is a **preview only** — no usage recorded.
- Order amount passed to validate must match the cart subtotal.
- If user edits cart quantity after applying voucher, re-run validate automatically with updated amount.

---

#### Screen: Checkout — Step 4: Review & Place Order

**Components**:
- Read-only order summary:
  - Delivery address (name, phone, full address)
  - Payment method
  - Item list (product name, variant, qty, line total)
  - Subtotal
  - Voucher discount (code shown; hidden if no voucher)
  - Shipping fee ("Calculated by carrier" until confirmed by server)
  - **Total** (from server response after order creation)
- "Edit" tappable sections (navigate back to that step)
- Customer note input (optional, max 500 chars)
- "Place Order" button (full-width, sticky at bottom) — single-use (disabled after first tap to prevent double-submit)

**API**:
```
POST /api/v1/orders
Body: { shippingAddressId, paymentMethod, customerNote, voucherCode }
Response: OrderResponse
```

**States**:

| State | Trigger | UI |
|---|---|---|
| Place order — loading | POST /orders in-flight | Full-screen overlay activity indicator; "Placing your order…"; button disabled |
| `INVENTORY_NOT_ENOUGH` | Stock sold between cart load and order create | Dismiss overlay; inline error banner: "Some items are no longer available. Please review your cart." + "Return to Cart" button |
| `STOCK_RESERVATION_FAILED` | Same as above | Same UI |
| `VOUCHER_EXPIRED` | Voucher expired between validate and order create | Inline error on voucher row: "Your voucher has expired. Remove it and try again." |
| `VOUCHER_USAGE_LIMIT_EXCEEDED` | Voucher limit hit between validate and order | Inline error: "This voucher is no longer available. Remove it and try again." |
| `VOUCHER_NOT_FOUND` | Voucher deleted between validate and order | Inline error: "Voucher no longer valid. Remove it and try again." |
| Network timeout | Request exceeds timeout | Toast: "Connection lost. Your order may not have been placed. Check My Orders before retrying." |
| Success | 200 OrderResponse | Navigate to Order Confirmation screen |

**Business rules**:
- "Place Order" button becomes disabled immediately on first tap (prevent double-submit).
- `shippingFee`, `totalAmount` come from the server response — do not show a total on the review step that could differ from the confirmed total.
- On timeout/network error: **do not auto-retry** the order POST. Show warning and direct user to check My Orders.

---

#### Screen: Order Confirmation

**Purpose**: Confirm order placed; guide next action.

**Components**:
- Animated success checkmark (Lottie or React Native Animated)
- Order code (`ORD...`) with copy-on-long-press
- Summary: items count, total amount, payment method
- **COD path**: "Pay on delivery when your order arrives." → "View Order" button
- **Online path**: "Complete your payment to confirm the order." → "Pay Now" button (primary CTA)
- "Continue Shopping" link

**Business rules**:
- COD order starts `PENDING`; no immediate action required from customer.
- ONLINE order starts `PENDING`; must initiate payment to progress.

---

### 3.5 Order Management

#### Order Lifecycle — Customer Perspective

```
Who       Action                                   Order Status
──────────────────────────────────────────────────────────────────
Customer  Places order                             PENDING
                                                      │
Customer  [ONLINE] Initiates payment                  ├──▶ AWAITING_PAYMENT
                                                      │
Customer  [Can cancel here] ──────────────────────────┼──▶ CANCELLED
                                                      │
Admin     Confirms order                              ├──▶ CONFIRMED
                                                      │
Admin     Marks processing                            ├──▶ PROCESSING
                                                      │
System    Admin creates shipment (auto)               ├──▶ SHIPPED
                                                      │
Customer  Can track shipment                          │
                                                      │
System    Admin sets shipment DELIVERED (auto)        ├──▶ DELIVERED
                                                      │
Admin     Marks complete                              ├──▶ COMPLETED
                                                      │
Customer  Can write reviews now                       │
```

---

#### Screen: My Orders

**Purpose**: List all customer orders.

**Components**:
- Status filter tabs (horizontal scroll): All | To Pay | Processing | Shipped | Completed | Cancelled
  - "To Pay" = `status ∈ {PENDING (ONLINE), AWAITING_PAYMENT}`
  - Badge counts on each tab (approximate, from list response)
- Order cards — each shows:
  - Order code + date
  - Status badge (colour per §4.1)
  - Item thumbnails (first 3; "+N more" chip)
  - Total amount
  - Primary CTA (per table below)
- Infinite scroll
- Empty state per tab

**API**:
```
GET /api/v1/orders?page=0&size=10&sort=createdAt,desc&status={}
```

**Status → Badge Colour → Primary CTA**:

| Status | Colour | CTA | Condition |
|---|---|---|---|
| `PENDING` | Amber | "Pay Now" | `paymentMethod = ONLINE` |
| `PENDING` | Amber | "Cancel" | `paymentMethod = COD` |
| `AWAITING_PAYMENT` | Orange | "Pay Now" | always |
| `CONFIRMED` | Blue | "View" | — |
| `PROCESSING` | Blue | "View" | — |
| `SHIPPED` | Teal | "Track" | — |
| `DELIVERED` | Green | "View" | — |
| `COMPLETED` | Green | "Review" | — |
| `CANCELLED` | Red | "View" | — |
| `REFUNDED` | Grey | "View" | — |

**States**:

| State | UI |
|---|---|
| Initial load | `skeleton-card` × 4 |
| Empty (all tab) | "You haven't placed any orders yet" + "Start Shopping" |
| Empty (filtered tab) | "No {status} orders" |
| Load more | Activity indicator at bottom of list |

---

#### Screen: Order Detail

**Purpose**: Full order information + actions.

**Components**:
- **Status stepper** (horizontal, shows all lifecycle stages):
  ```
  Placed ✓ → Confirmed ✓ → Processing ✓ → Shipped → Delivered → Completed
  ```
  - Completed stages: filled green circle + checkmark
  - Current stage: pulsing blue circle
  - Future stages: empty grey circle
  - Cancelled/Refunded: stepper replaced by red banner
- Order code + placed date
- Items list: product name, variant name, SKU, unit price, qty, line total (all snapshot data)
- Pricing breakdown:
  - Subtotal
  - Voucher discount (show `voucherCode` in label; hide row if `discountAmount = 0`)
  - Shipping fee
  - **Total** (bold)
- Delivery address snapshot (name, phone, street, ward, district, city)
- Payment summary: method, status badge, amount, paid at
- Shipment mini-card: carrier, tracking number (copy on long-press), estimated delivery, current status → "Track shipment" button
- Invoice link → Invoice screen
- **Action buttons** (visibility by status):
  - "Cancel Order" — only if `status ∈ {PENDING, AWAITING_PAYMENT}`; guarded by confirmation bottom sheet
  - "Pay Now" — only if `paymentMethod = ONLINE` and `paymentStatus ∈ {PENDING, INITIATED}`
  - "Write a Review" — only if `status = COMPLETED`

**API**:
```
GET  /api/v1/orders/{id}
POST /api/v1/orders/my/{id}/cancel
GET  /api/v1/shipments/order/{id}
GET  /api/v1/invoices/order/{id}
```

**States**:

| State | UI |
|---|---|
| Loading | `skeleton-detail` |
| `ORDER_NOT_FOUND` | 404 screen with "My Orders" button |
| Cancel — loading | Button activity indicator + "Cancelling…" |
| `ORDER_CANNOT_CANCEL` | Toast: "This order can no longer be cancelled" |
| Cancel success | Status stepper replaced with CANCELLED banner; action buttons removed |
| `AWAITING_PAYMENT` + payment expired | Amber banner: "Payment window has expired. Please contact support." |

**Edge cases**:
- Order is `AWAITING_PAYMENT` but `payment.expiredAt` has passed: show expired payment banner; remove "Pay Now" button.
- Shipment not yet created: shipment mini-card shows "Shipment not yet assigned" with no link.

**Business rules**:
- All item data from immutable `OrderItem` snapshots — values never change post-creation.
- Cancellation releases inventory server-side automatically.
- `discountAmount = 0`: hide discount row entirely.

---

### 3.6 Payment

#### Online Payment Flow

```
Order Confirmation / Order Detail
         │
    [Pay Now]
         │
         ▼
POST /payments/order/{id}/initiate
         │
    Order → AWAITING_PAYMENT
    Payment → INITIATED
         │
         ▼
Open payment gateway (in-app browser / WebView or deep link)
         │
    ┌────┴─────────────┐
    │                  │
  User pays       User cancels /
    │              closes
    │                  │
    ▼                  ▼
Gateway callback    Return / deep link
POST /payments/     with status param
  callback
(server-side,
 idempotent)
    │
    ▼
[Screen: Payment Result]
         │
  GET /payments/order/{id}
  Poll until status ≠ INITIATED
  (max 30 s, 3 s interval)
```

---

#### Screen: Payment Initiation

**Purpose**: Confirm and start the online payment process.

**Components**:
- Order code + total amount
- Payment method: "Online Payment"
- "Proceed to Payment" button (full-width)

**API**:
```
POST /api/v1/payments/order/{orderId}/initiate
Body: {}
Response: PaymentResponse { id, paymentCode, method, status, amount, ... }
```

**States**:

| State | UI |
|---|---|
| Loading | Button activity indicator + "Redirecting to payment…" |
| `PAYMENT_ALREADY_PROCESSED` (409) | Toast: "This payment has already been processed." + "View Order" button |
| Success | Open gateway URL in in-app browser |
| Gateway URL missing | Error: "Could not connect to payment provider. Try again later." |

---

#### Screen: Payment Result

**Purpose**: Show outcome after returning from gateway.

**PAID**:
- Green checkmark animation (Lottie)
- "Payment Successful"
- Amount paid + timestamp
- "View Order" button (full-width)

**FAILED**:
- Red warning icon animation
- "Payment Failed"
- Gateway error message (if provided)
- "Try Again" button → re-initiate
- Note: "Your order is saved. You can retry payment from My Orders."

**PENDING / INITIATED** (gateway returned but callback not yet received):
- Activity indicator + "Confirming your payment…"
- Auto-poll `GET /payments/order/{id}` every 3 s, max 10 attempts (30 s)
- After timeout: "Payment confirmation is taking longer than expected." + "Check Order Status" button

**API**:
```
GET /api/v1/payments/order/{orderId}
Response: PaymentResponse { status, paidAt, amount }
```

**States**:

| Payment Status | UI |
|---|---|
| `PAID` | Success screen |
| `FAILED` | Failure screen with retry |
| `INITIATED` (polling) | Loading + "Confirming…" |
| Polling timeout | "Still processing" screen with manual refresh |

**Edge cases**:
- App backgrounded during gateway redirect → customer returns later via My Orders → "Pay Now" still available if `AWAITING_PAYMENT` and not expired.
- Payment fails but `payment.expiredAt` has not passed → retry allowed.
- Payment fails and `payment.expiredAt` has passed → show "Payment window closed. Contact support."

**Business rules**:
- A failed payment does **not** cancel the order; `AWAITING_PAYMENT` persists.
- Gateway callback is server-to-server and idempotent on `providerTxnId`.
- `paidAt` populated only on `status = PAID`.

---

### 3.7 Shipment Tracking

#### Screen: Shipment Tracking

**Purpose**: Real-time delivery tracking.

**Components**:
- Shipment code (copy on long-press) + carrier
- Tracking number (copy on long-press)
- Status badge (colour per §4.3)
- Estimated delivery date; if `status = DELIVERED`, show actual delivery date (`deliveredAt`)
- Delivery status progress bar: `PENDING → IN_TRANSIT → OUT_FOR_DELIVERY → DELIVERED`
- Event timeline (most recent at top):
  - Each event: status label, location, description, timestamp
  - Latest event: highlighted with coloured left border
- "Back to Order" button
- Alert banners (status-dependent):
  - `FAILED`: amber — "Delivery attempt failed. Your package will be re-attempted or returned."
  - `RETURNED`: red — "Your package has been returned. Contact support for next steps."
  - Estimated delivery passed + not delivered: amber — "Delivery is taking longer than expected."

**API**:
```
GET /api/v1/shipments/order/{orderId}
Response: ShipmentResponse { id, shipmentCode, carrier, trackingNumber,
  status, estimatedDeliveryDate, deliveredAt, events: ShipmentEventResponse[] }
```

**States**:

| State | UI |
|---|---|
| Loading | `skeleton-timeline` |
| `SHIPMENT_NOT_FOUND` (404) | "Tracking information is not yet available. Check back after your order is shipped." |
| `events = []` | Timeline shows "Awaiting carrier scan" placeholder |
| `DELIVERED` | Replace progress bar with "Delivered" banner; show `deliveredAt` |
| `FAILED` | Amber alert (see above) |
| `RETURNED` | Red alert (see above) |
| Overdue | Amber "delayed" banner (client compares `estimatedDeliveryDate` to today) |

**Business rules**:
- Events are immutable — append-only by admin.
- "Track" CTA on My Orders only visible when `status = SHIPPED`.

---

### 3.8 Invoice

#### Screen: Invoice View

**Purpose**: View formal invoice — all snapshot data.

**Components**:
- Invoice header: code, issued date, due date
- Status badge: `ISSUED` (blue) / `PAID` (green) / `VOIDED` (red)
- `VOIDED` watermark overlay on all content
- Customer snapshot: name, email, phone (immutable)
- Billing address snapshot (immutable)
- Line items: product name, variant, SKU, qty, unit price, line total
- Pricing: subtotal, discount (voucher code), shipping fee, **total**
- "Download PDF" (Phase 2)

**API**:
```
GET /api/v1/invoices/order/{orderId}
```

**States**:

| State | UI |
|---|---|
| Loading | `skeleton-detail` |
| `INVOICE_NOT_FOUND` | "Invoice not yet available for this order." |
| `VOIDED` | Full-screen red "VOIDED" watermark; alert banner "This invoice has been voided" |
| `PAID` | Green "PAID" stamp |

**Business rules**:
- Invoice data is a snapshot taken at order creation — never changes.
- Invoice auto-generated at order creation; always present after a successful order.

---

### 3.9 Reviews

#### Review Eligibility Gate

```
Order status = COMPLETED?
       │ Yes
       ▼
Show "Write a Review" button per order item
       │
Customer taps → Review form pre-filled with productId + orderId
       │
POST /reviews
       │
Server re-validates: customer has COMPLETED order containing productId
       │
Success → PENDING (awaiting moderation)
```

---

#### Screen: Write Review

**Components**:
- Product image + name (pre-filled, read-only)
- Star rating selector (1–5, required; tap to select)
- Review title input (optional, max 100 chars)
- Review content textarea (required, min 10 chars, max 1000 chars; character counter)
- "Submit Review" button (full-width)

**API**:
```
POST /api/v1/reviews
Body: { productId, orderId, rating, title, content }
Response: ReviewResponse { id, status: "PENDING" }
```

**States**:

| State | UI |
|---|---|
| Loading | `skeleton-form` |
| Submit — loading | Button activity indicator + "Submitting…" |
| `REVIEW_NOT_ELIGIBLE` (403) | Error banner: "You can only review products from completed orders." |
| Duplicate review (409) | Toast: "You have already reviewed this product." → navigate to My Reviews |
| 422 `fieldErrors` | Inline per-field messages |
| Success | Toast: "Review submitted — pending approval." Navigate back to order detail |

**Business rules**:
- Review enters `PENDING` after submission — **not visible** on product page until admin approves.
- Duplicate prevention is server-enforced.

---

#### Screen: My Reviews

**Components**:
- Review list:
  - Product image + name (link)
  - Star rating display
  - Title + content (truncated to 3 lines, "Show more" expand)
  - Submission date
  - Status badge: `PENDING` (amber) / `APPROVED` (green) / `REJECTED` (red)
  - If `REJECTED`: moderation note in amber callout box
- Empty state: "You haven't written any reviews yet"

**API**:
```
GET /api/v1/reviews/my?page=0&size=10
```

---

#### Section: Product Reviews (on Product Detail)

**Components**:
- Summary bar: average rating (★ 4.2) + count ("128 reviews")
- Rating distribution: 5★ bar 60%, 4★ bar 20% … (horizontal bar chart)
- Review list (APPROVED only):
  - Customer name (first name + last initial, e.g., "Nguyen V.")
  - Rating + title + content
  - Date
- "Load more" button (pagination)
- Empty state: "No reviews yet — be the first to review!"

**API**:
```
GET /api/v1/reviews/product/{productId}?page=0&size=10
```

**Business rules**:
- Endpoint returns only `APPROVED` reviews — no client filtering needed.

---

### 3.10 Vouchers

Voucher entry is inline in the checkout flow (Step 3). No standalone voucher screen in Phase 1.

**Complete voucher error reference for checkout context**:

| Error Code | Message shown |
|---|---|
| `VOUCHER_NOT_FOUND` | "Voucher code not found" |
| `VOUCHER_EXPIRED` | "This voucher has expired" |
| `VOUCHER_USAGE_LIMIT_EXCEEDED` | "This voucher has reached its usage limit" |
| Race fail at order create | Banner per specific code (see §3.4 Step 4 states) |

**Race condition rule**: Voucher is validated at Step 3 (preview) and re-validated server-side at `POST /orders`. If it fails at order creation, surface the specific error, let the user remove the voucher, and retry.

---

### 3.11 Notifications

#### Screen: Notifications

**Components**:
- Global unread badge on bottom tab icon (fetched from `GET /notifications/unread-count` on app load)
- Screen header: "Notifications" + badge count
- Filter tabs: All | Unread
- "Mark all as read" button (shown only when unread count > 0)
- Notification list:
  - Icon by `type`: ORDER (box), PAYMENT (credit card), SHIPMENT (truck), REVIEW (star), PROMO (tag), SYSTEM (bell)
  - Title + message (truncated, expandable on tap)
  - Relative timestamp ("2h ago", "Yesterday", full date if > 7 days)
  - Unread: left blue border + bold text
  - Read: normal weight, no border
  - Tap → mark as read (optimistic) + navigate to `relatedEntityType` / `relatedEntityId`
- Infinite scroll
- Empty state: illustration + "No notifications yet"

**Deep-link targets by `relatedEntityType`**:

| `relatedEntityType` | Navigates to |
|---|---|
| `ORDER` | Order Detail |
| `PAYMENT` | Order Detail > Payment section |
| `SHIPMENT` | Shipment Tracking |
| `REVIEW` | My Reviews |

**API**:
```
GET   /api/v1/notifications?page=0&size=20
GET   /api/v1/notifications/unread-count
PATCH /api/v1/notifications/{id}/read      (optimistic)
PATCH /api/v1/notifications/read-all       (optimistic)
```

**States**:

| State | UI |
|---|---|
| Loading | `skeleton-card` × 5 |
| Empty (all) | Illustrated empty state |
| Empty (unread tab) | "You're all caught up!" with checkmark illustration |
| Mark read — error | Rollback unread state; toast error |

---

### 3.12 Profile & Addresses

#### Screen: My Profile

**Components**:
- Avatar placeholder (upload Phase 2)
- First name, last name (inputs)
- Email (read-only field with lock icon)
- Phone number (unique)
- Gender select: MALE | FEMALE | OTHER
- Birth date picker (no future dates)
- "Save Changes" button (full-width, disabled until form is dirty)

**API**:
```
GET   /api/v1/me
PATCH /api/v1/me
Body: { firstName, lastName, phoneNumber, gender, birthDate }
```

**States**:

| State | UI |
|---|---|
| Loading | `skeleton-form` |
| Unchanged form | "Save Changes" disabled |
| Saving | Button activity indicator + "Saving…" |
| Phone conflict (409) | Field error: "This phone number is already in use" |
| Success | Toast: "Profile updated" + clear dirty flag |

---

#### Screen: Address Book

**Components**:
- Address cards:
  - Full address (street, ward, district, city)
  - Address type badge (HOME / OFFICE / OTHER)
  - "Default" badge if `isDefault = true`
  - "Edit" button → edit screen (push)
  - "Set as Default" button (hidden on current default)
  - "Delete" button (swipe-to-delete or kebab) → confirmation bottom sheet
- "Add Address" button (full-width at bottom)
- Empty state: "No saved addresses" + "Add your first address"

**API**:
```
GET    /api/v1/addresses
POST   /api/v1/addresses
PATCH  /api/v1/addresses/{id}
DELETE /api/v1/addresses/{id}
```

**States**:

| State | UI |
|---|---|
| Loading | `skeleton-card` × 2 |
| Delete — loading | Card fades to 40% opacity; activity indicator |
| Delete success | Card removed; if deleted was default, none auto-promoted |

**Business rules**:
- Soft-deleted addresses hidden from UI.
- Address snapshot on order is independent of address record — safe to delete.
- Only one default at a time (server handles unset on new default set).

---

## 4. State Machines — Customer View

### 4.1 Order Status

**Customer-visible statuses and their meaning**:

| Status | Badge Colour | What it means to the customer |
|---|---|---|
| `PENDING` | Amber | Order placed; awaiting payment (ONLINE) or admin confirmation (COD) |
| `AWAITING_PAYMENT` | Orange | Online payment initiated but not confirmed |
| `CANCELLED` | Red | Order cancelled (terminal) |
| `CONFIRMED` | Blue | Admin confirmed; being prepared |
| `PROCESSING` | Blue | Being packed/dispatched |
| `SHIPPED` | Teal | Out for delivery — track available |
| `DELIVERED` | Green | Delivered to address |
| `COMPLETED` | Green | Order complete — reviews now enabled |
| `REFUNDED` | Grey | Refunded (Phase 2) |

**Customer-actionable transitions**:
- Customer can cancel: `PENDING` → `CANCELLED` or `AWAITING_PAYMENT` → `CANCELLED`
- Customer can initiate payment: `PENDING` (ONLINE) → `AWAITING_PAYMENT`
- Customer can write reviews: only when `status = COMPLETED`

---

### 4.2 Payment Status (customer-facing)

```
PENDING ──[customer initiates]──▶ INITIATED ──[gateway success]──▶ PAID
                                             └──[gateway fail]───▶ FAILED
```

A `FAILED` payment does **not** cancel the order — customer can retry if payment window is still open.

---

### 4.3 Shipment Status (customer-facing)

| Status | Progress bar | What it means |
|---|---|---|
| `PENDING` | Grey | Shipment created; not yet picked up |
| `IN_TRANSIT` | Blue | With carrier |
| `OUT_FOR_DELIVERY` | Amber | On its way to you today |
| `DELIVERED` | Green | Delivered |
| `FAILED` | Red | Delivery attempt failed |
| `RETURNED` | Red | Returned to sender |

---

### 4.4 Review Status (customer-facing)

| Status | Badge | What it means |
|---|---|---|
| `PENDING` | Amber | Under review by our team |
| `APPROVED` | Green | Published on the product page |
| `REJECTED` | Red | Not approved — see moderation note |

---

## 5. Edge Cases & Race Conditions

### 5.1 Inventory Race — Item Sells Out Between Cart and Checkout

**Scenario**: Customer adds item to cart (stock = 3), then another customer purchases the last 3 units before checkout.

**Detection point**: `POST /orders` → `INVENTORY_NOT_ENOUGH` or `STOCK_RESERVATION_FAILED`.

**UI response**:
1. Dismiss the "Placing order…" overlay.
2. Show error banner on checkout review step: "Some items in your cart are no longer available."
3. "Return to Cart" button → navigate to cart.
4. On cart screen, per-item stock check shows the item as out of stock.
5. Customer must remove the item before proceeding.

**Do not**: auto-remove items from cart; auto-retry the order; show generic error.

---

### 5.2 Voucher Race — Voucher Expires Between Validate and Order

**Scenario**: Customer validates voucher (succeeds), then before placing the order, the voucher expires or hits its usage limit.

**Detection point**: `POST /orders` → `VOUCHER_EXPIRED` / `VOUCHER_USAGE_LIMIT_EXCEEDED`.

**UI response**:
1. Stay on checkout review step.
2. Show inline error on voucher row: contextual message per error code.
3. "Remove voucher" button highlighted.
4. After removal: customer can proceed without the voucher.

**Do not**: silently ignore the voucher and place the order without the discount.

---

### 5.3 Payment Window Expiry

**Scenario**: Online payment has `payment.expiredAt` set. Customer returns to the order after the window has closed.

**Detection**: Client compares `payment.expiredAt` to current time when loading Order Detail.

**UI response** (Order Detail + Payment Result screens):
- Amber banner: "The payment window for this order has expired."
- If `status = AWAITING_PAYMENT`: "Please contact support to arrange payment or place a new order."
- Remove "Pay Now" button (initiating payment on an expired order will be rejected by the gateway).

**Do not**: attempt to re-initiate payment after expiry.

---

### 5.4 Stale Cart Items on Cart Load

**Scenario**: Customer added a variant to cart earlier; variant has since been set to `INACTIVE`.

**Detection**: Cart item response includes variant status, or variant returns `INACTIVE`/`NOT_FOUND`.

**UI response** (Cart Screen):
- Amber banner: "One or more items in your cart are no longer available."
- Affected rows highlighted in amber with "Remove" button.
- "Proceed to Checkout" disabled until stale items removed.

**Do not**: silently remove items from cart without customer action.

---

### 5.5 Session Expiry During Checkout

**Scenario**: Customer is filling out checkout form; session token expires mid-flow.

**Detection**: Any API call in checkout returns 401; interceptor attempts refresh; refresh also fails.

**UI response**:
1. Interceptor clears tokens.
2. Navigate to Login screen with `redirect=/checkout`.
3. Toast: "Session expired. Please sign in to continue your order."
4. After login: navigate back to checkout.
5. Cart is still intact (server-side, `ACTIVE` cart persists).
6. Address selections and form inputs are lost — customer re-fills.

**Mitigation**: Consider saving checkout step and form state to async storage before redirect so it can be restored on return.

---

### 5.6 Duplicate Review Submission

**Scenario**: Customer taps "Submit" twice; or navigates back and re-submits.

**Detection**: Server returns 409 on duplicate review for same product+order.

**UI response**:
- "Submit Review" button disabled after first tap (§3.4 business rule).
- Server 409 → toast: "You have already submitted a review for this product." → navigate to My Reviews.

---

### 5.7 Overdue Estimated Delivery

**Scenario**: `shipment.estimatedDeliveryDate` has passed but shipment status is not yet `DELIVERED`.

**Detection**: Client compares `estimatedDeliveryDate` to today.

**UI response** (Shipment Tracking screen):
- Amber banner: "Your delivery was expected by {date}. We're following up with the carrier."
- Informational only — no customer action required.

---

### 5.8 Product Archived After Cart Add

**Scenario**: Product is `ARCHIVED` after customer adds it to cart.

**Detection**: `POST /orders` fails at inventory reservation since variant is inactive.

**UI response**: Same as §5.1 (inventory race) — "Some items are no longer available."

---

## 6. Customer Error Codes Reference

| Error Code | HTTP | Screen Context | User-facing Message |
|---|---|---|---|
| `INVALID_CREDENTIALS` | 401 | Login | "Email or password is incorrect" |
| `TOKEN_EXPIRED` | 401 | Any | Silent refresh → if fails: "Session expired. Please sign in again." |
| `TOKEN_INVALID` | 401 | Any | "Session invalid. Please sign in again." |
| `ACCOUNT_DISABLED` | 403 | Login | "Your account has been disabled. Contact support." |
| `ACCOUNT_ALREADY_EXISTS` | 409 | Register | "An account with this email already exists" |
| `PRODUCT_NOT_FOUND` | 404 | Product Detail | "Product not found" |
| `PRODUCT_INACTIVE` | 422 | Cart add | "This product is currently unavailable" |
| `INVENTORY_NOT_ENOUGH` | 422 | Cart, Checkout | "Insufficient stock. Only {n} units available." |
| `VARIANT_OUT_OF_STOCK` | 422 | Cart, Product Detail | "This item is out of stock" |
| `STOCK_RESERVATION_FAILED` | 422 | Checkout | "Unable to reserve stock. Please return to your cart." |
| `CART_ITEM_QUANTITY_INVALID` | 422 | Cart | "Quantity must be at least 1" |
| `ORDER_NOT_FOUND` | 404 | Order Detail | "Order not found" |
| `ORDER_STATUS_INVALID` | 422 | Order actions | "This action cannot be performed — order status has changed. Refresh and try again." |
| `ORDER_CANNOT_CANCEL` | 422 | Order cancel | "This order can no longer be cancelled" |
| `PAYMENT_NOT_FOUND` | 404 | Payment screens | "Payment record not found" |
| `PAYMENT_FAILED` | 422 | Payment result | "Payment could not be processed. Please try again." |
| `PAYMENT_ALREADY_PROCESSED` | 409 | Payment initiate | "This payment has already been processed." |
| `VOUCHER_NOT_FOUND` | 404 | Checkout voucher | "Voucher code not found" |
| `VOUCHER_EXPIRED` | 422 | Checkout voucher | "This voucher has expired" |
| `VOUCHER_USAGE_LIMIT_EXCEEDED` | 422 | Checkout voucher | "This voucher has reached its usage limit" |
| `SHIPMENT_NOT_FOUND` | 404 | Tracking | "Shipment information not yet available" |
| `INVOICE_NOT_FOUND` | 404 | Invoice | "Invoice not yet available for this order" |
| `REVIEW_NOT_FOUND` | 404 | Review | "Review not found" |
| `REVIEW_NOT_ELIGIBLE` | 403 | Write Review | "You can only review products from completed orders" |
| `CONFLICT` | 409 | Register, Profile | "A record with this value already exists" |
| `INTERNAL_SERVER_ERROR` | 500 | Any | "Something went wrong. Please try again later." |

---

*End of Customer Mobile App UI/UX Specification — Fashion Shop*
*Generated 2026-04-18. Extracted from: T:/Project/ecommerce-backend/ui-spec.md*
