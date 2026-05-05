# AGENTS.md

Primary instruction file for Codex in this repository.

## 1. Purpose

Use this file as the top-level implementation guide for the `Fashion Shop` customer web app.

- Product: customer-facing fashion commerce web application
- Audience: `CUSTOMER` users only
- Platform: React web
- Scope: storefront, account, checkout, order lifecycle, payment, shipment, invoice, reviews, notifications

Original long-form source docs are preserved under `docs/original/`.

## 2. Source-of-Truth Order

When documents disagree, resolve in this order:

1. `AGENTS.md`
2. `API.md`
3. `DESIGN.md`
4. `DELIVERY_PLAN.md`
5. `README.md`
6. `docs/original/*`
7. Stitch project `5987634216294262342` as visual reference only

Rule of thumb:

- API semantics and payloads: `API.md`
- Visual, UX, tokens, component patterns, screen mapping: `DESIGN.md`
- Build order and milestones: `DELIVERY_PLAN.md`
- Setup and runtime basics: `README.md`

## 3. Tech Stack

- Framework: `React 18` + `Vite 5`
- Language: `TypeScript` with strict mode
- Routing: `React Router v6` with `createBrowserRouter`
- Server state: `TanStack Query v5`
- Client state: `Zustand`
- Forms: `React Hook Form` + `Zod`
- HTTP: `Axios`
- Styling: `Tailwind CSS v3` + CSS variables
- Motion: `Framer Motion`
- SEO: `React Helmet Async`
- Icons: `lucide-react`
- Optional 3D: `React Three Fiber`

Do not add libraries outside this stack without explicit approval.

## 4. Expected Folder Structure

```text
src/
  app/
    router/
    providers/
  features/
    auth/
    home/
    products/
    cart/
    checkout/
    orders/
    payment/
    shipment/
    invoice/
    reviews/
    notifications/
    profile/
  shared/
    components/
      ui/
      feedback/
      layout/
      seo/
      overlays/
    hooks/
    lib/
    stores/
    types/
    utils/
  constants/
```

If app source is missing, start with Phase 0 from `DELIVERY_PLAN.md`.

## 5. Architecture Rules

- Use feature-based architecture.
- Cross-feature imports are forbidden.
- Shared code must move into `shared/`.
- Page -> hook -> service -> Axios is the only allowed API flow.
- Pages compose UI and hooks only.
- Services are pure async API functions.
- Server state belongs in TanStack Query, not Zustand.
- URL search params own product filter state.
- Auth state and small global UI state belong in Zustand.
- Use one shared Axios client and one shared QueryClient.

## 6. TypeScript Rules

- `strict: true` is mandatory.
- Never use `any`.
- Prefer `unknown` plus narrowing for uncertain shapes.
- Avoid unsafe casts.
- Type every request, response, and public prop.
- Prefer `type` for data shapes and `interface` for extendable contracts.
- Represent backend enums with `const` objects plus union types.

## 7. Component Rules

- Functional components only.
- One primary component per file.
- File name must match component name.
- Base primitives live in `shared/components/ui`.
- Reusable patterns live in `shared/components/*`.
- Use semantic HTML first.
- Do not use clickable `div`s.
- All icon-only buttons need `aria-label`.
- All images need `alt`, `width`, and `height`.
- Every page must define loading, error, empty, and success states.
- Keep business logic out of UI primitives.

## 8. Styling Rules

- Tailwind-first implementation.
- All visual values must resolve through tokens.
- No hardcoded hex colors in component code.
- Semantic CSS variables belong in `src/index.css`.
- Tailwind config should reference those variables.
- Product imagery uses fixed aspect ratios and `object-fit: cover`.
- Preserve light-theme-first behavior while staying dark-mode-ready.

## 9. Routing Rules

Canonical routes:

- `/`
- `/products`
- `/products/:slug`
- `/cart`
- `/checkout/address`
- `/checkout/payment`
- `/checkout/voucher`
- `/checkout/review`
- `/checkout/confirmation`
- `/orders`
- `/orders/:orderId`
- `/orders/:orderId/tracking`
- `/orders/:orderId/review`
- `/orders/:orderId/invoice`
- `/payment/result`
- `/profile`
- `/profile/addresses`
- `/profile/addresses/new`
- `/profile/addresses/:id/edit`
- `/profile/reviews`
- `/notifications`
- `/login`
- `/register`

Implementation constraints:

- Use `createBrowserRouter`.
- Use `React.lazy` and `Suspense` for route-level splitting.
- Guard protected routes with `ProtectedRoute`.
- Use route constants, never hardcoded path strings in components.
- Use `ShopLayout`, `AuthLayout`, and `CheckoutLayout`.

## 10. API Rules

- Base path: `/api/v1`
- Auth uses `Authorization: Bearer <accessToken>`
- Access token lives in Zustand memory
- Refresh token lives in `localStorage` as a bootstrap hint
- All API behavior must match `API.md`

Critical contract notes:

- Current backend contract exposes `EMAIL_ALREADY_EXISTS` and `PHONE_ALREADY_EXISTS`
- `REVIEW_NOT_ELIGIBLE` is `422` in current backend docs
- Notifications use `referenceType` and `referenceId`
- Public PDP lookup is currently documented as `GET /products/{id}`, not slug
- `voucherCode` on order creation is stored but not yet applied to totals
- Product keyword search remains `keyword`; do not add or expose `searchText` / `search_text`
- Customer FE must send the user's raw trimmed keyword only; do not lowercase or strip Vietnamese accents
- Customer FE must trust backend FULLTEXT relevance ordering when `keyword` is present and must not client-filter returned product results
- Do not expose admin-only product search actions such as search reindex from the customer web app

## 11. SEO Rules

- Every page must render `PageSEO`
- Every page needs title, description, canonical URL, and OG tags
- Exactly one visible `h1` per page
- Heading hierarchy must not skip levels
- Public indexable routes are `/`, `/products`, and product detail pages
- Auth, cart, checkout, order, profile, notification, and payment result pages are `noindex`
- JSON-LD is required where specified in `DESIGN.md`

## 12. Motion Rules

- Use Framer Motion for page transitions, overlays, hero sequencing, scroll reveals, and item exit/reorder
- Use Tailwind transitions for hover, focus, and small micro-interactions
- Respect `prefers-reduced-motion` everywhere
- Animate `transform` and `opacity`, not layout-heavy properties
- Do not animate checkout-critical form controls
- Use shared motion presets instead of ad hoc inline motion logic

## 13. 3D Rules

- 3D is optional and never default
- 3D is allowed only in editorial/storytelling surfaces
- 3D is forbidden in auth, cart, checkout, profile, and error/loading states
- 3D must be lazy-loaded with a static fallback
- The fallback must remain the LCP source
- Headings, copy, and CTAs must stay in HTML outside the canvas

## 14. Commands

Expected commands:

- `npm install`
- `npm run dev`
- `npm run lint`
- `npm run typecheck`
- `npm run build`
- `npm run preview`

Do not install packages or implement runtime changes unless explicitly requested.

## 15. Definition of Done

A task is done only when all applicable checks pass:

- Structure matches the documented architecture
- TypeScript compiles with zero errors
- Lint passes
- API integration follows `API.md`
- Visual implementation follows `DESIGN.md`
- Loading, error, empty, and success states exist
- Accessibility rules are satisfied
- SEO rules are satisfied
- Motion respects reduced-motion and conversion safety
- Images have explicit sizing and alt text
- Responsive behavior is covered
- Query invalidation and mutation side effects are correct
- Any unavoidable contract assumption is documented

## 16. Codex Working Rules

- Do not implement admin or staff flows
- Do not invent API endpoints
- Do not let archived docs override the consolidated root docs
- Do not let Stitch override API or architecture truth
- If conflicts remain, document the resolution in the task result
