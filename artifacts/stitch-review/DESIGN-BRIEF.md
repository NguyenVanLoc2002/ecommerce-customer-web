# Archived direction (superseded)

**Superseded on 2026-11-22 by [DESIGN-BRIEF-v2.md](./DESIGN-BRIEF-v2.md). Do not use the fonts or authentication status below for the current review.**

# Fashion Shop: design review before Phase 2

Status: preparing design artifacts; application implementation has not started. The user requested a Figma/Stitch review gate after authorizing Phase 2. Existing permission to fix the documented Customer Web integration gaps remains valid after design approval. Backend/API changes remain out of scope.

## Context

Product register: product. Discovery surfaces use editorial composition; checkout and account surfaces prioritize completing a task. Customers browse fashion on mobile during the day and compare products on desktop. Warm light surfaces, high-contrast ink and restrained olive accents support photographs without reducing legibility.

Reference: the local FORME editorial prototype. Keep Fashion Shop as the existing application identity; FORME is a visual concept, not an approved company rename.

Typography: Playfair Display for editorial headings; DM Sans for body and controls. Body 16px, controls at least 14px, metadata 12px. Palette: warm paper, charcoal ink, olive accent, quiet dividers. No decorative glass, gradients, oversized rounded cards or promotional clutter.

## First review set

1. Home desktop: split editorial hero, actual category links, selected products, quiet footer. No newsletter, unsupported wishlist or unverified delivery promise.
2. Products desktop: breadcrumb/title, category/brand/price controls, compatible sorting, active filters, image-led product grid and pagination. Keyword results retain server relevance.
3. Product detail desktop: large gallery, exact variant selection, price/SKU, quantity, login-aware cart CTA, product description and authenticated review state.
4. Home mobile: compact navigation, stacked hero, two-column discovery and product grids.
5. Products mobile: search, filter drawer entry, sort, active filters, two-column grid.
6. Product detail mobile: gallery followed by purchase controls and sticky CTA. No exact stock counts: public detail has no inventory quantity.
7. State sheet: loading, failed request/retry, no results/reset, inactive/unavailable variant, add pending/success/error and guest review state.

## Contract constraints

- Product sample fields follow existing product/variant/media DTOs. Prices shown in VND, fixtures clearly labelled in review notes.
- Variant identity is its UUID plus catalog-backed attribute/value IDs; never a fabricated color/size combination. Generic attributes can extend beyond COLOR and SIZE.
- API list lacks variant matrix and inventory; detail supplies variants but not inventory. Unknown stock must not be shown as zero or a fabricated quantity.
- No price/rating sorts unless the API supports them. Use featured, newest, updated, name options only.
- Gallery supports IMAGE media and selected-variant association with product fallback; no image rendering of VIDEO.
- Reviews currently require authentication. A guest prompt is not an empty-review claim.
- Cart/checkout confirmation requires server success; design previews use local fixtures and do not place orders.
- Future checkout screens retain address/payment/voucher/review steps, cart-aware preview, server totals, VND and existing idempotency/provider behavior.

## Stitch handoff

Create a dedicated review project rather than changing historical project 5987634216294262342. Generate the desktop home first, reuse its design system for all other screens, then review and arrange desktop/mobile pairs on the canvas.

Stitch MCP get_project returned missing authentication credentials on 2026-11-22. No new Stitch project or screen has been created yet. Reconnect before upload/generation. Local SVG frames can be imported into Figma as an alternative; labels and shapes remain vector objects, photos are embedded raster assets.
