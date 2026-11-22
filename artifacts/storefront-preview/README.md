# Storefront redesign preview

Standalone, static prototype for review. Open `index.html` directly or serve this folder with any static file server. It does not import the app, call APIs, or change application routes. Desktop and mobile layouts are responsive; the nav, search, category filters, product detail, color/size selectors, quantity, bag feedback, and mobile menu are interactive.

## Current flow and supported UI states

- `/` loads categories, featured products, and new arrivals. It renders skeletons while queries load, a retryable error if any home query fails, then category/product sections and newsletter.
- `/products` uses URL search state for keyword, category, brand, price, and pagination, with backend compatible sorting. The page has loading skeletons, retryable error, empty results, populated results, active filter chips, and a mobile filter drawer.
- `/products/:slug` loads by slug; detail has loading skeleton, retryable error, not-found empty state, gallery, color/size/quantity, login-aware add-to-cart, related products, reviews, and a mobile sticky add bar. The first variant is selected by default; size options update with color.
- Purchase flow is PDP -> authenticated cart -> address -> payment -> voucher -> review -> confirmation. Cart and checkout are protected. Cart supports initial/loading, error, empty, stale-item warning, quantity/remove/clear, and summary. Checkout has validation, preview/pending/error/success states and order placement uses an idempotency key.

## Scope gaps to review before Phase 2

This preview uses local fixtures. Backend/Admin support multiple variants and catalog-backed attributes, returned by product detail. Neither public list nor detail returns stock quantities. Ratings, stock, USD prices, price sorting, wishlist, delivery/returns claims and newsletter success here are illustrative. Voucher validation previews discounts; order preview calculates the cart-aware discount and creation atomically redeems vouchers and applies discounts to totals. See [contract readiness](../../docs/planning/phase-2-contract-readiness.md) for evidence and required corrections before Phase 2.

## Route inventory

The router defines public home/catalog/product pages; protected cart, checkout, orders, payment result/provider returns, shipment, invoice, profile, addresses, reviews, and notifications; plus login/register/password recovery and 404. See `src/app/router/router.tsx` and `src/constants/routes.ts` for the full route constants. Phase 2 should retain them.
