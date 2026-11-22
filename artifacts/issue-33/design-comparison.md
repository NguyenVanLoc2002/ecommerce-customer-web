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
- Stitch provides color swatch colors and an editorial/lookbook section. The API exposes variant attribute/value identifiers and labels, product description/media, but no verified swatch colors, editorial content or lookbook relation. The UI renders labeled choices and API description only.
- Stitch has no breadcrumb, reviews, or related-products section in frame 03. The app retains the existing route breadcrumb and API-backed related/review areas; review failure in these captures is the actual local mock authorization error, not a live API test.
- Product labels, image, price and variant fixtures differ from Stitch. We did not modify mock or backend catalog data to mimic the design sample.

## Visual review

The revised purchase panel follows the approved frame's order: brand/product title and price, grouped variant choices, quantity, primary action and expandable product detail. Desktop gallery uses the wide editorial image column and 4:5 media ratio; mobile stacks the gallery before product details and keeps choices in a four-column grid. Remaining differences above are driven by the existing brand, API and route contracts.
