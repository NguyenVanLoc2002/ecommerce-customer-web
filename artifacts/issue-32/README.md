# Issue #32 visual review

The approved Stitch screens are the visual source of truth. Captures below use the local responsive review prototype in `artifacts/stitch-review/index.html`, with its review toolbar hidden, at the Stitch CSS viewport sizes and DPR 2. Implementation captures use the same CSS viewports and DPR 2. Official Stitch frames are linked for direct reference.

| Route and state | Stitch reference | Design capture | Implementation capture |
| --- | --- | --- | --- |
| `/` desktop, loaded | Home Desktop Corrected, 1280 × 3195 CSS px ([Stitch project](https://stitch.withgoogle.com/projects/15029798778414010901), screen `e474bffa04a449cdbf2bc683661a01d0`) | `screenshots/design-home-desktop.jpg` | `screenshots/home-desktop.jpg` |
| `/` mobile, loaded | Home Mobile, 390 × 3955 CSS px ([Stitch project](https://stitch.withgoogle.com/projects/15029798778414010901), screen `d2e776bf0d584c94b0fa52c21419ac04`) | `screenshots/design-home-mobile.jpg` | `screenshots/home-mobile.jpg` |
| `/products` desktop, default/success | Products Desktop, 1280 × 2478 CSS px ([Stitch project](https://stitch.withgoogle.com/projects/15029798778414010901), screen `9bc171d8a40d45d2976fc395170bf395`) | `screenshots/design-products-desktop.jpg` | `screenshots/products-desktop.jpg` |
| `/products` mobile, default/success | Products Mobile, 390 × 3725 CSS px ([Stitch project](https://stitch.withgoogle.com/projects/15029798778414010901), screen `5a0e895135684792be768aac0a35c9d7`) | `screenshots/design-products-mobile.jpg` | `screenshots/products-mobile.jpg` |
| `/products` mobile, filter drawer open | No separate Stitch frame; interaction/state reference is the responsive prototype in `artifacts/stitch-review/index.html` (390 CSS px). | `screenshots/design-products-mobile-filter-open.jpg` | `screenshots/products-mobile-filter-open.jpg` |

## State coverage

| Route/state | Visual reference |
| --- | --- |
| `/` category loading, retryable error, empty | Home Desktop Corrected and Home Mobile frames establish the section geometry; prototype state selector shows loading/empty/error presentation. |
| `/` featured/new-arrival loading, retryable error, empty | Same Home frames; prototype state selector supplies the state treatment. |
| `/` loaded sections | Home Desktop Corrected and Home Mobile. |
| `/products` default loaded list | Products Desktop and Products Mobile. |
| `/products` keyword, category/brand/price filters, active chips, sort and pagination | Products Desktop and Products Mobile; prototype interactions/state selector show filtered variants. |
| `/products` loading, retryable error and empty | Products Desktop and Products Mobile establish list geometry; prototype state selector shows the state treatment. |
| `/products` mobile filter drawer | No dedicated Stitch frame; responsive review prototype at 390 CSS px, shown in the paired captures above. |

The Stitch frames focus on normal loaded pages; operational states use the review prototype as their visual reference. App state remains driven by existing hooks/services; no API or backend state was added.

## Visible differences and reasons

- Fixture content differs from Stitch's illustrative Maison Aure catalog. The implementation renders names, categories, images and prices from the existing catalog API/mock fixture; it does not replace those records to imitate the artwork. The fixture currently contains English category/product names and some unrelated photography, including shoe imagery.
- The approved home prototype includes an editorial styling block and review-only navigation/footer copy. They are omitted from the production page because they are outside this issue's API-backed home scope and make unsupported editorial claims. The supported category, featured and new-arrival sections remain.
- The home page is taller than the Stitch normal frame because this issue includes a separate API-backed new-arrivals section where the design shows an illustrative editorial block. On mobile, the production footer also contains existing account/shop navigation absent from the review prototype.
- The product listing may be taller than the illustrative frame because it renders the complete current page returned by the catalog service/mock fixture. It does not cut results to reproduce a screenshot's sample count.
- Stitch's hero photo and copy are illustrative. The implementation uses the approved local hero photo and keeps the concise approved heading and CTA; copy avoids unsupported material/sustainability claims.
- API-backed category/brand options may be unavailable independently of products. Their failure state is surfaced with retry while product results retain their own loading/error/empty state.

## Verification notes

Screenshots are local browser captures of the app in explicit mock-data mode, not live API evidence. The mobile filter drawer and trimmed `q` flow were exercised in the browser smoke check. Real API integration and production data rendering were not verified.
