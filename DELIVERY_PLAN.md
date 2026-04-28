# DELIVERY_PLAN.md

Implementation roadmap for the `Fashion Shop` customer web app.

## 1. Planning Rules

- Build in order; do not skip prerequisites
- Finish a phase to a compilable state before moving on
- Follow the sequence: types -> services -> hooks -> components -> pages -> exports
- Root docs are the current truth; archived docs are reference only

## 2. Phase Overview

| Phase | Focus | Key deliverable |
|---|---|---|
| 0 | Foundation | Vite scaffold, config, providers, router shell, shared infrastructure |
| 1 | Auth | Login, register, bootstrap, logout, protected routing |
| 2 | Routing Shell | All routes wired, layouts complete, page stubs present |
| 3 | Homepage | Editorial homepage with hero, categories, featured products, promo, newsletter |
| 4 | Product Discovery | PLP with filters/search plus PDP with variants and add-to-cart |
| 5 | Cart | Full cart management, summary, stale item handling |
| 6 | Checkout | 4-step checkout and order confirmation |
| 7 | Orders | Order list, detail, cancellation, status-driven actions |
| 8 | Payment | Payment initiation and result polling |
| 9 | Shipment | Tracking page with progress and timeline |
| 10 | Reviews | Write review, My Reviews, PDP review section |
| 11 | Notifications | List, unread badge, optimistic mark-read flows |
| 12 | Profile | Profile edit, addresses, address form reuse |
| 13 | SEO & Polish | JSON-LD, accessibility, CWV, copy-to-clipboard, edge cases |

## 3. Phase Details

### Phase 0: Foundation

Create:

- Vite and TypeScript scaffold
- Tailwind and token setup
- app providers
- router foundation
- constants and query keys
- shared Axios client
- shared QueryClient
- auth and UI stores
- shared layout, overlay, SEO, feedback, and primitive components

Done when:

- app boots
- root layouts render
- tokens exist
- strict TypeScript passes

### Phase 1: Auth

Create:

- auth schemas
- auth services
- login/register/logout hooks
- login and register pages
- auth bootstrap in provider
- protected route guard

Done when:

- user can register
- user can log in
- refresh-token bootstrap works
- logout clears state

### Phase 2: Routing Shell

Create:

- full route map
- route-level lazy loading
- `Header`, `Footer`, `MobileNav`
- `ShopLayout`, `AuthLayout`, `CheckoutLayout`
- page stubs for every route
- breadcrumb infrastructure
- 404 page

Done when:

- every route resolves
- protected routes redirect correctly
- layouts are structurally complete

### Phase 3: Homepage

Create:

- hero
- category grid
- featured products
- promo banner
- new arrivals
- trust section
- newsletter

Done when:

- homepage is visually complete
- reveal and hover motion behave correctly
- homepage SEO is in place

### Phase 4: Product Discovery

Create:

- product types
- list and detail services
- PLP filters, sorting, search, URL-state handling
- product cards and grids
- PDP media gallery, purchase block, variant selector, sticky mobile CTA

Done when:

- PLP filter/search/infinite loading works
- PDP supports variant selection and add-to-cart
- PLP and PDP SEO are correct

### Phase 5: Cart

Create:

- cart types and services
- cart query and mutation hooks
- cart item rows
- summary panel
- stale item banner
- empty and confirm flows

Done when:

- quantity updates, remove, clear, and checkout CTA all behave correctly

### Phase 6: Checkout

Create:

- checkout store
- voucher validation hook
- place-order hook
- stepper
- order summary panel
- address, payment, voucher, review, and confirmation pages

Done when:

- full checkout works end-to-end
- race-condition handling is visible and safe

### Phase 7: Orders

Create:

- order list and detail hooks
- status tabs
- order cards
- order detail pricing and action surfaces
- cancellation flow

Done when:

- customer can browse orders and cancel eligible orders

### Phase 8: Payment

Create:

- payment services and hooks
- payment initiation from order surfaces
- payment result page with polling branches

Done when:

- payment redirect/initiation works
- result page stabilizes correctly across states

### Phase 9: Shipment

Create:

- shipment service and hook
- progress bar
- event timeline
- alert banners
- order detail integration

Done when:

- tracking page is complete and linked from orders

### Phase 10: Reviews

Create:

- review types, services, hooks
- star input/display
- review cards and distribution
- write review page
- My Reviews page
- PDP review section

Done when:

- review submission and review browsing both work

### Phase 11: Notifications

Create:

- notification services and hooks
- unread badge integration
- notification list and mark-read flows

Done when:

- unread badge updates correctly
- optimistic read actions rollback safely on error

### Phase 12: Profile & Addresses

Create:

- profile and address types, schemas, services, hooks
- profile page
- address book page
- address form page
- checkout return-to-address integration

Done when:

- customer can edit profile and manage addresses

### Phase 13: SEO & Polish

Complete:

- JSON-LD coverage
- Lighthouse/CWV pass
- accessibility pass
- error-code handling audit
- click-to-copy UX
- print-friendly invoice
- reduced-motion verification

Done when:

- app is production-ready
- SEO, accessibility, and edge cases are covered

## 4. Critical Path

Strict dependency path:

`Phase 0 -> Phase 1 -> Phase 2 -> Phase 3 -> Phase 4 -> Phase 5 -> Phase 6 -> Phase 7 -> Phase 8 -> Phase 9 -> Phase 10/11/12 -> Phase 13`

Parallelism guidance after Phase 7:

- Phase 10, 11, and 12 can run in parallel if ownership boundaries are clear
- Phase 13 must wait until all user-facing flows are present

## 5. Current Recommended Starting Point

Because the repo is currently documentation-first, start with:

1. Phase 0 scaffold
2. Phase 1 auth
3. Phase 2 routing shell

Do not start feature implementation before those three phases exist.
