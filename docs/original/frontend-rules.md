# Frontend Rules — Fashion Shop Customer Web App

> Applies to: `src/` in the React + Vite + TypeScript project.
> Role served: `CUSTOMER` only.

---

## 1. Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Framework | React + Vite | React 18, Vite 5 |
| Language | TypeScript | strict mode |
| Routing | React Router | v6 |
| Server state | TanStack Query | v5 |
| Client state | Zustand | latest |
| Forms | React Hook Form + Zod | latest |
| Styling | Tailwind CSS + CSS Variables | v3 |
| Animation | Framer Motion | latest |
| HTTP | Axios | single instance |
| Icons | Lucide React | latest |
| SEO | React Helmet Async | latest |
| 3D (optional) | React Three Fiber | lazy only |

No library outside this list may be added without explicit approval.

---

## 2. Folder Structure Principles

Architecture is **feature-based**. Every feature is self-contained.

```
src/
├── app/                   # Entry, router, global providers
├── features/              # Feature modules
│   ├── home/
│   ├── products/
│   ├── cart/
│   ├── checkout/
│   ├── orders/
│   ├── payment/
│   ├── shipment/
│   ├── invoice/
│   ├── reviews/
│   ├── notifications/
│   ├── profile/
│   └── auth/
├── shared/                # Used across all features
│   ├── components/ui/
│   ├── components/feedback/
│   ├── components/layout/
│   ├── components/seo/
│   ├── components/overlays/
│   ├── hooks/
│   ├── lib/
│   ├── stores/
│   ├── types/
│   └── utils/
└── constants/
```

### Structural rules

- **Cross-feature imports are forbidden.** `features/A` must not import from `features/B`. Move shared code to `shared/`.
- Each feature's `index.ts` exports only its **public API**.
- Pages only compose components and call hooks. No API calls or business logic directly in page components.
- File name must match the default export name: `ProductCard.tsx` not `index.tsx`.

### Each feature must contain

```
features/<name>/
├── components/    # UI components scoped to this feature
├── hooks/         # useQuery / useMutation wrappers
├── pages/         # Page components (compose only)
├── schemas/       # Zod validation schemas
├── services/      # API call functions (pure, no React)
├── types/         # Feature-specific types
└── index.ts       # Public exports only
```

---

## 3. TypeScript Rules

- `strict: true`. Do not disable any strict flag.
- Never use `any`. Use `unknown` with type guards.
- Never use `as SomeType` without a preceding type-guard or runtime check.
- Always type API responses.
- Use `type` for data shapes, `interface` for extendable contracts.
- Map backend enums to `const` object + union type — never TS `enum`.

---

## 4. Component Rules

### Structure
```
ComponentName/
├── ComponentName.tsx
├── ComponentName.test.tsx   (optional)
└── index.ts
```

### Principles
- Prefer composition and explicit props over context magic.
- No inline styles. Use Tailwind utility classes or CSS variables.
- All interactive elements must have keyboard support and focus styles.
- Every image must define `width`, `height`, and `alt`.

### Naming
- Pages: `ProductListPage`, `CartPage`
- Layouts: `ShopLayout`, `AuthLayout`
- Feature components: `ProductCard`, `FilterPanel`
- Shared UI: `Button`, `Input`, `Badge`

---

## 5. Styling Rules

### Tailwind-first
- Use Tailwind utility classes for all styling.
- Use CSS custom properties (`--color-brand`, `--radius-card`) for design tokens.
- No hardcoded hex colors outside `tailwind.config.js`.
- Responsive with Tailwind breakpoints: `sm:`, `md:`, `lg:`, `xl:`, `2xl:`.

### CSS Variables (design tokens)
Define in `index.css`:
```css
:root {
  --color-brand: #4F46E5;
  --color-brand-hover: #4338CA;
  --color-surface: #FFFFFF;
  --color-canvas: #F9FAFB;
  --radius-card: 1rem;
  --radius-btn: 0.5rem;
  --shadow-card: 0 4px 24px rgba(0,0,0,0.06);
  --motion-fast: 150ms ease;
  --motion-normal: 250ms ease;
  --motion-slow: 400ms ease;
}
```

---

## 6. Routing Rules

- Use React Router v6 `createBrowserRouter`.
- Route-based code splitting via `React.lazy` + `Suspense`.
- Protected routes via `<ProtectedRoute>` wrapper.
- Each page exports a default component + optional loader.

### SEO on routes
Every page must render `<PageSEO>` with title, description, and canonical URL.

```tsx
<PageSEO
  title="Áo Thun Trắng Basic | Fashion Shop"
  description="Khám phá bộ sưu tập áo thun trắng basic chất lượng cao."
  canonical="https://fashionshop.vn/products/ao-thun-trang-basic"
/>
```

---

## 7. Data Fetching Rules

- Use TanStack Query for all server data.
- Services are pure async functions, no React hooks.
- Every query must handle: loading, error, empty states.
- Use `suspense: false` on queries unless inside explicit `<Suspense>`.
- Infinite scroll uses `useInfiniteQuery`.
- Customer auth refresh/logout requests must use `withCredentials: true` so the browser can send the backend `HttpOnly` refresh-token cookie.
- Customer auth code must never store `refreshToken`, `accessToken`, or bearer tokens in `localStorage`.
- If the current auth architecture ever needs temporary access-token persistence, `sessionStorage` is the only acceptable fallback and the value must still not be treated as durable state.

### Query key convention
```ts
export const productKeys = {
  all: ['products'] as const,
  list: (filters: ProductFilters) => [...productKeys.all, 'list', filters] as const,
  detail: (slug: string) => [...productKeys.all, 'detail', slug] as const,
}
```

---

## 8. Form Rules

- React Hook Form + Zod for all forms.
- Zod schemas live in `features/<name>/schemas/`.
- Use `useForm` with `zodResolver`.
- Always show inline field errors below each input.
- Submit button must show loading state without layout shift.

---

## 9. Animation Rules

### Use Framer Motion for
- Page transitions (fade + slide)
- Modal / Drawer enter/exit
- Hero section reveal
- Product grid stagger
- Scroll-triggered section reveals

### Use Tailwind transitions for
- Button hover/active
- Card hover lift
- Input focus

### Rules
- Always wrap Framer Motion animations with `AnimatePresence` for exit animations.
- Always check `prefers-reduced-motion` and reduce/remove animations accordingly.
- 3D scenes must be inside `React.lazy` — never eagerly imported.
- No competing animations within the same viewport section.

---

## 10. SEO Rules

- `<title>` and `<meta name="description">` required on every page.
- `<link rel="canonical">` required on every page.
- Open Graph tags (`og:title`, `og:description`, `og:image`) required on every page.
- JSON-LD structured data on: HomePage, ProductListPage, ProductDetailPage.
- Images must have descriptive `alt` text.
- Headings must follow correct `h1 → h2 → h3` hierarchy per page (one `h1` per page).

---

## 11. Performance Rules

- Route-level code splitting via `React.lazy`.
- Product images: always define `width` + `height`, use `loading="lazy"`.
- Hero / LCP image: `loading="eager"` + `fetchpriority="high"`.
- 3D scenes: lazy-loaded, with static fallback, never block LCP.
- Avoid `import *` — tree-shake aggressively.
- Memoize expensive computations with `useMemo`, callbacks with `useCallback` only when profiling shows need.

---

## 12. Accessibility Rules

- All interactive elements reachable and operable via keyboard.
- Visible focus ring on all interactive elements.
- Color is never the sole conveyor of state.
- `aria-label` required on icon-only buttons.
- `role="alert"` on toast and error messages.
- Modals must trap focus and restore on close.
- Forms must associate labels with inputs via `htmlFor` / `id`.

---

## 13. Anti-Patterns

Do not:
- Call API directly inside a page component
- Use `any` type
- Import from another feature's internal files
- Store `refreshToken`, `accessToken`, bearer tokens, or private customer profile data in `localStorage` or `sessionStorage`
- Send `refreshToken` in the `POST /auth/refresh-token` request body once the cookie flow is available
- Use `ScrollView + map` for long lists (use virtualized rendering or `IntersectionObserver`-based pagination)
- Animate checkout-critical form controls
- Block LCP with 3D or heavy assets
- Use `dangerouslySetInnerHTML` without sanitization
