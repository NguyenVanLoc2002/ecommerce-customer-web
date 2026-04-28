# component-patterns.md

## 1. Purpose

This document defines component architecture and UI patterns for `customer-web`.

Components must be:
- reusable and composable
- token-based (CSS variables + Tailwind)
- accessible (keyboard, ARIA, focus)
- animated with Framer Motion where appropriate
- SEO-friendly (semantic HTML, proper heading hierarchy)
- conversion-optimized

---

## 2. Component Hierarchy

### Foundation primitives
`Box`, `Stack`, `Inline`, `Grid`, `Container`, `Text`, `Heading`, `Icon`, `Divider`, `AspectRatio`

### Core UI components
`Button`, `IconButton`, `Input`, `Textarea`, `Select`, `Checkbox`, `Radio`, `Switch`, `Tabs`, `Badge`, `Tooltip`, `Modal`, `Drawer`, `Dropdown`, `Toast`, `Pagination`, `Card`, `Avatar`, `Skeleton`

### Customer-specific patterns
`Header`, `Footer`, `HeroSection`, `SectionHeader`, `ProductCard`, `ProductGrid`, `ProductMediaGallery`, `PriceDisplay`, `QuantitySelector`, `CategoryGrid`, `PromoBanner`, `CartItemCard`, `CartSummary`, `CheckoutSection`, `OrderStatusBadge`, `EmptyState`, `ErrorState`, `FilterPanel`, `SortDropdown`, `BreadcrumbNav`, `StickyCartBar`

---

## 3. Standard Component Contract

Each reusable component defines:
- **purpose**: one-line description
- **props**: TypeScript interface
- **variants**: `primary | secondary | ghost | danger`
- **sizes**: `sm | md | lg`
- **states**: default, hover, focus, active, disabled, loading, error, success
- **accessibility**: keyboard support, ARIA roles, focus behavior
- **responsive**: how layout/size adapts across breakpoints
- **animation**: Framer Motion variants used

---

## 4. Button Patterns

```tsx
<Button variant="primary" size="md" loading={isLoading}>
  Add to Cart
</Button>
```

| Variant | Usage |
|---|---|
| `primary` | Main CTA: Add to Cart, Checkout, Continue |
| `secondary` | Supporting actions |
| `ghost` | Lower-emphasis, text-like |
| `outline` | Bordered, no fill |
| `danger` | Remove / Delete / Cancel |

### Rules
- Loading state preserves width (spinner replaces text)
- `transform: translateY(-1px)` on hover for tactile feel
- Full-width on mobile checkout flows
- Min touch target: 44px height

---

## 5. Input Patterns

```tsx
<Input
  label="Email address"
  type="email"
  error={errors.email?.message}
  placeholder="you@example.com"
/>
```

### Structure
1. `<label>` — always visible
2. `<input>` control
3. Helper/error text below

### Rules
- Focus ring: `box-shadow: 0 0 0 3px rgba(79,70,229,0.12)`
- Error: red border + error message
- Group spacing: `gap: 16px` in forms
- Avoid placeholder-only labels (accessibility)

---

## 6. Product Card Patterns

```tsx
<ProductCard
  product={product}
  onQuickAdd={handleQuickAdd}
  variant="default" // "compact" | "horizontal"
/>
```

### Anatomy
1. Image zone (`aspect-ratio: 3/4`)
2. Badge overlay (Sale, New, Featured)
3. Product title (`<h3>`)
4. Price block (sale + original)
5. Quick Add CTA (appears on hover)

### Animation
```ts
// Card container
whileHover={{ y: -4, boxShadow: 'var(--shadow-card-hover)' }}
transition={{ duration: 0.25 }}

// Image
whileHover={{ scale: 1.04 }}
transition={{ duration: 0.3 }}

// Quick Add button
initial={{ opacity: 0, y: 8 }}
whileHover={{ opacity: 1, y: 0 }}
```

### Rules
- Consistent `aspect-ratio: 3/4` across all grids
- Single product card style — no wildly different card variants between pages
- `<a>` wraps the entire card for SEO
- Image `alt`: `{productName} - {variantName}`

---

## 7. Hero Section Patterns

```tsx
<HeroSection
  title="New Season Collection"
  subtitle="Discover your next look"
  ctaPrimary={{ label: 'Shop Now', href: '/products' }}
  ctaSecondary={{ label: 'See Lookbook', href: '/lookbook' }}
  image={heroImage}
  variant="dark" // "light" | "split"
/>
```

### Animation sequence
```ts
// Title: staggered word reveal
// Subtitle: fade in after 200ms
// CTA: fade + translate after 400ms
// Image: scale from 1.05 → 1.0 on load
```

### Rules
- Always render `<h1>` as the hero title
- CTA must be visible without scroll
- Background image: real `<img>` not CSS background (for LCP + SEO)

---

## 8. Product Grid Patterns

```tsx
<ProductGrid
  products={products}
  isLoading={isLoading}
  columns={{ mobile: 2, tablet: 3, desktop: 4 }}
/>
```

### Stagger animation
```ts
const containerVariants = {
  animate: { transition: { staggerChildren: 0.06 } }
}
const itemVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 }
}
```

### Loading state
- Show `SkeletonCard` × (columns × 2 rows)
- Same dimensions as real cards — no CLS

---

## 9. Filter and Sort Patterns

### Desktop
- Sidebar filter panel (sticky, left side)
- Sort dropdown (top right of grid)

### Mobile
- Filter: bottom drawer/sheet with `FilterPanel`
- Sort: bottom sheet

```tsx
<FilterPanel
  filters={filters}
  activeFilters={activeFilters}
  onChange={handleFilterChange}
  variant="sidebar" // or "drawer"
/>
```

### Animation (drawer variant)
```ts
// Backdrop: fadeIn
// Drawer: slideInFromBottom (translateY: 100% → 0)
```

---

## 10. Product Detail Patterns

### Layout
- Desktop: 2 columns — media left (60%), purchase block right (40%)
- Mobile: stacked — media → purchase block → details

### ProductMediaGallery
```tsx
<ProductMediaGallery
  images={product.images}
  videoUrl={product.videoUrl} // optional
  enable3D={false} // lazy-load 3D showcase
/>
```

Features: thumbnail strip, zoom on hover, lightbox on click.

### Purchase block (sticky on desktop scroll)
```tsx
<PurchaseBlock>
  <ProductTitle />
  <PriceDisplay />
  <VariantSelector />
  <QuantitySelector />
  <AddToCartButton />
  <WishlistButton />
</PurchaseBlock>
```

### StickyCartBar (mobile)
Appears when main CTA scrolls out of view:
```tsx
<StickyCartBar
  product={product}
  selectedVariant={selectedVariant}
  onAddToCart={handleAddToCart}
/>
```

---

## 11. Cart and Checkout Patterns

### CartItemCard
```tsx
<CartItemCard
  item={cartItem}
  onQuantityChange={handleQtyChange}
  onRemove={handleRemove}
/>
```

### CartSummary
```tsx
<CartSummary
  subtotal={subtotal}
  discount={discount}
  shipping={shipping}
  total={total}
  cta={<Button variant="primary">Proceed to Checkout</Button>}
/>
```

### CheckoutSection
```tsx
<CheckoutSection title="Shipping Address" step={1}>
  {/* form content */}
</CheckoutSection>
```

### Rules
- Checkout: minimal decoration, maximum clarity
- No hover animations on form controls
- Progress indicator at top: `Step 1 of 4`
- Order summary always visible (sidebar desktop, collapsible mobile)

---

## 12. Navigation Patterns

### Header
```tsx
<Header>
  <Logo />
  <NavLinks />          // desktop only
  <SearchBar />
  <CartIconButton count={cartCount} />
  <UserMenu />
  <HamburgerButton />   // mobile only
</Header>
```

- Sticky: `position: sticky; top: 0; z-index: var(--z-sticky)`
- Scroll shadow: add `box-shadow: var(--shadow-sticky)` after scroll
- Mobile: hamburger → slide-in drawer navigation

### BreadcrumbNav
```tsx
<BreadcrumbNav
  items={[
    { label: 'Home', href: '/' },
    { label: 'T-Shirts', href: '/products?category=tshirts' },
    { label: 'White Basic Tee' },
  ]}
/>
```
Renders `<nav aria-label="Breadcrumb">` + JSON-LD `BreadcrumbList`.

---

## 13. SEO Components

```tsx
// Per-page SEO meta
<PageSEO
  title="White Basic Tee | Fashion Shop"
  description="Shop the White Basic Tee — premium cotton, relaxed fit."
  canonical="https://fashionshop.vn/products/ao-thun-trang-basic"
  ogImage="https://cdn.fashionshop.vn/products/white-tee-og.jpg"
/>

// Product structured data
<ProductJsonLd
  product={product}
  url={canonicalUrl}
/>
```

---

## 14. Motion Patterns (Web)

### Approved
- Page entry (fade + translate)
- Card hover lift
- Product grid stagger reveal
- Hero reveal sequence
- Drawer/modal enter/exit
- Sticky bar transition
- Filter result update (fade)

### Avoid
- Competing animations in same viewport section
- Motion on checkout form fields
- Aggressive parallax
- Looping animations that never stop

### Framer Motion — standard presets

```ts
export const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } },
}

export const drawerVariants = {
  initial: { x: '100%' },
  animate: { x: 0, transition: { duration: 0.3, ease: [0, 0, 0.2, 1] } },
  exit: { x: '100%', transition: { duration: 0.25, ease: [0.4, 0, 1, 1] } },
}

export const modalVariants = {
  initial: { opacity: 0, scale: 0.96, y: 8 },
  animate: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.2 } },
  exit: { opacity: 0, scale: 0.96, transition: { duration: 0.15 } },
}
```

---

## 15. Responsive Patterns

| Component | Mobile | Desktop |
|---|---|---|
| `ProductGrid` | 2 columns | 3–4 columns |
| `FilterPanel` | Bottom drawer | Left sidebar |
| `CartSummary` | Stacked below items | Right sticky sidebar |
| `ProductMediaGallery` | Swipeable carousel | Thumbnail grid + main |
| `CheckoutSection` | Single column | 2 columns (form + summary) |
| `Header` | Logo + icons + hamburger | Full nav |
| `HeroSection` | Stacked | Side-by-side or full bleed |

---

## 16. Accessibility Rules

Every interactive component must support:
- Full keyboard navigation (Tab, Enter, Space, Escape, Arrow keys)
- Visible focus ring (`outline: 2px solid var(--border-focus)`)
- Correct ARIA roles and labels
- Sufficient color contrast (WCAG AA)
- `prefers-reduced-motion` respected in all Framer Motion animations

---

## 17. Anti-Patterns

Do not:
- Create multiple inconsistent ProductCard styles
- Use non-semantic elements for interactive controls
- Animate checkout form fields
- Hardcode colors or spacing
- Mix business logic into base UI components
- Use `onClick` on `<div>` without `role="button"` + keyboard handler
- Skip `alt` text on product images
