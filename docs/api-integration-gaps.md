# API Integration Gaps

Frontend API integration currently follows `API.md`, with the following explicit gaps or adapter notes:

## 1. Product Detail Route Uses `slug`, API Uses `id`

- UI route: `/products/:slug`
- API contract: `GET /products/{id}`
- Current adapter:
  - scan `GET /products` pages until the matching `slug` is found
  - call `GET /products/{id}` with the resolved UUID
- Constraint:
  - the frontend does **not** call `/products/{slug}`

## 2. Refresh Token Bootstrap Needs Two Calls

- API contract: `POST /auth/refresh-token` returns tokens only
- Frontend session bootstrap also needs the current customer profile
- Current adapter:
  - call `POST /auth/refresh-token`
  - call `GET /me` with the returned access token
  - merge both responses into the frontend session model

## 3. Product Sort Is Limited To Backend-Compatible Fields

- Customer product list/search now maps storefront sort options only to backend-compatible fields:
  - `featured,desc`
  - `createdAt,desc`
  - `updatedAt,desc`
  - `name,asc`
- Unsupported storefront-only sorts such as price or rating must not be sent to the customer API.

## 4. Cart / Order / Review UI Needs Product Enrichment

- Several customer-facing screens need product display fields such as:
  - slug-backed product links
  - brand name
  - media for thumbnails
  - variant color/size display
- Those fields are not fully available in every protected DTO documented in `API.md`
- Current adapter:
  - enrich protected DTOs with public product lookups using documented product endpoints only

## 5. Review -> Order Backlink Is Derived

- `GET /reviews/my` documents review DTO fields but does not document `orderId`
- The profile review UI needs an order detail link
- Current adapter:
  - load customer orders
  - map `orderItemId` back to its parent order
- Risk:
  - if the backend later exposes `orderId` directly on review responses, this adapter should be simplified

## 6. Product FULLTEXT Search Is Backend-Owned

- Customer FE still sends `keyword`; it must not send or expose `searchText` / `search_text`.
- The frontend trims outer whitespace only and does not normalize Vietnamese accents.
- Backend FULLTEXT relevance owns product result membership and ordering whenever `keyword` is present.
