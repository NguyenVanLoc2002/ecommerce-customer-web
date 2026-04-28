# DESIGN.md

Primary design source of truth for the `Fashion Shop` customer web app.

## 1. Design Source-of-Truth Order

Use this design stack in order:

1. `DESIGN.md`
2. Stitch project `5987634216294262342`
3. `docs/original/design-system.md`
4. `docs/original/design-tokens.md`
5. `docs/original/visual-direction.md`
6. `docs/original/component-patterns.md`
7. `docs/original/page-blueprints.md`
8. `docs/original/motion-guidelines.md`
9. `docs/original/3d-guidelines.md`

## 2. Visual Direction

The experience should feel:

- modern
- editorial
- premium
- trustworthy
- conversion-friendly

Core principles:

- Product imagery leads; interface chrome stays quiet
- Richness is strongest on discovery surfaces and softer on checkout/account surfaces
- Serif display typography gives editorial authority
- Sans UI typography keeps interactions clean and legible
- Motion should imply quality, not friction

Avoid:

- promo clutter
- arbitrary color blocks
- inconsistent card treatments
- gimmicky effects that slow shopping

## 3. Stitch MCP Audit

Project:

- Id: `5987634216294262342`
- Title: `Fashion Shop Premium Customer Web`
- Device focus: `DESKTOP`

Stitch design signals:

- Headings: `Playfair Display`
- Body: `DM Sans`
- Page padding: `clamp(16px, 5vw, 48px)`
- Section gap: `80px`
- Soft-modern radii with editorial spacing
- High-fashion, conversion-aware tone

Alignment note:

- Stitch is strongly aligned with the repo design direction
- Stitch colors are slightly softer and warmer than repo token docs
- Repo token governance remains implementation-canonical

## 4. Screen Inventory

Routeable Stitch screens found: `20`

1. Home Page
2. Product List
3. Product Detail
4. Cart
5. Checkout Address
6. Checkout Payment
7. Checkout Voucher
8. Checkout Review
9. Payment Result
10. Order List
11. Order Detail
12. Order Confirmation
13. Login
14. Register
15. Profile
16. Address Book
17. Notifications
18. Shipment Tracking
19. Invoice
20. Write Review

Non-route Stitch artifacts:

- `Aura Editorial E-commerce Flow`
- `Fashion Shop User Flow Documentation`

## 5. Missing Screens

Required by docs but not found in Stitch:

- `MyReviewsPage` at `/profile/reviews`
- `AddressFormPage` create state at `/profile/addresses/new`
- `AddressFormPage` edit state at `/profile/addresses/:id/edit`
- `NotFoundPage` fallback

Likely component-state design gaps:

- filter drawer mobile state
- mobile nav drawer
- confirm dialog
- empty states
- error states
- skeleton states

## 6. Screen-to-Route Mapping

| Screen | Route |
|---|---|
| Home | `/` |
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
| Invoice | `/orders/:orderId/invoice` |
| Write Review | `/orders/:orderId/review` |
| Login | `/login` |
| Register | `/register` |
| Profile | `/profile` |
| Address Book | `/profile/addresses` |
| Notifications | `/notifications` |

## 7. Color System

Canonical implementation tokens:

- Brand primary: `#4F46E5`
- Brand hover: `#4338CA`
- Brand active: `#3730A3`
- Brand subtle: `#EEF2FF`
- Canvas: `#F9FAFB`
- Surface: `#FFFFFF`
- Border: `#E5E7EB`
- Text primary: `#111827`
- Text secondary: `#6B7280`
- Sale accent: `#E11D48`
- Promo dark: `#1E1B4B`

Semantic state colors:

- Success: green family
- Warning: amber family
- Danger: red family
- Info: blue family

Stitch palette references:

- Primary: `#4f378a`
- Primary container: `#6750a4`
- Surface family: `#fdf7ff`, `#f8f2fa`, `#f2ecf4`
- Outline: `#7a7582`

Resolution:

- Implement repo token values as code truth
- Allow later visual refinement toward Stitch softness if done centrally through tokens

## 8. Typography

Font pairing:

- Display and editorial headings: `Playfair Display`
- Body and UI: `DM Sans`

Core sizes:

- Display: `56px`
- Page title: `36px`
- Section title: `24px`
- Card title: `18px`
- Body large: `16px`
- Body secondary: `14px`
- Label: `12px`
- Price: `20px`

Rules:

- Homepage hero owns the single `h1`
- Serif is for editorial emphasis, not every UI label
- UI text remains highly readable and restrained
- Price must remain visually dominant and instantly scannable

## 9. Spacing, Radius, and Shadows

Spacing:

- Base unit: `4px`
- Page padding: `clamp(16px, 5vw, 48px)`
- Section gap: `80px` desktop
- Card padding: `16px` mobile, `24px` desktop
- Grid gap: `16px` mobile, `24px` desktop

Radius:

- `4px` chips
- `8px` inputs
- `10px` buttons
- `16px` cards
- `24px` large feature surfaces
- full pill radius where needed

Shadows:

- subtle: `0 1px 3px rgba(0,0,0,0.06)`
- card: `0 4px 24px rgba(0,0,0,0.06)`
- card hover: `0 12px 40px rgba(0,0,0,0.12)`
- modal: `0 20px 60px rgba(0,0,0,0.16)`
- sticky: `0 2px 16px rgba(0,0,0,0.08)`

## 10. Layout Rules

Global layout:

- Desktop max width: `1280px`
- Centered container
- Generous whitespace
- Responsive mobile-first scaling

Page layouts:

- Home: full-width hero and editorial sectional rhythm
- PLP: desktop sidebar filters, mobile drawer filters
- PDP: 2-column desktop, stacked mobile, sticky purchase block
- Cart: content plus sticky summary desktop, stacked mobile
- Checkout: distraction-free shell with persistent summary
- Account: sidebar desktop, compact navigation mobile

## 11. Component Inventory

Shared primitives:

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

Commerce patterns:

- `Header`
- `Footer`
- `HeroSection`
- `CategoryGrid`
- `SectionHeader`
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

## 12. Page Blueprints

Homepage:

- hero
- categories
- featured products
- promo banner
- new arrivals
- trust section
- newsletter

PLP:

- breadcrumb
- `h1`
- category description
- filters
- sort
- active chips
- product grid
- empty or load-more states

PDP:

- breadcrumb
- media gallery
- sticky purchase block
- product details
- reviews
- related products
- sticky mobile add-to-cart bar

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

Account:

- account navigation
- task-focused content pane

## 13. Motion System

Motion tone:

- smooth
- premium
- restrained
- fast enough for commerce

Approved motion:

- page fade plus slight translate
- hero stagger sequence
- card hover lift
- product grid stagger reveal
- modal and drawer enter/exit
- sticky bar transitions
- cart row exit animation

Rules:

- always respect `prefers-reduced-motion`
- animate `transform` and `opacity`
- do not animate checkout-critical fields
- avoid competing section reveals in the same viewport

## 14. 3D Usage Rules

Allowed:

- homepage hero
- featured campaign section
- premium storytelling block
- brand/about storytelling

Forbidden:

- login
- register
- cart
- checkout
- profile/account management
- empty, error, and loading states

Constraints:

- lazy-loaded only
- static fallback required
- fallback remains LCP source
- HTML headings and CTAs stay outside the canvas
- no game-like or noisy visual treatment

## 15. SEO Design Rules

- one visible `h1` per page
- correct heading hierarchy
- crawlable product links
- real image tags for key visuals
- breadcrumb nav is visible and semantic
- JSON-LD on homepage, PLP, PDP, and other specified public pages
- `noindex` on auth, cart, checkout, account, orders, notifications, and payment result pages

## 16. API-Aware Design Notes

- Product detail UX is slug-based, but current backend docs expose only `GET /products/{id}`
- Register UX must support separate email and phone conflict states
- Review UX must support ineligible, duplicate, and moderation states
- Notification UI must use `referenceType` and `referenceId`
- Totals, discounts, and line totals are server truth; do not design flows that require client-side recomputation
- Payment, voucher, stock, and session-expiry states need explicit banners and retry-safe CTAs
- Order, shipment, invoice, and SKU codes should use monospace with click-to-copy

## 17. Implementation Priority

1. Tokens, typography, layout shell, shared primitives
2. Header, footer, SEO wrappers, toasts, modal, drawer, confirm dialog
3. Auth and protected route shell
4. Homepage plus PLP/PDP
5. Cart and checkout
6. Orders, payment result, shipment tracking
7. Profile, address book, invoice, write review, notifications
8. Missing screens: My Reviews, Address Form, Not Found
9. Motion polish, SEO completeness, accessibility, optional 3D

## 18. Design Gaps and Recommendations

Current gaps:

- Stitch lacks My Reviews, Address Form, and Not Found screens
- Stitch does not cover all component states
- Repo and Stitch differ slightly on exact color tuning
- API and UI docs still disagree on some error semantics

Recommendations:

- Treat root docs as implementation truth
- Add explicit design artifacts for missing screens and states before full UI implementation
- Normalize token values before component implementation begins
- Keep the editorial aesthetic strongest on Home, PLP, and PDP; make transactional/account flows calmer
