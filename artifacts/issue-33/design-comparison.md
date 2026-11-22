# Issue #33: product detail design mapping

## Route and reference frames

| Route | Viewport/state | Approved reference | Implementation source |
|---|---|---|---|
| `/products/:slug` | Product loaded, desktop, 1280 × 2781 CSS px | Stitch project **Fashion Shop Premium Customer Web**, frame `03_Product_Detail_Page` / `Product Detail - Maison Editorial` ([project](https://stitch.withgoogle.com/projects/6681847091792507757), screen `bd9072526f7849a2b6fafc024cfec9dd`) | `pdp-desktop.png`, captured at 1280 × 2781 using local mock catalog |
| `/products/:slug` | Product loaded, mobile, 390 × 2873 CSS px | No mobile frame exists in the approved Stitch project. Reference is the responsive PDP prototype at `artifacts/stitch-review/index.html#/products/ao-blazer-dang-suong` | `pdp-mobile.png`, captured at 390 × 2873 using local mock catalog |
| `/products/:slug` | Loading | No dedicated Stitch frame. Use the frame's product/gallery and purchase hierarchy as the loaded-state target. | Existing detail query skeleton; route and API lookup unchanged |
| `/products/:slug` | Product not found | No dedicated Stitch frame; empty-state pattern is from `artifacts/stitch-review` | Existing not-found empty state and products link |
| `/products/:slug` | Product request error/retry | No dedicated Stitch frame; error-state pattern is from `artifacts/stitch-review` | Existing query error and retry |
| `/products/:slug` | No/partial variant selected | Stitch 03 purchase panel, variant group and choice order; responsive prototype on mobile | Attribute groups and values come only from the product detail response |
| `/products/:slug` | Exact active variant selected | Stitch 03 selected choice treatment; responsive prototype on mobile | Only the exact resolved variant ID is submitted to the cart API |
| `/products/:slug` | Inactive or unavailable combination | Stitch 03 choice treatment and the responsive prototype's unavailable states | Existing inactive/unavailable state; unavailable values not in API are not synthesized |
| `/products/:slug` | Add pending, success, guest, API/stock error | No separate Stitch frame for every state; Stitch review state sheet and responsive prototype are visual references | Existing auth redirect, pending guard, cart mutation, toast and API error handling |
| `/products/:slug` | Media selection/fallback | Stitch 03 gallery; responsive prototype for touch layout | Existing IMAGE media selection and shared-image fallback; video excluded |
| `/products/:slug` | Review loading/empty/error | Not part of the main Stitch 03 PDP frame | Existing review integration remains; API authorization/error is not shown as empty reviews |

## Comparison captures

The desktop design capture is the Stitch 03 HTML at the same 1280 × 2781 CSS viewport. No Stitch mobile frame was found for this project, so the mobile design capture is the named local responsive prototype at the same 390 × 2873 CSS viewport as implementation. Both implementation captures use local mock catalog data and are not live API evidence.

| Desktop, 1280 × 2781 | Mobile, 390 × 2873 |
|---|---|
| Design: [Stitch 03](pdp-design-desktop.png)<br>Implementation: [Customer Web](pdp-desktop.png) | Design: [responsive prototype](pdp-design-mobile.png)<br>Implementation: [Customer Web](pdp-mobile.png) |

## Intentional differences from Stitch 03

- The approved frame uses Aura branding, serif typography, EUR and editorial product copy. The application keeps Fashion Shop branding, Be Vietnam Pro, VND and API-backed catalog fields per repository design/API contracts.
- Stitch presents one size group and adds `Size Guide` and `Find in Store` actions. The customer API can return multiple catalog-backed attribute groups, and there is no size-guide route or store availability endpoint, so these controls are not fabricated.
- Stitch provides color swatch colors and editorial copy/media. The API exposes variant attribute/value identifiers and labels, product short/long descriptions and product media, but no verified swatch colors or editorial content relation. The page now uses the API-backed short description, long description and product media in the same editorial two-column composition; the title and copy therefore remain product data rather than Stitch's sample story.
- Stitch has no breadcrumb, quantity, reviews, or related-products section in frame 03. The app retains the required semantic breadcrumb, existing quantity control, and API-backed related/review areas. Related products use the reference's staggered 4-column desktop / 2-column mobile image-led layout and hover reveal, but links navigate to the existing PDP route instead of adding to cart. Review failure in these captures is the actual local mock authorization error, not a live API test.
- Product labels, image, price and variant fixtures differ from Stitch. We did not modify mock or backend catalog data to mimic the design sample.
- The approved frame uses Aura's serif display face; the reviewed app brief requires Be Vietnam Pro throughout. The implementation keeps Be Vietnam Pro and matches the source hierarchy through size, weight, tracking and spacing.

## Visual review

The PDP follows Stitch 03's desktop sequence: compact breadcrumb then image-led gallery and sticky purchase panel, expandable product details, full-width editorial story block, then image-led related products. Gallery hover zoom, inactive-thumbnail dimming, main-image fade, CTA hover scale, desktop story reveal and staggered related-card reveal are implemented with reduced-motion handling. Desktop keeps vertical thumbnails beside the 4:5 hero. Mobile follows the local responsive prototype: the gallery stacks before product data, the short description stays under price, choices use a four-column grid, and the desktop-only story block is omitted. Remaining differences above follow the existing brand, user-approved typeface, API and route contracts.
