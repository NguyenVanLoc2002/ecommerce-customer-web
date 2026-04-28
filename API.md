# API.md

Primary API source of truth for the customer web app.

This file consolidates `docs/original/api-common.md` and `docs/original/customer-api-contract.md`.

## 1. API Source-of-Truth Order

Use this order for API decisions:

1. `API.md`
2. Backend behavior proven by current source
3. `docs/original/customer-api-contract.md`
4. `docs/original/api-common.md`
5. `docs/original/ui-spec.md` for user-facing handling only

## 2. Global Conventions

Base path:

- `/api/v1`

Auth:

- Stateless JWT
- Protected requests use `Authorization: Bearer <accessToken>`
- Public endpoints include auth register/login/refresh, payment callback, and product/category/brand reads

Success wrapper:

```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "Request processed successfully",
  "data": {},
  "timestamp": "2026-04-27T10:00:00Z"
}
```

Error wrapper:

```json
{
  "success": false,
  "code": "VALIDATION_ERROR",
  "message": "Validation failed",
  "errors": [
    { "field": "email", "message": "Email is required" }
  ],
  "timestamp": "2026-04-27T10:00:00Z",
  "path": "/api/v1/auth/register"
}
```

Pagination:

- Standard params: `page`, `size`, `sort`
- Paged response fields: `items`, `page`, `size`, `totalItems`, `totalPages`, `hasNext`, `hasPrevious`

Enum parsing:

- Query enums are case-insensitive
- JSON enums are case-insensitive

## 3. Auth and Role Model

Role hierarchy:

- `SUPER_ADMIN > ADMIN > STAFF > CUSTOMER`

Customer web constraints:

- Build only for `CUSTOMER`
- Protected customer endpoints require a bearer token
- Security-layer failures may return generic `401 UNAUTHORIZED` and `403 FORBIDDEN`

Token model:

- Login, register, and refresh return `accessToken`, `refreshToken`, `tokenType`, `expiresIn`
- Logout blacklists the current access token

## 4. Endpoint Index

### Authentication

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh-token`
- `POST /auth/logout`

### Current user

- `GET /me`
- `PATCH /me`

### Addresses

- `GET /addresses`
- `GET /addresses/{id}`
- `POST /addresses`
- `PATCH /addresses/{id}`
- `DELETE /addresses/{id}`

### Catalog

- `GET /categories`
- `GET /categories/{id}`
- `GET /brands`
- `GET /brands/{id}`
- `GET /products`
- `GET /products/{id}`

### Cart

- `GET /cart`
- `POST /cart/items`
- `PATCH /cart/items/{itemId}`
- `DELETE /cart/items/{itemId}`
- `DELETE /cart`

### Orders

- `POST /orders`
- `GET /orders`
- `GET /orders/{id}`
- `POST /orders/my/{id}/cancel`

### Payments

- `GET /payments/order/{orderId}`
- `POST /payments/order/{orderId}/initiate`
- `POST /payments/callback`

### Voucher validation

- `POST /vouchers/{code}/validate`

### Shipments

- `GET /shipments/order/{orderId}`

### Invoices

- `GET /invoices/order/{orderId}`

### Reviews

- `POST /reviews`
- `GET /reviews/my`
- `GET /reviews/product/{productId}`

### Notifications

- `GET /notifications`
- `GET /notifications/unread-count`
- `PATCH /notifications/{id}/read`
- `PATCH /notifications/read-all`

## 5. Domain Summaries

### Authentication

Register:

- Body: `email`, `password`, `firstName`, `lastName`, `phoneNumber`
- Returns authenticated user plus token pair
- Errors: `EMAIL_ALREADY_EXISTS`, `PHONE_ALREADY_EXISTS`, `VALIDATION_ERROR`

Login:

- Body: `email`, `password`
- Errors: `INVALID_CREDENTIALS`, `ACCOUNT_DISABLED`, `VALIDATION_ERROR`

Refresh:

- Body: `refreshToken`
- Returns a new token pair
- Errors include `REFRESH_TOKEN_INVALID`

Logout:

- No body
- Invalidates the current access token

### Current User

`GET /me` returns:

- identity
- customer profile fields
- `gender`
- `birthDate`
- `avatarUrl`
- `loyaltyPoints`

`PATCH /me` accepts partial updates for:

- `firstName`
- `lastName`
- `phoneNumber`
- `gender`
- `birthDate`

### Addresses

Address fields:

- `receiverName`
- `phoneNumber`
- `streetAddress`
- `ward`
- `district`
- `city`
- `postalCode`
- `addressType`
- `isDefault`
- `label`

Behavior:

- Address ownership is enforced
- Create and update support `isDefault`
- Delete is soft-delete

### Catalog

Categories and brands:

- Public
- List endpoints return active records only
- Detail endpoints do not guarantee active-only filtering

Products list:

- Public
- Filters: `keyword`, `categoryId`, `brandId`, `minPrice`, `maxPrice`, `featured`
- Public list always forces `PUBLISHED`

Product detail:

- Current backend contract is `GET /products/{id}`
- Returns product, brand, categories, variants, and media
- Can return `PRODUCT_INACTIVE` if the product is not `PUBLISHED`

### Cart

Behavior:

- `GET /cart` auto-creates an active cart if missing
- `POST /cart/items` merges quantities for an existing variant
- Cart totals come from the backend response

Important response fields:

- `items`
- `totalItems`
- `subTotal`
- `updatedAt`

### Orders

Create order body:

- `shippingAddressId`
- `paymentMethod`
- `customerNote`
- `voucherCode`

Behavior:

- `COD` starts in `PENDING`
- `ONLINE` starts in `AWAITING_PAYMENT`
- Stock is reserved during creation
- Voucher code is currently stored but not actually validated or applied to totals

Customer cancel:

- Allowed only from `PENDING` or `AWAITING_PAYMENT`
- Releases reserved stock on success

### Payments

Payment lookup:

- `GET /payments/order/{orderId}`

Initiate payment:

- Works only for orders with `paymentMethod = ONLINE`
- Existing `PENDING` or `INITIATED` payments are reused
- `FAILED` can be retried by reinvoking initiation
- `PAID`, `REFUNDED`, or `PARTIALLY_REFUNDED` reject initiation

Payment callback:

- Public
- Intended for gateway callers
- Treats `SUCCESS` as success and everything else as failure

### Voucher Validation

Preview-only endpoint:

- `POST /vouchers/{code}/validate`
- Body includes `orderAmount` plus optional product/category/brand scopes
- Returns computed discount preview
- Does not consume usage

### Shipments

- `GET /shipments/order/{orderId}`
- Returns shipment identity, carrier, tracking number, status, dates, fee, and event timeline

### Invoices

- `GET /invoices/order/{orderId}`
- Returns invoice identity, payment snapshot, billing snapshot, line items, and totals

### Reviews

Create review body:

- `orderItemId`
- `rating`
- `comment`

Behavior:

- Review requires completed order ownership
- One review per order item
- New review status starts as `PENDING`
- Current backend docs say create returns `200 OK`, not `201 Created`

Public product reviews:

- `GET /reviews/product/{productId}`
- Approved reviews only

### Notifications

Notification fields:

- `id`
- `type`
- `title`
- `body`
- `referenceId`
- `referenceType`
- `read`
- `readAt`
- `createdAt`

Behavior:

- Unread count endpoint exists
- Mark-read is idempotent
- Mark-all-read returns `data = null`

## 6. Critical Error Codes

Auth:

- `INVALID_CREDENTIALS`
- `ACCOUNT_DISABLED`
- `REFRESH_TOKEN_INVALID`
- `TOKEN_INVALID`
- `TOKEN_BLACKLISTED`

Identity and profile:

- `USER_NOT_FOUND`
- `EMAIL_ALREADY_EXISTS`
- `PHONE_ALREADY_EXISTS`

Catalog and stock:

- `PRODUCT_NOT_FOUND`
- `PRODUCT_INACTIVE`
- `PRODUCT_VARIANT_NOT_FOUND`
- `PRODUCT_VARIANT_INACTIVE`
- `INVENTORY_NOT_ENOUGH`
- `VARIANT_OUT_OF_STOCK`
- `STOCK_RESERVATION_FAILED`

Cart and order:

- `CART_NOT_FOUND`
- `CART_ITEM_NOT_FOUND`
- `CART_ITEM_QUANTITY_INVALID`
- `ORDER_NOT_FOUND`
- `ORDER_EMPTY`
- `ORDER_STATUS_INVALID`
- `ORDER_CANNOT_CANCEL`

Payment and voucher:

- `PAYMENT_NOT_FOUND`
- `PAYMENT_FAILED`
- `PAYMENT_ALREADY_PROCESSED`
- `PAYMENT_CALLBACK_INVALID`
- `VOUCHER_NOT_FOUND`
- `VOUCHER_INVALID`
- `VOUCHER_EXPIRED`
- `VOUCHER_USAGE_LIMIT_EXCEEDED`
- `VOUCHER_USER_LIMIT_EXCEEDED`
- `VOUCHER_MIN_ORDER_NOT_MET`
- `VOUCHER_NOT_APPLICABLE`

Shipment, invoice, review, notification:

- `SHIPMENT_NOT_FOUND`
- `INVOICE_NOT_FOUND`
- `REVIEW_NOT_ELIGIBLE`
- `REVIEW_ALREADY_EXISTS`
- `NOTIFICATION_NOT_FOUND`

## 7. Known Contract Truths and Caveats

- Public product detail is currently documented as `GET /products/{id}`, not slug lookup
- UI docs mention `ACCOUNT_ALREADY_EXISTS`, but current backend docs split this into `EMAIL_ALREADY_EXISTS` and `PHONE_ALREADY_EXISTS`
- UI docs mention `REVIEW_NOT_ELIGIBLE` as `403`, but backend docs define it as `422`
- UI docs mention `relatedEntityType`, but backend docs define `referenceType`
- `POST /orders` accepts `voucherCode`, but voucher discounts are not currently applied to totals
- `POST /reviews` currently returns `200 OK`
- Security-layer failures may be generic rather than the feature-specific codes the UI docs imply

## 8. Client Integration Rules

- Build UI around backend-returned totals and statuses
- Do not compute money truth client-side
- Treat order, payment, and shipment states as server truth
- Use API response wrappers consistently
- Handle pagination, loading, and retries generically
- Prefer explicit `sort` on list endpoints when ordering matters
