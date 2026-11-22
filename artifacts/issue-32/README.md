# Issue #32 visual review

The primary Home reference is the original approved Stitch implementation preserved at `artifacts/stitch-review/stitch-home-original.html`. The product-list references are the approved Stitch frames. Design and app captures use 1280 CSS px desktop and 390 CSS px mobile viewports at DPR 2.

## Route and state crosswalk

| Route and state | Design reference | Implementation capture |
| --- | --- | --- |
| `/` desktop, loaded | Original Home reference, 1280 CSS px. Hero, categories, featured products and creative perspective. | `screenshots/home-desktop.jpg` |
| `/` mobile, loaded | Approved responsive Home frame `d2e776bf0d584c94b0fa52c21419ac04`, 390 CSS px. | `screenshots/home-mobile.jpg` |
| `/` categories loading, error/retry, empty | Original Home section geometry; status treatments follow the existing query state. | Covered by the Home query branches in `HomePage`; no separate runtime-state capture. |
| `/` featured products loading, error/retry, empty | Original Home section geometry; status treatments follow the existing query state. | Covered by the featured query branches in `HomePage`; no separate runtime-state capture. |
| `/` new arrivals loading, error/retry, empty | Original Home has no separate arrivals section. This issue retains the API-backed arrivals section from its acceptance scope. | Covered by the arrivals query branches in `HomePage`; shown after the creative perspective section. |
| `/products` desktop, category `womenswear`, loaded | Products Desktop `9bc171d8a40d45d2976fc395170bf395`, 1280 CSS px. The frame shows selected category and illustrative catalog data. | `screenshots/products-desktop.jpg` |
| `/products` mobile, category `womenswear`, loaded | Products Mobile `5a0e895135684792be768aac0a35c9d7`, 390 CSS px. | `screenshots/products-mobile.jpg` |
| `/products` loading, error/retry, empty | Products frames and the state examples included below the main Stitch page. Examples establish state treatment; the app renders only the current state. | Product query branches in `ProductListPage`; exercised states are not separately captured here. |
| `/products` keyword, category/brand/price chips, sort and pagination | Products desktop/mobile frames establish geometry; query semantics remain the existing URL/API contract. | Browser smoke verifies trimmed `q`; other controls use existing hooks and URL parameters. |
| `/products` mobile filter drawer open | No separate production Stitch frame. Responsive interaction reference: `artifacts/stitch-review/index.html` at 390 CSS px. | `screenshots/products-mobile-filter-open.jpg` |

## Visual alignment and remaining differences

- Home now follows the original reference's 8/4 desktop hero split, restrained right-hand copy area, approved hero image, 3:4 category imagery, compact section headings, four-column featured grid, and the “Góc nhìn sáng tạo” editorial section with its approved image.
- The new-arrivals section remains because it is explicitly in Issue #32 scope and is backed by the existing API. It follows the creative section; the original Home reference has no separate arrivals section. This is the main remaining Home page-height and section-order difference.
- The existing app header/footer retain the Fashion Shop identity and production navigation. The illustration uses Maison Aure branding and editorial footer copy; those values do not replace the app's existing identity or routes.
- Category/product names, images, prices and result counts come from the active catalog response or explicit local mock fixture. They may differ from Stitch's illustrative Maison Aure content; the UI does not replace API data to imitate the sample. The selected category can also yield fewer products than the design fixture.
- Stitch's PLP frames include design-review specimens for loading, empty and error states below the catalog. The app renders those states when the corresponding API query enters them instead of showing all specimens together.
- The creative section uses a static approved reference image and presentation copy because no editorial CMS endpoint exists. Its CTA routes to the existing product list instead of inventing a category slug or campaign route.

## Verification

- Screenshots are local browser captures using explicit mock-data mode; live API rendering and production catalog imagery were not verified.
- `node artifacts/issue-32/visual-smoke.mjs` checks the Home editorial section, one `h1` per route, no horizontal overflow at 1280/390 CSS px, trimmed keyword in `q`, and the mobile filter drawer.
- See the PR for lint, typecheck, build, test, and live API verification results.
