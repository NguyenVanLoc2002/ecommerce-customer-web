# API.md

Single source of truth for customer frontend API integration.

Generated from:
- `docs/original/api-common.md`
- `docs/original/customer-api-contract.md`

Applies only to customer/public API usage. Do not use `/api/v1/admin/**` from the customer web app.

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
- Login/register return:
  - `user`
  - `accessToken`
  - `tokenType`
  - `expiresIn`
- Refresh returns token data only:
  - `accessToken`
  - `tokenType`
  - `expiresIn`
- `POST /auth/register`, `POST /auth/login`, `POST /auth/refresh-token`, and `POST /auth/logout` must be called with `withCredentials: true`
- `POST /auth/password/forgot`, `POST /auth/password/forgot/verify`, and `POST /auth/password/reset` should also keep `withCredentials: true` so cookie-backed security stays compatible
- Current CSRF note:
  - backend docs still treat double-submit CSRF as optional / future-facing
  - when an `XSRF-TOKEN` cookie is present, the frontend should echo it as `X-XSRF-TOKEN`
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
- `data` may be an object, list, paged payload, or `null`
- most delete/mark-all endpoints still return HTTP `200` with `data: null`

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

### `POST /account/password/change`
- Access: authenticated
- Request:
  - `currentPassword`
  - `newPassword`
  - `confirmPassword`
- Response: `ApiResponse<Void>`
- Frontend behavior:
  - send Bearer access token
  - on success, clear auth state and redirect the user to sign in again because the backend revokes refresh sessions

## 7. Profile Endpoints

### `GET /me`
- Access: authenticated
- Response: `ApiResponse<UserProfileResponse>`
- Key fields:
  - `id`, `email`, `firstName`, `lastName`, `phoneNumber`
  - `status`, `roles`
  - `customerId`, `gender`, `birthDate`, `avatarUrl`, `loyaltyPoints`
  - `createdAt`

### `PATCH /me`
- Access: authenticated
- Partial request fields:
  - `firstName`, `lastName`, `phoneNumber`, `gender`, `birthDate`
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
- Important: current backend contract is by product ID, not slug
- Product detail includes:
  - `id`, `name`, `slug`, `shortDescription`, `description`
  - `status`, `featured`
  - `brand`, `categories`, `variants`, `media`
  - `createdAt`, `updatedAt`

Variant fields:
- `id`, `sku`, `barcode`, `variantName`
- `basePrice`, `salePrice`, `compareAtPrice`
- `weightGram`, `status`, `attributes`

Media fields:
- `id`, `mediaUrl`, `mediaType`, `sortOrder`, `primary`, `variantId`

## 12. Cart Endpoints

Cart shape:
- `id`, `items`, `totalItems`, `subTotal`, `updatedAt`

Cart item shape:
- `id`, `variantId`, `variantName`, `sku`
- `productSlug`, `productName`
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

Create order request:
- `shippingAddressId` required
- `paymentMethod` optional
- `customerNote` optional, max `500`
- `voucherCode` optional

Order list item fields:
- `id`, `orderCode`, `status`, `paymentMethod`, `paymentStatus`
- `totalItems`, `totalAmount`, `createdAt`

Order detail fields:
- `id`, `orderCode`, `customerId`
- `status`, `paymentMethod`, `paymentStatus`
- shipping receiver and address snapshot fields
- `subTotal`, `discountAmount`, `shippingFee`, `totalAmount`
- `voucherCode`, `customerNote`
- `items`, `createdAt`

### `POST /orders`
- Access: authenticated
- Status: `201 Created`
- Response: `ApiResponse<OrderResponse>`
- Current behavior:
  - omitted `paymentMethod` defaults to `COD`
  - `COD` starts as `PENDING`
  - `ONLINE` starts as `AWAITING_PAYMENT`
  - stock is reserved during order creation
  - `voucherCode` is stored but not applied to totals in current service logic

### `GET /orders`
- Access: authenticated
- Filters:
  - `status`
- Pagination:
  - `page`, `size`, `sort`
  - controller default `size=20`
- Response: `ApiResponse<PagedResponse<OrderListItemResponse>>`

### `GET /orders/{id}`
- Access: authenticated
- Response: `ApiResponse<OrderResponse>`

### `POST /orders/my/{id}/cancel`
- Access: authenticated
- Response: `ApiResponse<OrderResponse>`
- Current behavior:
  - cancel is only allowed while order can move to `CANCELLED`
  - service explicitly blocks `CONFIRMED`

## 14. Payment Endpoints

Payment shape:
- `id`, `orderId`, `orderCode`, `paymentCode`
- `method`, `status`, `amount`, `paidAt`, `createdAt`
- `transactions`

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
- Response: `ApiResponse<PaymentResponse>`
- Current behavior:
  - order must belong to current customer
  - order payment method must be `ONLINE`
  - existing `PENDING` or `INITIATED` payment returns existing record
  - existing `FAILED` payment is retried
  - terminal processed states are rejected

### `POST /payments/callback`
- Not a customer UI endpoint
- Controller intent: payment gateway callback
- Current source note: it is not whitelisted in `SecurityConfig`, so it currently requires authentication
- Request:
  - `orderCode` required
  - `status` required string
  - `providerTxnId`, `provider`, `payload` optional
- Response: `ApiResponse<PaymentResponse>`
- Current behavior:
  - `status=SUCCESS` marks payment paid
  - any other status is treated as failed
  - duplicate `providerTxnId` is idempotent

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

## 16. Shipment Endpoint

Shipment shape:
- `id`, `orderId`, `orderCode`, `shipmentCode`
- `carrier`, `trackingNumber`, `status`
- `estimatedDeliveryDate`, `deliveredAt`
- `shippingFee`, `note`
- `events`, `createdAt`, `updatedAt`

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

## 18. Review Endpoints

Create review request:
- `orderItemId` required
- `rating` required, `1..5`
- `comment` optional, max `2000`

Review fields:
- `id`
- `customerId`, `customerName`
- `productId`, `productName`
- `variantId`, `variantName`, `sku`
- `orderItemId`
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
- Access: public
- Filters:
  - `minRating`, `maxRating`
  - service forces `productId` from path and `status=APPROVED`
- Pagination:
  - `page`, `size`, `sort`
  - controller default `size=20`
- Response: `ApiResponse<PagedResponse<ReviewResponse>>`

Excluded non-customer review routes:
- `GET /reviews/pending`
- `GET /reviews/{id}`
- `PATCH /reviews/{id}/moderate`
- `DELETE /reviews/{id}`

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
- `data` is `null`

## 20. Error Codes Relevant to Customer Frontend

General:
- `BAD_REQUEST`
- `UNAUTHORIZED`
- `FORBIDDEN`
- `NOT_FOUND`
- `VALIDATION_ERROR`
- `CONFLICT`
- `INTERNAL_SERVER_ERROR`

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
- Do not call `/products/{slug}` unless backend supports it
- Payment callback is not a customer UI endpoint
- Do not use admin endpoints
- Never store `refreshToken`, `resetToken`, OTP values, or passwords in `localStorage` or `sessionStorage`
- Never send `refreshToken` in the customer `POST /auth/refresh-token` body
- Query/path enums are case-insensitive
- JSON enum values are case-insensitive
- Validation failures return HTTP `422`

## Current Risk Notes

- Product detail is documented as `GET /products/{id}`. If the frontend routes by slug, it needs a separate mapping layer or backend support for slug lookup.
- `POST /payments/callback` is described as a gateway callback, but in the current source it is not public because `SecurityConfig` does not whitelist it.
- Voucher validation is preview-only. Current order creation stores `voucherCode` but does not apply discount totals in service logic.
- Review creation requires the parent order to be `COMPLETED`, not merely delivered.
