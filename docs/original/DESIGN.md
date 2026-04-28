# DESIGN.md

## 1. Purpose

This file is the consolidated design source of truth for the `Fashion Shop` customer web app. It combines the repo's design markdown set with the current Stitch project `5987634216294262342` so implementation can align to a single visual and UX reference.

## 2. Visual Direction

Core visual direction:

- Modern editorial commerce, not a generic template storefront.
- Premium but restrained.
- Product imagery leads; chrome stays quiet.
- Visual richness is strongest on discovery surfaces and tapers down in conversion flows.
- Typography should feel magazine-like through serif display headings plus clean sans UI text.
- Motion should signal quality and continuity, never hesitation.

Primary visual keywords:

- editorial
- premium
- clean
- curated
- trustworthy
- conversion-focused

Avoid:

- cluttered promo-heavy layouts
- random color blocking
- inconsistent card styles
- novelty effects that hurt readability or speed

## 3. Stitch Project Audit

Project:

- Stitch project id: `5987634216294262342`
- Title: `Fashion Shop Premium Customer Web`
- Device type: `DESKTOP`

Stitch design system summary:

- Design tone: modern editorial, high-fashion, conversion-aware
- Heading font: `Playfair Display`
- Body font: `DM Sans`
- Primary action family: muted editorial indigo rather than bright consumer blue
- Page padding: `clamp(16px, 5vw, 48px)`
- Section gap: `80px`
- Card radius direction: soft modern, around `16px` for cards and `10px` for buttons

Important alignment note:

- Repo docs remain canonical for implementation tokens and architecture.
- Stitch is highly aligned in typography, spacing philosophy, card softness, and editorial tone.
- Stitch color values are slightly warmer and softer than the repo token docs. Treat them as visual reference, not a replacement for token governance.

## 4. Screen Inventory

Routeable Stitch screens found: `20`

1. `01_Home_Page` / `Home Page - Maison Editorial (Final Refinement)`
2. `02_Product_List_Page` / `Product List - Maison Editorial`
3. `03_Product_Detail_Page` / `Product Detail - Maison Editorial`
4. `04_Cart_Page` / `Cart - Maison Editorial`
5. `05_Checkout_Address_Page` / `Checkout Address - Maison Editorial`
6. `06_Checkout_Payment_Page` / `Checkout Payment - Maison Editorial`
7. `07_Checkout_Voucher_Page` / `Checkout Voucher Page`
8. `08_Checkout_Review_Page` / `Checkout Review - Maison Editorial`
9. `09_Payment_Result_Page` / `Payment Result Page`
10. `10_Order_List_Page` / `Order List - Maison Editorial`
11. `11_Order_Detail_Page` / `Order Detail - Maison Editorial`
12. `12_Order_Confirmation` / `Order Confirmation - Maison Editorial`
13. `13_Login_Page` / `Login - Maison Editorial`
14. `14_Register_Page` / `Register - Maison Editorial`
15. `15_Profile_Page` / `Profile - Maison Editorial`
16. `16_Address_Book_Page` / `Address Book - Maison Editorial`
17. `17_Notifications_Page` / `Notifications - Maison Editorial`
18. `18_Shipment_Tracking_Page` / `Shipment Tracking - Maison Editorial`
19. `19_Invoice_Page` / `Invoice Page`
20. `20_Write_Review_Page` / `Write Review Page`

Non-route Stitch artifacts found:

- `Aura Editorial E-commerce Flow`
- `Fashion Shop User Flow Documentation`

## 5. Missing Screens

Missing relative to repo route and delivery docs:

- `MyReviewsPage` for `/profile/reviews`
- `AddressFormPage` for `/profile/addresses/new`
- `AddressFormPage` edit state for `/profile/addresses/:id/edit`
- `NotFoundPage` / 404 fallback

Likely component-level design gaps not represented as dedicated screens:

- filter drawer mobile state
- mobile nav drawer
- confirm dialog
- modal and drawer base patterns
- empty states
- error states
- skeleton states

## 6. Screen-to-Route Mapping

Canonical mapping:

| Stitch Screen | Route |
|---|---|
| Home Page | `/` |
| Product List | `/products` |
| Product Detail | `/products/:slug` |
| Cart | `/cart` |
| Checkout Address | `/checkout/address` |
| Checkout Payment | `/checkout/payment` |
| Checkout Voucher | `/checkout/voucher` |
| Checkout Review | `/checkout/review` |
| Order Confirmation | `/checkout/confirmation` |
| Payment Result | `/payment/result` |
| Order List | `/orders` |
| Order Detail | `/orders/:orderId` |
| Shipment Tracking | `/orders/:orderId/tracking` |
| Invoice Page | `/orders/:orderId/invoice` |
| Write Review Page | `/orders/:orderId/review` |
| Login | `/login` |
| Register | `/register` |
| Profile | `/profile` |
| Address Book | `/profile/addresses` |
| Notifications | `/notifications` |

Missing from Stitch but required by docs:

| Required Page | Route |
|---|---|
| My Reviews | `/profile/reviews` |
| Address Form New | `/profile/addresses/new` |
| Address Form Edit | `/profile/addresses/:id/edit` |
| Not Found | `*` |

## 7. Color Tokens

Implementation-canonical token direction from repo docs:

- Brand primary: `#4F46E5`
- Brand hover: `#4338CA`
- Brand active: `#3730A3`
- Brand subtle: `#EEF2FF`
- Canvas: `#F9FAFB`
- Surface: `#FFFFFF`
- Border: `#E5E7EB`
- Text primary: `#111827`
- Text secondary: `#6B7280`
- Sale / urgency: `#E11D48`
- Promo dark: `#1E1B4B`

Stitch palette reference:

- Primary: `#4f378a`
- Primary container: `#6750a4`
- Background / surface family: `#fdf7ff`, `#f8f2fa`, `#f2ecf4`
- Outline: `#7a7582`
- Error: `#ba1a1a`
- Tertiary commerce accent: `#765b00`

Recommended resolution:

- Implement repo token system as canonical.
- Allow selective visual softening from Stitch for large surfaces and elevated cards if the final token pass chooses to move closer to the Stitch board.
- Preserve sale as a distinct red and keep promo/dark zones visually grounded.

## 8. Typography

Shared direction across docs and Stitch:

- Display and editorial headings: `Playfair Display`
- Body and UI text: `DM Sans`

Repo implementation scale:

- Display: `56px`
- Heading 1: `36px`
- Heading 2: `24px`
- Heading 3: `18px`
- Body large: `16px`
- Body: `14px`
- Label: `12px`
- Price: `20px`

Stitch reference scale:

- `display-xl`: `64px / 700 / 1.1`
- `display-lg`: `48px / 600 / 1.2`
- `heading-md`: `32px / 600 / 1.3`
- `heading-sm`: `24px / 500 / 1.4`
- `body-lg`: `18px / 400 / 1.6`
- `body-md`: `16px / 400 / 1.6`
- `body-sm`: `14px / 400 / 1.5`
- `label-uppercase`: `12px / 700 / 0.1em`
- `button`: `16px / 600`

Typography rules:

- Hero owns the single `h1` on homepage.
- Serif is reserved for editorial moments and product naming emphasis.
- UI controls, metadata, and helper text stay sans.
- Price must remain visually dominant and immediately scannable.

## 9. Spacing

Canonical spacing:

- Base unit: `4px`
- Page padding: `clamp(16px, 5vw, 48px)`
- Section gap: `80px` desktop, with room to expand toward `96px`
- Card padding: `16px` mobile, `24px` desktop
- Grid gap: `16px` mobile, `24px` desktop

Stitch spacing references:

- `stack_xs`: `4px`
- `stack_sm`: `8px`
- `stack_md`: `16px`
- `stack_lg`: `24px`
- `stack_xl`: `40px`

## 10. Radius

Canonical radius tokens:

- `4px` for small chips
- `8px` for inputs and small controls
- `10px` for buttons
- `16px` for standard cards
- `24px` for large feature surfaces
- `9999px` for pill and avatar shapes

## 11. Shadows

Canonical shadows:

- subtle: `0 1px 3px rgba(0,0,0,0.06)`
- card: `0 4px 24px rgba(0,0,0,0.06)`
- card hover: `0 12px 40px rgba(0,0,0,0.12)`
- modal: `0 20px 60px rgba(0,0,0,0.16)`
- sticky: `0 2px 16px rgba(0,0,0,0.08)`

Stitch mood direction:

- tonal layering, not dramatic depth
- ambient card lift
- slightly stronger sticky separation

## 12. Layout Rules

Global layout:

- Desktop content max width: `1280px` in repo docs, `1440px` as an upper visual reference in Stitch editorial framing
- Centered container
- Generous whitespace
- Mobile-first responsive scaling

Page-specific layout rules:

- Home: full-width hero, sectional storytelling rhythm
- PLP: sidebar filters on desktop, drawer filters on mobile
- PDP: 2-column desktop with sticky purchase block, stacked mobile
- Cart: content plus sticky summary desktop, stacked mobile
- Checkout: distraction-free shell with persistent order summary
- Account surfaces: side navigation desktop, compact top navigation mobile

## 13. Component Inventory

Foundation and shared patterns expected:

- `Button`
- `Input`
- `Textarea`
- `Select`
- `Badge`
- `Avatar`
- `Divider`
- `Toast`
- `Modal`
- `Drawer`
- `ConfirmDialog`
- `Dropdown`
- `Tabs`
- `Pagination`
- `Card`
- `Skeleton`
- `EmptyState`
- `ErrorCard`

Commerce and layout patterns expected:

- `Header`
- `Footer`
- `HeroSection`
- `SectionHeader`
- `CategoryGrid`
- `ProductCard`
- `ProductGrid`
- `FilterPanel`
- `SortDropdown`
- `ActiveFilterChips`
- `ProductMediaGallery`
- `PurchaseBlock`
- `VariantSelector`
- `QuantitySelector`
- `StickyCartBar`
- `CartItemCard`
- `CartSummary`
- `CheckoutStepper`
- `OrderSummaryPanel`
- `OrderStatusStepper`
- `ShipmentProgressBar`
- `ShipmentTimeline`
- `StarRatingInput`
- `StarRatingDisplay`
- `BreadcrumbNav`
- `PageSEO`
- `JsonLd`

## 14. Page Blueprints

Homepage:

- Hero with visible editorial `h1`, primary CTA, and real image
- Category discovery section
- Featured products
- Promo band
- New arrivals
- Trust section
- Newsletter section

PLP:

- breadcrumb
- `h1`
- category description
- filter panel or drawer
- sort
- active chips
- product grid
- empty state or load-more behavior

PDP:

- breadcrumb
- media gallery
- sticky purchase block
- product detail section
- reviews section
- related products
- mobile sticky add-to-cart bar

Cart:

- `h1`
- item list
- summary panel
- empty state

Checkout:

- minimal header
- stepper
- form/content area
- persistent summary
- no decorative motion on inputs

Account:

- account navigation
- content `h1`
- task-focused secondary surfaces

## 15. Motion System

Motion tone:

- smooth
- premium
- restrained
- fast enough for commerce

Approved motion:

- page fade and slight translate
- hero stagger sequence
- card hover lift
- product grid stagger reveal
- modal and drawer enter/exit
- sticky bar transitions
- cart row exit animation

Rules:

- respect `prefers-reduced-motion`
- animate `transform` and `opacity`
- avoid motion on checkout-critical fields
- avoid competing simultaneous section reveals

Shared durations:

- hover: `100-150ms`
- card hover: `200-250ms`
- drawer: `280-320ms`
- modal: `180-220ms`
- page transition: `350-450ms`
- hero reveal: `500-600ms`

## 16. 3D Usage Rules

3D is optional and must remain a premium accent only.

Allowed zones:

- homepage hero
- featured campaign section
- premium storytelling block
- brand/about storytelling

Forbidden zones:

- login
- register
- cart
- checkout
- profile and account management
- errors, empty states, loaders

3D constraints:

- lazy-loaded only
- static fallback required
- fallback stays the LCP source
- headings and CTAs must stay in HTML
- no game-like motion or heavy particle systems

## 17. SEO Rules

Visual design must support SEO, not fight it.

- one visible `h1` per page
- correct heading hierarchy
- crawlable product links
- real image tags for key visuals
- canonical URLs
- JSON-LD on homepage, PLP, PDP, and other specified public pages
- `noindex` on auth, cart, checkout, account, orders, and payment pages

## 18. API-Aware Design Notes

Design decisions affected by API behavior:

- Product detail route is slug-based in UX docs, but backend docs currently mark slug lookup as missing. PDP design should keep slug routing, but implementation must confirm backend support or add a resolver strategy.
- Register conflict handling should visually support separate email and phone conflicts.
- Review submission error handling should support ineligible, duplicate, and moderation states.
- Notification UI should be designed around a generic entity reference model because docs disagree on `relatedEntityType` versus `referenceType`.
- Cart, checkout, and order detail surfaces must support server-driven totals only. Do not design flows that require client-side recomputation of financial truth.
- Payment result, voucher validation, stock reservation, and session-expiry states require dedicated banners, disabled CTAs, and retry paths.
- Business codes such as order, shipment, invoice, and SKU should always render in monospace with click-to-copy affordances.

## 19. Implementation Priority

Recommended order for design implementation:

1. Tokens, typography, layout shell, and shared primitives
2. Header, footer, SEO wrapper, toasts, modal, drawer, confirm dialog
3. Auth screens and protected-route shell
4. Homepage and PLP/PDP discovery surfaces
5. Cart and checkout system
6. Orders, payment result, shipment tracking
7. Profile, address book, invoice, write review, notifications
8. Missing screens: My Reviews, Address Form, Not Found
9. Motion polish, SEO completeness, accessibility pass, optional 3D accents

## 20. Design Gaps and Recommendations

Current gaps:

- Stitch does not include `MyReviewsPage`.
- Stitch does not include `AddressFormPage` create/edit.
- Stitch does not include a 404 page.
- Stitch has flow/documentation artifacts, but not every component state surface needed for implementation.
- Repo docs and Stitch are slightly misaligned on exact indigo/canvas color values.
- Repo docs and API docs still contain a few contract mismatches that affect UI copy and state handling.

Recommendations:

- Treat repo markdown as the canonical implementation contract and Stitch as the current visual benchmark.
- Add explicit Stitch screens for My Reviews, Address Form, and 404 before full UI implementation starts.
- Normalize token values once before coding begins so component authors are not choosing between two indigo systems.
- Keep the editorial aesthetic strongest on Home, PLP, and PDP. Let Cart, Checkout, Orders, and Profile become calmer and more utilitarian.
- Build empty, error, loading, and mobile drawer states as first-class design artifacts rather than leaving them implicit.
