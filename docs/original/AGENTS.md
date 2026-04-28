# AGENTS.md

## 1. Project Identity

- Project: `Fashion Shop` customer-facing web application.
- Product scope: browser storefront and customer account flows only.
- Audience: authenticated and unauthenticated `CUSTOMER` users.
- Platform target: React web, desktop-first with responsive mobile and tablet support.
- Business scope: homepage, catalog, PDP, cart, checkout, orders, payment, shipment, invoice, reviews, notifications, profile, addresses, login, register.

## 2. Tech Stack

- Framework: `React 18` + `Vite 5`
- Language: `TypeScript` with strict mode
- Routing: `React Router v6` with `createBrowserRouter`
- Server state: `TanStack Query v5`
- Client state: `Zustand`
- Forms: `React Hook Form` + `Zod`
- HTTP: `Axios` with one shared client
- Styling: `Tailwind CSS v3` + CSS custom properties
- Motion: `Framer Motion`
- SEO: `React Helmet Async`
- Icons: `lucide-react`
- Optional 3D: `React Three Fiber` and related Three.js tooling, lazy-loaded only

Do not add libraries outside this stack without explicit approval.

## 3. Source-of-Truth Priority

Use these documents in this order when there is ambiguity:

1. `web-api-contract.md` and `api-common.md`
2. `ui-spec.md`
3. `delivery-plan.md`
4. `frontend-rules.md`
5. `README.md`
6. `CLAUDE.md`
7. `design-system.md`, `design-tokens.md`, `visual-direction.md`
8. `component-patterns.md`, `page-blueprints.md`, `motion-guidelines.md`, `3d-guidelines.md`
9. Stitch project `5987634216294262342` as visual reference and screen inventory

Conflict policy:

- Backend contract, endpoint shape, enums, and error semantics: API docs win.
- User-facing flow, page states, route behavior, and SEO indexing rules: `ui-spec.md` wins unless it conflicts with a proven backend contract limitation.
- Phase order and expected file inventory: `delivery-plan.md` wins.
- Architecture and implementation discipline: `frontend-rules.md`, `README.md`, and `CLAUDE.md` win over Stitch artifacts.
- Stitch is a design reference, not a higher-priority contract than repo docs.

## 4. Required Folder Structure

Target structure:

```text
src/
  app/
    main.tsx
    App.tsx
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

Per-feature rule:

- Each feature owns `components/`, `hooks/`, `pages/`, `schemas/`, `services/`, `types/`, and `index.ts`.
- Pages compose hooks and components only.
- Services are pure API functions only.
- Cross-feature imports are forbidden.
- Shared code moves into `shared/`.

## 5. Architecture Rules

- Architecture is feature-based, not layer-foldered by component type across the whole app.
- Page -> hook -> service -> Axios client is the only allowed API flow.
- Do not call APIs directly inside page components or presentational components.
- Use one shared Axios instance.
- Use one shared QueryClient.
- Use route constants from `constants/routes.ts`; do not hardcode route strings in components.
- Use query keys from `constants/queryKeys.ts`; do not invent ad hoc keys inside hooks.
- Server state lives in TanStack Query, not Zustand.
- URL search params own filter state for browse/search pages.
- Auth state and a small amount of global UI state live in Zustand.
- Transactional flows must be resilient to refresh-token retries and session expiry redirects.

## 6. TypeScript Rules

- `strict: true` is mandatory.
- Do not use `any`.
- Prefer `unknown` plus narrowing when the shape is not guaranteed.
- Do not use unsafe casts without a runtime guard.
- Type every API request and response.
- Use `type` for data shapes and `interface` for extendable contracts.
- Prefer `const` objects plus union types over TypeScript `enum`.
- Keep public types close to their feature unless they are globally shared.

## 7. Component Rules

- Functional components only.
- One primary component per file.
- File name must match the component name.
- Shared primitives and shared patterns belong in `shared/components`.
- Interactive elements must be semantic HTML first.
- Do not use `div` as a button.
- Every icon-only button must have `aria-label`.
- Every image must define `alt`, `width`, and `height`.
- Every page must define loading, error, empty, and success states.
- Do not mix business logic into base UI primitives.

## 8. Styling Rules

- Tailwind-first implementation.
- All colors, radii, shadows, spacing, and motion timings must resolve through design tokens.
- No hardcoded hex values in component code.
- Use CSS variables in `src/index.css` for semantic tokens.
- Use Tailwind config extensions for reusable token wiring.
- Light theme is the immediate target, but all components must remain dark-mode-ready through token indirection.
- Product imagery should use fixed aspect ratios and `object-fit: cover`.

## 9. Routing Rules

Public routes:

- `/`
- `/products`
- `/products/:slug`
- `/login`
- `/register`

Protected routes:

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

Routing constraints:

- Use `createBrowserRouter`.
- Use route-based code splitting with `React.lazy` and `Suspense`.
- Wrap protected areas in `ProtectedRoute`.
- Use `ShopLayout`, `AuthLayout`, and `CheckoutLayout` as documented.
- Scroll to top on route change in shared layout infrastructure.
- Use `replace: true` after checkout confirmation transitions where specified.

## 10. API Rules

- Base URL: `/api/v1`
- Local dev default: `http://localhost:8080/api/v1`
- Protected endpoints require `Authorization: Bearer <accessToken>`.
- Access token lives in memory via Zustand.
- Refresh token lives in `localStorage` as a bootstrap hint.
- Use one Axios client with:
- Request interceptor for bearer token attachment.
- Response interceptor for response unwrapping.
- Refresh-token retry queue for concurrent `401` failures.
- Redirect-to-login handling when refresh fails.
- All mutations must invalidate the correct queries.
- Do not auto-retry `POST`, `PATCH`, or `DELETE`.
- Retry `GET` requests according to query defaults and UI spec behavior.
- Keep API field names aligned with the backend contract, even where UI docs use different wording.

Known contract cautions:

- Register conflict codes differ across docs: backend contract exposes `EMAIL_ALREADY_EXISTS` and `PHONE_ALREADY_EXISTS`.
- `REVIEW_NOT_ELIGIBLE` is documented as `422` in API docs.
- Notification payload uses `referenceType` and `referenceId` in API docs.
- Slug-based PDP routing is desired, but `GET /products/{slug}` is listed as missing in current backend docs; implementation must resolve this before shipping PDP integration.

## 11. SEO Rules

- Every page must render `PageSEO`.
- Every page must define title, description, canonical URL, and Open Graph tags.
- Only one visible `h1` per page.
- Heading order must not skip levels.
- Public indexable routes: `/`, `/products`, `/products/:slug`.
- Transactional, account, auth, and payment routes must be `noindex`.
- JSON-LD is required on homepage, product listing, product detail, and order confirmation where specified.
- Breadcrumbs must be semantic HTML and JSON-LD-ready.
- Core content must be present in the DOM, not hidden inside visual-only layers.

## 12. Motion Rules

- Use Framer Motion for page transitions, drawer/modal transitions, hero sequencing, list removal, and scroll reveals.
- Use Tailwind transitions for hover, focus, and simple state changes.
- Respect `prefers-reduced-motion` in every animated component.
- Animate transform and opacity, not layout properties.
- Do not animate checkout-critical form controls.
- Do not stack competing animations in one viewport.
- Hero, product grid, sticky bars, modal, drawer, and backdrop motions should use shared presets.

## 13. 3D Rules

- 3D is optional and never default.
- 3D may appear only in marketing/storytelling surfaces such as homepage hero or campaign sections.
- 3D is not allowed in auth, cart, checkout, account management, or error/loading states.
- All 3D must be lazy-loaded behind `React.lazy` and `Suspense`.
- A static HTML fallback must always exist and must remain the LCP source.
- 3D must respect reduced-motion and low-end hardware gates.
- Headings, copy, and CTAs must stay in HTML outside the canvas.

## 14. Testing and Build Commands

Expected project commands:

- `npm run dev`
- `npm run lint`
- `npm run typecheck`
- `npm run build`
- `npm run preview`

When tests are added, they must not replace `lint`, `typecheck`, or production build verification.

## 15. Definition of Done

A task is done only when all applicable items below are true:

- The solution follows the documented folder structure and architecture flow.
- TypeScript passes with zero errors.
- Lint passes with zero unresolved issues.
- Routes use constants and correct protection rules.
- API integration uses typed services and hooks, not inline calls.
- Loading, error, empty, and success states are implemented.
- Accessibility requirements are satisfied for keyboard, focus, labels, and alerts.
- SEO requirements are satisfied for title, description, canonical, headings, and `noindex` behavior.
- Motion respects reduced-motion and does not compromise conversion flows.
- Visual implementation uses tokens, not ad hoc values.
- Responsive behavior is defined for mobile, tablet, and desktop.
- All images have explicit sizing and alt text.
- Query invalidation and mutation side effects are correct.
- Contract mismatches or assumptions are documented in code comments or task notes when they cannot be resolved immediately.

## 16. Working Rules for Codex

- Do not implement admin or staff interfaces in this repo.
- Do not add features not covered by the source-of-truth docs without approval.
- Do not install packages unless explicitly requested.
- Do not invent API endpoints.
- Do not let Stitch visuals override documented architecture or contract rules.
- If docs conflict, follow the source-of-truth priority and document the decision.
