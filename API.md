# API.md

Single source of truth for customer frontend API integration.

Originally generated from:
- `docs/original/api-common.md`
- `docs/original/customer-api-contract.md`

Applies only to customer/public API usage. Do not use `/api/v1/admin/**` from the customer web app.

Customer contracts rechecked against Backend source and Backend/Admin documentation on 2026-11-22. See [Phase 2 contract readiness](docs/planning/phase-2-contract-readiness.md) for source revisions, coverage, documentation conflicts and remaining integration gaps. Archived documents are historical references, not newer behavior. Current executable source resolves conflicting upstream prose; a documentation correction does not authorize runtime changes.

## 1. Base URL and Auth Rules

- Base API path: `/api/v1`
- Customer/public APIs are under `/api/v1/**` outside `/api/v1/admin/**`
- Protected endpoints require:
  - `Authorization: Bearer <accessToken>`

```http
Authorization: Bearer <accessToken>
```

- Access token transport is Bearer JWT.
- Refresh token transport is `HttpOnly` cookie only. The customer frontend must never store or send `refreshToken` in JavaScript.
- Login/register return `ApiResponse<AuthResponse>` with `data.user` and `data.tokens` containing `accessToken`, `tokenType`, `expiresIn`. The tokens are not siblings of `user`.
- Refresh returns `ApiResponse<TokenResponse>` with token data directly under `data`:
  - `accessToken`
  - `tokenType`
  - `expiresIn`
- `POST /auth/register`, `POST /auth/login`, `POST /auth/refresh-token`, and `POST /auth/logout` must be called with `withCredentials: true`
- `POST /auth/password/forgot`, `POST /auth/password/forgot/verify`, and `POST /auth/password/reset` should also keep `withCredentials: true` so cookie-backed security stays compatible
- CSRF double-submit is implemented and gated by `app.security.csrf-double-submit-enabled`:
  - when enabled, the filter issues a readable `XSRF-TOKEN` cookie and checks matching `X-XSRF-TOKEN` on mutations to `/auth/refresh-token` and `/auth/logout`
  - missing/mismatched headers return `403 CSRF_TOKEN_INVALID`; environment enablement and initial cookie bootstrap need live verification
  - this does not make the refresh-token cookie JavaScript-readable; only the separate CSRF cookie is readable
- Public routes used by customer frontend:
  - `POST /auth/register`
  - `POST /auth/login`
  - `POST /auth/refresh-token`
  - `POST /auth/logout`
  - `POST /auth/password/forgot`
  - `POST /auth/password/forgot/verify`
  - `POST /auth/password/reset`
  - `GET /products/**`
  - `GET /categories/**`
  - `GET /brands/**`
- All other customer endpoints require authentication
- In particular, `GET /reviews/product/{productId}` is not in the current public whitelist, despite being called public in older docs/comments. Plan for authentication until an explicitly approved backend change makes it public.

## 2. Response Envelope

Successful responses use `ApiResponse<T>`.

```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "Request processed successfully",
  "data": {},
  "timestamp": "2026-04-29T12:00:00Z"
}
```

Notes:
- `success` is always `true`
- `code` is always `SUCCESS`
- `data` may be an object, list or paged payload. For void responses it is null internally and can be omitted from JSON by `@JsonInclude(NON_NULL)`; accept both absent and null.
- Most delete/mark-all endpoints return HTTP `200` with the success envelope, not an empty `204`. `ApiResponse.created()` changes the message only; controller annotations determine HTTP status.

## 3. Error Response Format

Structured errors use `ErrorResponse`.

```json
{
  "success": false,
  "code": "VALIDATION_ERROR",
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Email is required"
    }
  ],
  "timestamp": "2026-04-29T12:00:00Z",
  "path": "/api/v1/auth/register"
}
```

Notes:
- `success` is always `false`
- `errors` is optional and used for field-level validation
- bean validation failures return HTTP `422` with `code = VALIDATION_ERROR`

## 4. Pagination Format

Paged endpoints return `ApiResponse<PagedResponse<T>>`.

```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "Request processed successfully",
  "data": {
    "items": [],
    "page": 0,
    "size": 20,
    "totalItems": 100,
    "totalPages": 5,
    "hasNext": true,
    "hasPrevious": false
  },
  "timestamp": "2026-04-29T12:00:00Z"
}
```

Rules:
- pagination params: `page`, `size`, `sort`
- `page` is zero-based
- default size is usually `20`
- use `sort=field,direction`
- there is no top-level `total`

## 5. ID Convention

- All entity IDs exposed by the API are UUID strings
- Business codes such as `orderCode`, `paymentCode`, `invoiceCode`, and `shipmentCode` are plain strings
- Dates:
  - `LocalDate` -> `yyyy-MM-dd`
  - `Instant` / `LocalDateTime` -> ISO-8601 date-time strings
- Money fields are JSON numbers

## 6. Auth Endpoints

### `POST /auth/register`
- Access: public
- Request:
  - `email` required, valid email, max 255
  - `password` required, 8-64 chars, at least one lowercase, one uppercase, one digit
  - `firstName` required, max 100
  - `lastName` optional, max 100
  - `phoneNumber` optional, `@PhoneNumber`
- Status: `201 Created`
- Response: `ApiResponse<AuthResponse>`

### `POST /auth/login`
- Access: public
- Request:
  - `email` required
  - `password` required
- Response: `ApiResponse<AuthResponse>`

### `POST /auth/refresh-token`
- Access: public
- Request:
  - send no refresh token body from the customer frontend
  - backend reads the refresh token from the `HttpOnly` cookie
- Response: `ApiResponse<TokenResponse>`

### `POST /auth/logout`
- Access: public/idempotent
- Request:
  - `withCredentials: true`
  - send `Authorization: Bearer <accessToken>` when an access token is available
- Behavior:
  - clears the refresh cookie
  - revokes the current refresh session
  - blacklists the presented access token when valid
- Frontend behavior:
  - always clear local auth state and customer-specific query caches, even on `401`, `403`, or network failure
- Response: `ApiResponse<Void>`

### `POST /auth/password/forgot`
- Access: public
- Request:
  - `email` required, valid email format
- Response: `ApiResponse<Void>`
- Frontend behavior:
  - always show a generic success message
  - do not reveal whether the email exists

### `POST /auth/password/forgot/verify`
- Access: public
- Request:
  - `email`
  - `otp` as a 6-digit string
- Response: `ApiResponse<ResetTokenResponse>`
- Data fields: `resetToken`, `expiresAt` (ISO instant).
- Frontend behavior:
  - keep `resetToken` in memory/router state only
  - never persist it and never place it in the URL

### `POST /auth/password/reset`
- Access: public
- Request:
  - `resetToken`
  - `newPassword`
  - `confirmPassword`
- Response: `ApiResponse<Void>`
- `newPassword` is 8-128 characters in the request DTO; server requires uppercase, lowercase and digit, matching confirmation and a password different from the current one. Register retains its separate 8-64 limit.

### `POST /account/password/change`
- Access: authenticated
- Request:
  - `currentPassword`
  - `newPassword`
  - `confirmPassword`
- Response: `ApiResponse<Void>`
- `newPassword` uses the same 8-128 DTO limit and server policy as password reset; `currentPassword` and confirmation are required.
- Frontend behavior:
  - send Bearer access token
  - on success, clear auth state and redirect the user to sign in again because the backend revokes refresh sessions

### Email verification and device sessions

- `POST /account/email-verification` sends a six-digit OTP to the authenticated customer's current email.
- `POST /account/email-verification/confirm` takes `{ "otp": "123456" }`. After success, `GET /me` returns `emailVerified: true`. Both requests require CUSTOMER Bearer authentication.
- `GET /auth/sessions` returns `id`, `userAgent`, `lastRefreshedAt`, `expiresAt` and `current`. Use credentials so the HttpOnly cookie can identify the current device.
- `DELETE /auth/sessions/{sessionId}` revokes one other device. `DELETE /auth/sessions` revokes all other devices. Both require a matching active cookie and immediately block the revoked access and refresh tokens. Current-device logout uses the existing endpoint.
- Older Backend versions may omit `emailVerified` and return 404 for the sessions route. Customer Web only shows the new controls when the corresponding contract is available.
## 7. Profile Endpoints

### `GET /me`
- Access: authenticated
- Response: `ApiResponse<UserProfileResponse>`
- Key fields:
  - `id`, `email`, `firstName`, `lastName`, `phoneNumber`
  - `status`, `roles`
  - `customerId`, `gender`, `birthDate`, `avatarUrl`, `loyaltyPoints`
  - `emailVerified` when supported by the Backend
  - `createdAt`

### `PATCH /me`
- Access: authenticated
- Partial request fields:
  - `firstName`, `lastName`, `phoneNumber`, `gender`, `birthDate`
- Names have max 100 characters; phone uses backend `@PhoneNumber`; gender is `MALE`, `FEMALE` or `OTHER`; birth date uses `yyyy-MM-dd`.
- Response: `ApiResponse<UserProfileResponse>`

## 8. Address Endpoints

Address shape:
- `id`, `receiverName`, `phoneNumber`
- `streetAddress`, `ward`, `district`, `city`, `postalCode`
- `addressType`, `isDefault`, `label`, `fullAddress`
- `createdAt`

### `GET /addresses`
- Access: authenticated
- Response: `ApiResponse<List<AddressResponse>>`
- Ordering: default address first, then newest first

### `GET /addresses/{id}`
- Access: authenticated
- Response: `ApiResponse<AddressResponse>`

### `POST /addresses`
- Access: authenticated
- Status: `201 Created`
- Request:
  - `receiverName`, `phoneNumber`, `streetAddress`, `ward`, `district`, `city`, `addressType` required
  - `postalCode`, `isDefault`, `label` optional
- Maximum lengths: receiver name 100, street 255, ward/district/city 100, postal code 20, label 50. Phone uses `@PhoneNumber`. Address type is `SHIPPING`, `BILLING` or `BOTH`.
- Response: `ApiResponse<AddressResponse>`

### `PATCH /addresses/{id}`
- Access: authenticated
- Request: partial update of address fields
- Response: `ApiResponse<AddressResponse>`

### `DELETE /addresses/{id}`
- Access: authenticated
- Behavior: soft-delete
- Response: `ApiResponse<Void>`

## 9. Category Endpoints

Category shape:
- `id`, `parentId`, `name`, `slug`, `description`, `imageUrl`
- `status`, `sortOrder`, `createdAt`

### `GET /categories`
- Access: public
- Response: `ApiResponse<List<CategoryResponse>>`
- Returns active categories only

### `GET /categories/{id}`
- Access: public
- Response: `ApiResponse<CategoryResponse>`

## 10. Brand Endpoints

Brand shape:
- `id`, `name`, `slug`, `logoUrl`, `description`
- `sortOrder`, `status`, `createdAt`

### `GET /brands`
- Access: public
- Response: `ApiResponse<List<BrandResponse>>`
- Returns active brands only

### `GET /brands/{id}`
- Access: public
- Response: `ApiResponse<BrandResponse>`

## 11. Product Endpoints

### `GET /products`
- Access: public
- Response: `ApiResponse<PagedResponse<ProductListItemResponse>>`
- Filters:
  - `keyword`
  - `categoryId`
  - `brandId`
  - `minPrice`
  - `maxPrice`
  - `featured`
- `status` exists on the backend filter DTO but service forces `PUBLISHED`
- Default pagination/sort:
  - `size=20`
  - `sort=createdAt,desc`
- Keyword search contract:
  - customer FE still sends `keyword`; query params are unchanged
  - trim leading/trailing whitespace before sending
  - do not lowercase, de-accent, or otherwise normalize Vietnamese text on the frontend
  - when `keyword` is blank, omit it and let backend use the normal specification filter path
  - when `keyword` has text, backend applies FULLTEXT relevance first, then the requested compatible sort
  - customer FE must not client-filter or client-re-rank product results after response
- Customer storefront sort values should map only to backend-compatible fields:
  - `featured,desc`
  - `createdAt,desc`
  - `updatedAt,desc`
  - `name,asc`
- Do not send customer product admin params such as `isDeleted` or `includeDeleted`
- `searchText` / `search_text` is backend-internal and must never be sent, mapped, or rendered by the frontend

List item fields used by frontend:
- `id`, `name`, `slug`, `shortDescription`, `thumbnailUrl`
- `minPrice`, `maxPrice`
- `status`, `featured`
- `brandName`, `categoryNames`
- `createdAt`

### `GET /products/{id}`
- Access: public
- Response: `ApiResponse<ProductDetailResponse>`
- This is the ID lookup; storefront slug lookup is also supported below.
- Product detail includes:
  - `id`, `name`, `slug`, `shortDescription`, `description`
  - `status`, `featured`
  - `minPrice`, `maxPrice` (nullable/omitted when no eligible variants)
  - `brand`, `categories`, `variants`, `media`
  - `returnPolicy` (may be omitted by older Backend versions)
  - `createdAt`, `updatedAt`

### `GET /products/slug/{slug}`
- Access: public
- Response: `ApiResponse<ProductDetailResponse>`
- Resolve storefront PDPs by this exact slug endpoint. Do not page through `GET /products` to find a slug.

Variant fields:
- `id`, `productId`, `sku`, `barcode`, `variantName`
- `basePrice`, `salePrice`, `compareAtPrice`
- `weightGram`, `status`, `attributes`

Variant and inventory semantics:
- One product may have multiple variants. `variants[]` is supplied by both detail lookups, not by the paginated product list.
- Attribute entries are `{ attributeId, attributeName, attributeCode, valueId, value, displayValue }`. They are catalog-backed and not limited to color/size. Preserve IDs to distinguish combinations; do not infer identity from a formatted label.
- Effective price is `salePrice` when non-null, otherwise `basePrice`. `compareAtPrice` is a display reference, not the amount charged.
- Detail min/max prices span non-deleted variants. The current detail service excludes deleted variants, but does not filter the array to `ACTIVE`; the cart rejects inactive variants.
- Neither `VariantResponse` nor the public list DTO exposes stock quantities. Missing inventory is unknown, not zero. Cart responses expose `availableStock`; checkout reserves inventory and can still reject insufficient stock.
- Admin reads inventory through `/admin/inventories` with product/variant context. Customer Web must not call it. Exact stock on PDP would require an approved customer-safe contract extension.

Media fields:
- `id`, `mediaUrl`, `mediaType`, `sortOrder`, `primary`, `variantId`

## 12. Cart Endpoints

Cart shape:
- `id`, `items`, `totalItems`, `subTotal`, `updatedAt`

Cart item shape:
- `id`, `variantId`, `variantName`, `sku`
- `productId`, `productSlug`, `productName`, `brandName`, `productImageUrl`
- `unitPrice`, `salePrice`
- `quantity`, `availableStock`, `lineTotal`
- `createdAt`

### `GET /cart`
- Access: authenticated
- Behavior: gets or lazily creates the active cart
- Response: `ApiResponse<CartResponse>`

### `POST /cart/items`
- Access: authenticated
- Request:
  - `variantId` required
  - `quantity` required, min `1`
- Behavior: existing variant lines are merged
- Response: `ApiResponse<CartResponse>`

### `PATCH /cart/items/{itemId}`
- Access: authenticated
- Request:
  - `quantity` required, min `1`
- Response: `ApiResponse<CartResponse>`

### `DELETE /cart/items/{itemId}`
- Access: authenticated
- Response: `ApiResponse<CartResponse>`

### `DELETE /cart`
- Access: authenticated
- Response: `ApiResponse<Void>`

## 13. Order Endpoints

### Return policy and replacement orders

Backend contract confirmed against [backend PR #80](https://github.com/NguyenVanLoc2002/ecommerce-backend/pull/80).

- Product detail exposes `returnPolicy`. Checkout preview exposes `returnPolicies[]` as `{ variantId, policy }` so restrictions can be shown before checkout. The values are `STANDARD`, `SEALED_ONLY`, `REVIEW_REQUIRED`, and `CUSTOMIZED_FINAL_SALE`. Product detail previews the strictest configured policy across the product and its non-deleted categories, with `REVIEW_REQUIRED` when none is configured. Omit the PDP preview when the field is absent. Return eligibility uses the policy snapshot captured when the order is placed.
- Admin-created replacements may appear in order history. They use `paymentMethod: EXCHANGE` and `paymentStatus: NOT_REQUIRED`, with `replacementForOrderId` on order detail. Keep these values out of payment selection. The replacement has no Payment record, voucher redemption, or sales invoice.
- Return notifications use `RETURN_UPDATED`. A return request leaves the original order and its delivery history intact.

#### `POST /orders/{orderId}/returns`

An authenticated customer can submit a request against an owned order after delivery. Send `Idempotency-Key` and a body with `reason`, `note`, and `items` containing `orderItemId` and `quantity`. Reasons are `DEFECTIVE`, `WRONG_ITEM`, `MISSING_ITEM`, `NOT_AS_DESCRIBED`, and `CHANGED_MIND`. For `CHANGED_MIND`, send `originalCondition` and, for sealed-only items, `unopened`. Eligibility uses the order-item snapshot.

The submission window is 14 days from delivery. A delivered order without a timestamp enters `PENDING_DELIVERY_VERIFICATION`. The response is `ApiResponse<ReturnResponse>` with `id`, `orderId`, `status`, `reason`, `note`, `createdAt`, and `items`. A matching retry returns the existing request.

Refund preparation and confirmation are Admin actions. Report the status of the linked refund separately from the return status.

#### `GET /orders/{orderId}/returns`

Authenticated owner. Returns `eligibleItems[]` with each item's server-calculated `availableQuantity`, `allowedReasons[]` and `unopenedRequiredForChangedMind`, plus `requests[]` with existing return summaries. The POST endpoint rechecks eligibility and claimable quantities.

#### `GET /orders/{orderId}/returns/{returnId}`

Authenticated owner. Returns the request, its chronological status timeline, reverse tracking and inspection details when recorded, linked refund status and amount, and exchanges with any replacement order ID.


Create order request:
- `shippingAddressId` required
- `carrierId` optional; backend resolves the selected carrier and calculates shipping
- `paymentMethod` optional
- `customerNote` optional, max `500`
- `voucherCode` optional

Order list item fields:
- `id`, `orderCode`, `status`, `paymentMethod`, `paymentStatus`
- `totalItems`, `totalAmount`, `createdAt`

Order detail fields:
- `id`, `orderCode`, `customerId`
- `customerNameSnapshot`, `customerEmailSnapshot`, `customerSnapshotAvailable` (legacy snapshots may be absent)
- `carrierId`, `carrierCode`, `carrierName`, `carrierProviderType`
- `status`, `paymentMethod`, `paymentStatus`
- shipping receiver and address snapshot fields
- Exact address keys: `receiverName`, `receiverPhone`, `shippingStreet`, `shippingWard`, `shippingDistrict`, `shippingCity`, `shippingPostalCode`.
- `subTotal`, `discountAmount`, `shippingFee`, `totalAmount`
- `voucherCode`, `customerNote`
- `items`, `createdAt`

Order item fields:
- `id`, `variantId`, `productId`, `productSlug`, `productName`, `brandName`
- `variantName`, `sku`, `productImageUrl`, `unitPrice`, `salePrice`, `quantity`, `lineTotal`
- `OrderItemResponse` does not expose `effectivePrice`; that field exists on invoice items. Use server `lineTotal`; a displayed per-unit price uses non-null `salePrice`, otherwise `unitPrice`.

### `GET /carriers/checkout-options`
- Access: authenticated customer
- Response: `ApiResponse<List<CheckoutCarrierOptionResponse>>`
- Fields: `id`, `code`, `name`, `providerType`, `logoUrl`, `description`
- Lists active eligible carriers with registered providers and required configuration enabled. Does not expose secrets or quote fees.

### `POST /orders/preview`
- Access: authenticated customer
- Request: the create-order fields above; uses the current customer's active cart and validates address ownership.
- Response: `ApiResponse<OrderPreviewResponse>` with `carrierId`, `carrierCode`, `carrierName`, `carrierProviderType`, `shippingServiceName`, `paymentMethod`, `subTotal`, `discountAmount`, `shippingFee`, `totalAmount`, `voucherCode`, `customerNote`.
- Validates vouchers using actual cart product/category/brand context. Preview does not redeem the voucher or reserve stock.
- Calculates shipping server-side. Omitted `carrierId` produces zero shipping fee. Total is subtotal minus discount plus shipping.
- Creation revalidates/recalculates; preview is not a price or stock reservation. Do not send client-calculated price fields or add an idempotency header to preview.

### `POST /orders`
- Access: authenticated
- Status: `201 Created`
- Required header:
  - `Idempotency-Key: <client-generated-unique-string>`
- Header rules:
  - required and non-blank
  - max length `100`
  - generate one key per user action
  - reuse the same key only when retrying the same checkout action with the same payload
  - generate a new key after the checkout payload changes
- Response: `ApiResponse<OrderResponse>`
- Current behavior:
  - omitted `paymentMethod` defaults to `COD`
  - `COD` starts as `PENDING`
  - `ONLINE` starts as `AWAITING_PAYMENT`
  - stock is reserved during order creation
  - supplied `voucherCode` is validated and atomically redeemed against the active cart; validated code and discount are saved on the order
  - selected carrier and shipping quote are recalculated and snapshotted; absent carrier means zero shipping fee
  - total includes the persisted discount and shipping; never replace it with client arithmetic

### Checkout hold expiry and late online payment
- Online checkout holds stock for up to 30 minutes while the order awaits payment.
- COD orders await Admin confirmation for up to 24 hours. Once the order is confirmed and fulfillment begins, the checkout hold window no longer describes the order lifecycle.
- When an awaiting order expires, the Backend cancels it and releases its reservation. Customer Web must read current order and payment statuses; it must not calculate a countdown from `createdAt`.
- A late successful online payment is recorded as `PAID`, while the expired order remains `CANCELLED`. Show that the money was received, the order will not enter fulfillment, and manual reconciliation/refund is required. Do not imply an automatic refund or give a refund timeline.
- No customer endpoint returns an authoritative checkout `expiredAt`. Display the hold duration as policy copy only; do not render a deadline or countdown.
- Before starting, resuming, or retrying online payment, verify that the order remains `AWAITING_PAYMENT` and is an `ONLINE` order. Do not initiate/capture payment for a `CANCELLED` order.

### `GET /orders`
- Access: authenticated
- Filters:
  - `status`
- Pagination:
  - `page`, `size`, `sort`
  - controller default `size=20`
- Response: `ApiResponse<PagedResponse<OrderListItemResponse>>`

- `itemsPreview` contains up to three order item snapshots in stable creation order.
- `remainingItemLines` counts omitted lines. `totalItems` continues to count all purchased units.


### `GET /orders/{id}`
- Access: authenticated
- Response: `ApiResponse<OrderResponse>`

### `POST /orders/my/{id}/cancel`
- Access: authenticated
- Response: `ApiResponse<OrderResponse>`
- Current behavior:
  - cancel is only allowed while order can move to `CANCELLED`
  - service explicitly blocks `CONFIRMED`
  - paid ONLINE orders are rejected with `ORDER_CANNOT_CANCEL`; cancellation is not an automatic refund

## 14. Payment Endpoints

Payment shape:
- `id`, `orderId`, `orderCode`, `paymentCode`
- `method`, `status`, `amount`, `paidAt`, `createdAt`
- `transactions`
- `paymentUrl` for provider redirect, optional `deeplink`, optional `qrCodeUrl` (raw QR payload, not an image URL)
- Customer order/payment amounts are VND. PayPal provider conversion is performed and snapshotted by the backend; the UI must not relabel order amounts as USD.

Transaction shape:
- `id`, `transactionCode`, `status`, `amount`
- `method`, `provider`, `providerTxnId`
- `referenceType`, `referenceId`, `note`, `createdAt`

### `GET /payments/order/{orderId}`
- Access: authenticated
- Response: `ApiResponse<PaymentResponse>`

### `POST /payments/order/{orderId}/initiate`
- Access: authenticated
- Status: `201 Created`
- Request body:
  - `provider` optional
  - `returnUrl` optional
  - body may be omitted
- Required header:
  - `Idempotency-Key: <client-generated-unique-string>`
- Header rules:
  - required and non-blank
  - max length `100`
  - generate one key per user action
  - reuse the same key only when retrying the same payment-initiate action with the same payload
  - generate a new key when the payment target or payload changes
- Response: `ApiResponse<PaymentResponse>`
- Current behavior:
  - order must belong to current customer
  - order payment method must be `ONLINE`
  - existing `PENDING` or `INITIATED` payment returns existing record
  - existing `FAILED` payment is retried
  - terminal processed states are rejected

### `POST /payments/order/{orderId}/capture`
- Authenticated owner; body `{ provider, providerToken }`. PayPal return supplies the provider token; the backend verifies it against the stored provider order.
- Response: `ApiResponse<PaymentResponse>`; already-paid capture returns the existing payment. Keep existing provider return/cancel flows and subsequent server status checks.
- A browser return URL is not proof of successful payment.
- Both body fields are non-blank; provider max 50 characters and providerToken max 200.

### Provider webhooks and development payment
- `POST /webhooks/payment/{provider}` is server-to-server and signature-verified. Never call it from the customer UI.
- The current `PaymentController` has no `/payments/callback` route; older references to it are obsolete.
- MOMO and PAYPAL require configured/enabled backend providers. MOCK is development/test only, gated by backend configuration and the Customer Web E2E flag; it must not appear as a normal production payment option.
- When enabled, `GET /payments/mock/complete` accepts `orderCode`, `providerTxnId`, and optional `status` (default `SUCCESS`). This development callback is not a general customer mutation endpoint.

## 15. Voucher Endpoint

Validate request:
- `orderAmount` required, decimal `>= 0.01`
- `productIds`, `categoryIds`, `brandIds` optional

Validate response:
- `voucherCode`, `promotionName`
- `discountType`, `discountValue`
- `discountAmount`, `orderAmount`, `finalAmount`

### `POST /vouchers/{code}/validate`
- Access: authenticated
- Response: `ApiResponse<ValidateVoucherResponse>`
- Note:
  - previews discount only
  - does not record voucher usage
  - this restriction applies only to this validation endpoint. `POST /orders` redeems the voucher atomically and persists discount totals.
  - validation accepts product/category/brand context; a subtotal-only validation call cannot substitute for cart-aware order preview.

## 16. Shipment Endpoint

Shipment shape:
- `id`, `orderId`, `orderCode`, `shipmentCode`
- `carrierId`, `carrierCode`, `carrierProviderType`, `carrierShipmentId`, `providerStatus`, `providerTrackingUrl`
- `carrier`, `trackingNumber`, `status`
- `estimatedDeliveryDate`, `deliveredAt`
- `shippingFee`, `note`
- `events`, `createdAt`, `updatedAt`
- Optional derived `attention`: `RETURNED_HANDLING`, `CARRIER_CANCELLED` or `DELIVERY_FAILED`.
- Customer mapping omits carrier costs, booking attempt/status and carrier override audit fields even though the shared Admin DTO declares them. Do not add these to customer UI based on Admin docs.

Shipment event shape:
- `id`, `status`, `location`, `description`, `eventTime`

### `GET /shipments/order/{orderId}`
- Access: authenticated
- Response: `ApiResponse<ShipmentResponse>`

## 17. Invoice Endpoint

Invoice shape:
- `id`, `invoiceCode`, `status`, `issuedAt`, `dueDate`, `notes`
- `orderId`, `orderCode`, `paymentMethod`, `paymentStatus`, `paidAt`
- `customerName`, `customerEmail`, `customerPhone`
- billing address snapshot fields
- `items`
- `subTotal`, `discountAmount`, `shippingFee`, `totalAmount`, `voucherCode`
- `createdAt`

Invoice item shape:
- `variantId`, `productName`, `variantName`, `sku`
- `unitPrice`, `salePrice`, `effectivePrice`
- `quantity`, `lineTotal`

### `GET /invoices/order/{orderId}`
- Access: authenticated
- Response: `ApiResponse<InvoiceResponse>`
- `INVOICE_NOT_FOUND` means the owned order does not yet have an invoice; do not manufacture invoice data from the order.
- Status: `ISSUED`, `PAID`, `PARTIALLY_REFUNDED`, `REFUNDED`, `VOIDED`. Payment/refund events synchronize invoice status.
- Returns data for browser printing, not a PDF download endpoint.

## 18. Review Endpoints

Create review request:
- `orderItemId` required
- `rating` required, `1..5`
- `comment` optional, max `2000`

Review fields:
- `id`
- `customerId`, `customerName`
- `productId`, `productSlug`, `productName`, `brandName`, `productImageUrl`
- `variantId`, `variantName`, `sku`
- `orderItemId`, `orderId`
- `rating`, `comment`
- `status`, `adminNote`, `moderatedAt`, `moderatedBy`
- `createdAt`, `updatedAt`

### `POST /reviews`
- Access: `CUSTOMER`
- Status: current code returns `200 OK`
- Response: `ApiResponse<ReviewResponse>`
- Current behavior:
  - order item must belong to current customer
  - parent order must be `COMPLETED`
  - one review per order item
  - new review starts as `PENDING`

### `GET /reviews/my`
- Access: `CUSTOMER`
- Pagination:
  - `page`, `size`, `sort`
  - controller default `size=20`
- Response: `ApiResponse<PagedResponse<ReviewResponse>>`

### `GET /reviews/product/{productId}`
- Access: authenticated under current `SecurityConfig`; the controller has no method role restriction, but the filter chain does not whitelist this path. Older docs calling it public disagree with source.
- Filters:
  - `minRating`, `maxRating`
  - service forces `productId` from path and `status=APPROVED`
- Pagination:
  - `page`, `size`, `sort`
  - controller default `size=20`
- Response: `ApiResponse<PagedResponse<ReviewResponse>>`

Review moderation belongs under `/admin/reviews/**`. Old references to pending/read/moderate/delete routes directly under `/reviews/**` are not customer routes and are not present in the current customer controller.

## 19. Notification Endpoints

Notification fields:
- `id`, `type`, `title`, `body`
- `referenceId`, `referenceType`
- `read`, `readAt`, `createdAt`

Unread count fields:
- `count`

### `GET /notifications`
- Access: `CUSTOMER`
- Pagination:
  - `page`, `size`, `sort`
  - controller default `size=20`
- Response: `ApiResponse<PagedResponse<NotificationResponse>>`

### `GET /notifications/unread-count`
- Access: `CUSTOMER`
- Response: `ApiResponse<UnreadCountResponse>`

### `PATCH /notifications/{id}/read`
- Access: `CUSTOMER`
- Response: `ApiResponse<NotificationResponse>`
- Behavior: idempotent

### `PATCH /notifications/read-all`
- Access: `CUSTOMER`
- Response: `ApiResponse<Void>`
- Void data is null internally and may be omitted from JSON.

## 20. Error Codes Relevant to Customer Frontend

General:
- `BAD_REQUEST`
- `UNAUTHORIZED`
- `FORBIDDEN`
- `NOT_FOUND`
- `VALIDATION_ERROR`
- `CONFLICT`
- `INTERNAL_SERVER_ERROR`
- `IDEMPOTENCY_KEY_REQUIRED`
- `IDEMPOTENCY_KEY_TOO_LONG`
- `IDEMPOTENCY_KEY_CONFLICT`
- `IDEMPOTENCY_REQUEST_IN_PROGRESS`
- `IDEMPOTENCY_REPLAY_NOT_AVAILABLE`
- `OPTIMISTIC_LOCK_CONFLICT`

Auth and profile:
- `INVALID_CREDENTIALS`
- `TOKEN_EXPIRED`
- `TOKEN_INVALID`
- `REFRESH_TOKEN_INVALID`
- `TOKEN_BLACKLISTED`
- `ACCOUNT_DISABLED`
- `ACCOUNT_ALREADY_EXISTS`
- `USER_NOT_FOUND`
- `CUSTOMER_NOT_FOUND`
- `EMAIL_ALREADY_EXISTS`
- `PHONE_ALREADY_EXISTS`
- `OTP_INVALID`
- `OTP_EXPIRED`
- `OTP_USED`
- `OTP_TOO_MANY_ATTEMPTS`
- `OTP_RATE_LIMITED`
- `RESET_TOKEN_INVALID`
- `RESET_TOKEN_EXPIRED`
- `PASSWORD_MISMATCH`
- `PASSWORD_POLICY_VIOLATED`
- `PASSWORD_REUSED`
- `CURRENT_PASSWORD_INVALID`
- `CSRF_TOKEN_INVALID`

Address:
- `ADDRESS_NOT_FOUND`

Catalog and inventory:
- `CATEGORY_NOT_FOUND`
- `BRAND_NOT_FOUND`
- `PRODUCT_NOT_FOUND`
- `PRODUCT_INACTIVE`
- `PRODUCT_VARIANT_NOT_FOUND`
- `PRODUCT_VARIANT_INACTIVE`
- `INVENTORY_NOT_FOUND`
- `INVENTORY_NOT_ENOUGH`
- `VARIANT_OUT_OF_STOCK`
- `STOCK_RESERVATION_FAILED`

Cart:
- `CART_NOT_FOUND`
- `CART_ITEM_NOT_FOUND`
- `CART_ITEM_QUANTITY_INVALID`

Order:
- `ORDER_NOT_FOUND`
- `ORDER_STATUS_INVALID`
- `ORDER_CANNOT_CANCEL`
- `ORDER_CANNOT_COMPLETE`
- `ORDER_EMPTY`

Payment:
- `PAYMENT_NOT_FOUND`
- `PAYMENT_FAILED`
- `PAYMENT_ALREADY_PROCESSED`
- `PAYMENT_CALLBACK_INVALID`
- `PAYMENT_PROVIDER_NOT_SUPPORTED`
- `PAYMENT_CONFIG_MISSING`
- `PAYMENT_CONFIG_DISABLED`
- `PAYMENT_CURRENCY_UNSUPPORTED`

Voucher:
- `VOUCHER_NOT_FOUND`
- `VOUCHER_INVALID`
- `VOUCHER_EXPIRED`
- `VOUCHER_USAGE_LIMIT_EXCEEDED`
- `VOUCHER_NOT_APPLICABLE`
- `VOUCHER_MIN_ORDER_NOT_MET`
- `VOUCHER_USER_LIMIT_EXCEEDED`
- `PROMOTION_NOT_FOUND`
- `PROMOTION_RULE_NOT_FOUND`

Shipment and invoice:
- `CARRIER_NOT_FOUND`
- `CARRIER_CONFIG_MISSING`
- `CARRIER_CONFIG_DISABLED`
- `CARRIER_REQUEST_FAILED`
- `CARRIER_PROVIDER_NOT_SUPPORTED`
- `SHIPMENT_NOT_FOUND`
- `SHIPMENT_ALREADY_EXISTS`
- `SHIPMENT_STATUS_INVALID`
- `INVOICE_NOT_FOUND`
- `INVOICE_ALREADY_EXISTS`
- `INVOICE_STATUS_INVALID`

Review and notification:
- `REVIEW_NOT_FOUND`
- `REVIEW_NOT_ELIGIBLE`
- `REVIEW_ALREADY_EXISTS`
- `REVIEW_ALREADY_MODERATED`
- `NOTIFICATION_NOT_FOUND`

## 21. Frontend Integration Notes

Lifecycle values verified from backend enums (keep distinct domains, not one shared status union):

| Field | Values |
| --- | --- |
| Order `status` | `PENDING`, `AWAITING_PAYMENT`, `CONFIRMED`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `COMPLETED`, `CANCELLED`, `REFUNDED` |
| Order `paymentStatus` | `PENDING`, `PAID`, `PARTIALLY_REFUNDED`, `FAILED`, `REFUNDED`, `CANCELLED`, `NOT_REQUIRED` |
| Payment record `status` | `PENDING`, `INITIATED`, `PAID`, `FAILED`, `REFUNDED`, `PARTIALLY_REFUNDED`, `CANCELLED` |
| Shipment `status` | `PENDING`, `PICKING`, `IN_TRANSIT`, `OUT_FOR_DELIVERY`, `DELIVERED`, `FAILED`, `RETURNED` |

Customer cancellation is limited to `PENDING`/`AWAITING_PAYMENT` by the current transition/service guards and also rejects paid ONLINE orders. These values do not authorize client-side state changes.

- Axios must unwrap `ApiResponse.data`
- Protected endpoints require Bearer token
- Access tokens live in memory only
- Refresh tokens live in `HttpOnly` cookies only
- Use `items/page/size/totalItems/totalPages/hasNext/hasPrevious` for pagination
- Product search is backend FULLTEXT now, but the frontend contract still uses `keyword`
- Send raw trimmed keywords only; do not normalize Vietnamese accents on the client
- Do not expose or display `searchText` / `search_text`
- Do not call admin product search endpoints from the customer app
- Do not client-side filter or re-sort backend keyword search results
- Use `/products/slug/{slug}` for storefront slug lookup; do not scan paged `/products` responses.
- Payment callback is not a customer UI endpoint
- Payment `PAID` does not by itself prove that an order can enter fulfillment. Read both order and payment status, and treat `CANCELLED` + `PAID` as a manual reconciliation/refund case.
- Customer Web sends `Idempotency-Key` only for `POST /orders` and `POST /payments/order/{orderId}/initiate`
- Generate one UUID-like key per user action and keep the same key for same-action retry after timeout or `5xx`
- Do not reuse an idempotency key for a different checkout payload, order, or payment-initiate payload
- Customer Web must not call provider webhooks or the obsolete `/payments/callback` path.
- Do not use admin endpoints
- Never store `refreshToken`, `resetToken`, OTP values, or passwords in `localStorage` or `sessionStorage`
- Never send `refreshToken` in the customer `POST /auth/refresh-token` body
- Query/path enums are case-insensitive
- JSON enum values are case-insensitive
- Validation failures return HTTP `422`

## Current Risk Notes

- Storefront product slugs resolve through `GET /products/slug/{slug}`.
- Voucher validation alone is preview-only. Order preview calculates the cart-aware discount; order creation atomically redeems the voucher and persists discount and shipping totals.
- Review creation requires the parent order to be `COMPLETED`, not merely delivered.

### Size guide and assigned catalog badges

- Both product-detail lookups may return `sizeGuide`. It contains `id`, `name` and `content` with `measurement` (`BODY` or `GARMENT`), ordered `columns`, ordered `rows`, and optional HTTPS `measurementImageUrl` and `notes`.
- Each column uses `{ key, label, unit }` with unit `CM`, `IN` or `KG`. Each row uses `{ size, values }`, keyed by column key. A cell `{ min, max? }` is either a fixed value or an inclusive range. Absence of `sizeGuide` hides the action. This information is advisory. Cart and inventory continue using catalog variant IDs.
- The server resolves active guides in order Product → Category + Brand → Brand → Category → Shop default. Within a category scope the lower configured assignment priority wins, followed by category sort order and slug.
- Product detail may contain `badges` with up to two `{ code, label }` entries. Product list items may contain a single `badge` of the same shape. These are explicitly assigned and active. Price and inventory states come from their own contract. `featured` continues to control product discovery.
- The product detail shipping note describes when the existing quote is calculated. `CheckoutCarrierQuoteResponse` exposes `shippingFee` and no ETA field. `estimatedDeliveryDate` belongs to shipment tracking. PDP omits an inclusive-VAT label because the catalog does not provide VAT applicability. The Cart and Order Preview contract below describes the optional storefront VAT summary.


## Cart free shipping and VAT (#34)

`GET /cart` may return `freeShipping` (`enabled`, `threshold`, `eligibleAmount`, `remainingAmount`, `qualified`, `currency`, `policyRevision`). Values are VND, based on merchandise before any checkout voucher. A disabled policy is omitted. `POST /vouchers/{code}/validate` may return the same object based on the validated merchandise amount after the submitted voucher. The Cart UI displays any voucher discount as an estimate and keeps the original server cart subtotal. `POST /orders/preview` returns the optional object for the checkout context and the authoritative quoted customer fee. Cart never requests a carrier quote or ETA.

The Cart and Order Preview may also return `vatSummary` for merchandise as `INCLUDED_SINGLE_RATE` with `rateFraction` (including zero), `INCLUDED_MULTIPLE_RATES` or `NOT_TAXABLE`. If absent, hide the VAT label. Neither field changes the request schema. Order creation revalidates shipping and vouchers.

## Shipping policy (#88)

`GET /api/v1/policies/shipping` returns the currently effective published version with `version`, `title`, `content`, `effectiveFrom` and `publishedAt`. Content is plain text. A 404 means no public version is currently available. The PDP checks only when opening the shipping accordion. The public page is `/policies/shipping`. Fees remain sourced from Checkout.

Updating or deleting an address resets cached Checkout previews even when the same address ID was used for a prior quote. Deleting the selected address clears checkout selection. The Backend continues to calculate prices and fees.
