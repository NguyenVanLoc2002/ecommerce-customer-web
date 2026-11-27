# Issue #33 · Catalog presentation review

The live screenshots use the three PR worktrees and an isolated Backend on port 8082. The catalog, accounts and addresses are synthetic. Chromium used 1280 × 900 and 390 × 844. The PLP capture filters to one known SKU so the assigned badge can be checked on its card.

| Screen or state | Desktop | Mobile |
| --- | --- | --- |
| Earlier PDP before, approved Stitch and fixture comparison | [Comparison](followup-compare-pdp-desktop.jpg) | [Comparison](followup-compare-pdp-mobile.jpg) |
| Current PDP with public catalog data | [Screenshot](isolated-storefront-desktop-pdp.png) | [Screenshot](isolated-storefront-mobile-pdp.png) |
| Size Guide | [Screenshot](isolated-storefront-desktop-guide.png) | [Screenshot](isolated-storefront-mobile-guide.png) |
| PLP with the primary assigned badge | [Screenshot](isolated-storefront-desktop-plp.png) | [Screenshot](isolated-storefront-mobile-plp.png) |
| Add to Cart success | [Screenshot](isolated-storefront-desktop-cart-success.png) | [Screenshot](isolated-storefront-mobile-cart-success.png) |
| Server inventory rejection | [Screenshot](isolated-storefront-desktop-stock-error.png) | [Screenshot](isolated-storefront-mobile-stock-error.png) |
| Admin Size Guide edit and assignment | [Screenshot](isolated-admin-desktop-size-guide.png) | [Screenshot](isolated-admin-mobile-size-guide.png) |
| Admin Badge edit and assignment | [Screenshot](isolated-admin-desktop-badge.png) | [Screenshot](isolated-admin-mobile-badge.png) |

The approved PDP frames are 05 and 06 in Stitch. Product imagery, text, number of options and number of thumbnails follow the current catalog. The guide dialog and Admin views use the existing UI patterns. [Approved Stitch project](https://stitch.withgoogle.com/projects/15029798778414010901)

The live run confirmed the Admin endpoints and optional public fields, Customer authorization rejection, Size Guide assignment and replacement, active badge ranking, PLP and PDP rendering, variant selection, stock rejection, Add to Cart, and server-priced COD preview. Test assignments were removed at the end of the run. [Live test summary](isolated-e2e.json)

Facets, performance work, production VAT messaging, the shipping policy draft and checkout ETA are outside these PRs. [Customer #33](https://github.com/NguyenVanLoc2002/ecommerce-customer-web/issues/33)
