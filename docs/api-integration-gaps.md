# API Integration Gaps

Frontend API integration currently follows `API.md`, with the following explicit gaps or adapter notes:

Rechecked 2026-11-22 against Backend source and Backend/Admin docs. See [Phase 2 contract readiness](planning/phase-2-contract-readiness.md) for current integration gaps, source evidence and upstream contradictions.

## 1. Product Detail Has a Direct Slug Lookup

- UI route: `/products/:slug`
- API contract: `GET /products/slug/{slug}`; ID lookup remains available separately.
- `catalogLookupService.getProductDetailBySlug` uses the direct endpoint. Do not restore the obsolete paginated catalog scan or call `/products/{slug}`.

## 2. Refresh Token Bootstrap Needs Two Calls

- API contract: `POST /auth/refresh-token` returns tokens only
- Login/register instead return `data.user` and nested `data.tokens`; do not confuse these two response shapes.
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

## 4. Cart / Order / Review Responses Carry Product Context

- Several customer-facing screens need product display fields such as:
  - slug-backed product links
  - brand name
  - media for thumbnails
  - variant color/size display
- Current response contracts include product context, including slug, brand and image; `apiMappers.ts` maps these directly.
- Preserve response snapshots and missing-image fallbacks. Do not reintroduce per-item catalog lookups merely to render these fields.

## 5. Review -> Order Backlink Is Returned Directly

- Current review DTO includes `orderId`; `apiMappers.ts` uses it directly.
- Do not scan order history to reconstruct this relationship. Preserve an unavailable-link state if legacy data lacks the ID.

## 6. Product FULLTEXT Search Is Backend-Owned

- Customer FE still sends `keyword`; it must not send or expose `searchText` / `search_text`.
- The frontend trims outer whitespace only and does not normalize Vietnamese accents.
- Backend FULLTEXT relevance owns product result membership and ordering whenever `keyword` is present.

## 7. Product Reviews Currently Require Authentication

- `GET /reviews/product/{productId}` is described as public in older Backend docs, but current `SecurityConfig` does not whitelist it.
- Do not turn a guest 401 into an empty-review claim or silently change auth behavior during styling work. Agree the access-state design or backend correction before Phase 2.

## 8. Void Data and Configuration-Gated CSRF

- Success responses for void operations may omit `data` because the wrapper excludes null JSON properties.
- CSRF double-submit is implemented and gated by backend configuration, protecting refresh/logout. Verify cookie bootstrap and matching header in the target environment; the older claim that this is only future work is obsolete.
