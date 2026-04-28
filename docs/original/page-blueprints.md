# page-blueprints.md

## 1. Purpose

Page-level blueprints for `customer-web`.

Ensures consistency in:
- semantic HTML structure (for SEO)
- section rhythm and layout
- CTA placement and hierarchy
- responsive behavior
- conversion flow design

---

## 2. Shared Page Principles

1. One `<h1>` per page — visible, relevant, keyword-rich.
2. Heading hierarchy must never skip levels (`h1 → h2 → h3`).
3. Core content must be in the DOM (not JS-rendered only) — critical for SEO.
4. Browsing pages: easy, modular, fast.
5. Conversion pages: calm, trustworthy, distraction-free.
6. Every page must render `<PageSEO>` with title, description, canonical, OG.

---

## 3. Standard Page Anatomy

```html
<html lang="vi">
  <head>
    <!-- React Helmet Async injects SEO here -->
  </head>
  <body>
    <Header />                    <!-- sticky -->
    <main id="main-content">
      <!-- page-specific content -->
    </main>
    <Footer />
    <ToastContainer />
  </body>
</html>
```

---

## 4. Homepage Blueprint

**Route**: `/`
**SEO**: Title = "Fashion Shop — Thời Trang Hiện Đại", Description = brand tagline, JSON-LD = `WebSite` + `Organization`

### Structure
```
<main>
  <HeroSection />                  ← h1, primary CTA, hero image/3D
  <CategoryGrid />                 ← h2: "Shop by Category"
  <FeaturedProductsSection />      ← h2: "Nổi Bật", ProductGrid
  <PromoBanner />                  ← Campaign/sale banner
  <NewArrivalsSection />           ← h2: "Mới Nhất"
  <BrandStorySection />            ← optional 3D or visual storytelling
  <TrustSection />                 ← shipping, returns, support
  <NewsletterSection />            ← email capture
</main>
```

### Animation sequence
1. Hero: title word-by-word reveal → subtitle fade → CTA slide up
2. Scroll: sections reveal with `useScrollReveal` (Intersection Observer)
3. Product cards: stagger 60ms per card on first viewport entry

### Rules
- Above-the-fold: brand + tagline + CTA always visible
- Hero image: `<img loading="eager" fetchpriority="high">`
- 3D (if used): lazy-loaded, static fallback always rendered
- Newsletter: proper `<form>` with `aria-label`

---

## 5. Product Listing Page (PLP) Blueprint

**Route**: `/products`, `/products?category=:slug`, `/products?q=:query`
**SEO**: Title = "{Category} | Fashion Shop", Description = category intro, JSON-LD = `ItemList`

### Structure
```
<main>
  <BreadcrumbNav />
  <PLPHeader>                      ← h1: category name
    <CategoryDescription />        ← optional, SEO-rich paragraph
  </PLPHeader>
  <PLPBody>
    <FilterPanel />                ← sidebar (desktop) or drawer (mobile)
    <PLPContent>
      <SortDropdown />
      <ActiveFilterChips />
      <ProductGrid />              ← h2/h3 per product name in card
      <Pagination />               ← or InfiniteScroll load-more
    </PLPContent>
  </PLPBody>
  <EmptyState />                   ← if no results
</main>
```

### URL + Pagination SEO
- Filters: URL params (`?category=ao-thun&color=trang`)
- Pagination: `?page=2` — server-render page 1, client-navigate after
- Canonical: `/products?category=ao-thun` (without sort/page)
- `rel="prev"` / `rel="next"` for paginated series

### Rules
- Product card `<a>` must be crawlable (no JS-only navigation)
- Filter changes must update URL (browser history)
- Mobile filters open in `<FilterDrawer>` with backdrop

---

## 6. Product Detail Page (PDP) Blueprint

**Route**: `/products/:slug`
**SEO**: Title = "{Product Name} | Fashion Shop", Description = product summary, JSON-LD = `Product` with `offers` and `aggregateRating`

### Structure
```
<main>
  <BreadcrumbNav />
  <PDPBody>
    <ProductMediaGallery />        ← images, video, optional 3D
    <PurchaseBlock>
      <h1>{productName}</h1>
      <PriceDisplay />
      <RatingSummary />
      <VariantSelector />          ← color, size
      <QuantitySelector />
      <AddToCartButton />          ← primary CTA
      <WishlistButton />
      <DeliveryInfoSnippet />      ← shipping estimate, returns
    </PurchaseBlock>
  </PDPBody>
  <ProductDetails />               ← description, materials, care — h2
  <ReviewsSection />               ← h2: "Đánh Giá"
  <RelatedProducts />              ← h2: "Có Thể Bạn Thích"
</main>
<StickyCartBar />                  ← mobile only, appears on scroll
```

### Rules
- `<h1>` = product name — exactly once
- Image `alt` = `{productName} - {colorVariant}`
- Price always visible without scroll on desktop
- Sticky purchase block: `position: sticky; top: calc(var(--layout-header-height) + 16px)`
- Mobile: StickyCartBar shows when CTA scrolls off screen
- 3D showcase: lazy-loaded inside `React.lazy`, static image fallback

---

## 7. Cart Page Blueprint

**Route**: `/cart`
**SEO**: `noindex` (transactional, no SEO value)

### Structure
```
<main>
  <h1>Giỏ Hàng</h1>
  <CartBody>
    <CartItemList />
    <CartSummaryPanel />           ← sticky sidebar (desktop)
  </CartBody>
  <EmptyCartState />               ← if empty: message + CTA to browse
</main>
```

### Rules
- Quantity change: optimistic update + debounced API call
- Remove: confirm dialog only if cart would become empty
- Summary: always shows total + CTA
- CTA "Tiến hành thanh toán" → `/checkout/address`
- No decorative motion in this flow

---

## 8. Checkout Blueprint

**Routes**: `/checkout/address`, `/checkout/payment`, `/checkout/voucher`, `/checkout/review`, `/checkout/confirmation`
**SEO**: All checkout pages `noindex`

### Structure
```
<main>
  <CheckoutHeader>
    <Logo />
    <ProgressSteps step={currentStep} total={4} />
  </CheckoutHeader>
  <CheckoutBody>
    <CheckoutFormSection />
    <OrderSummaryPanel />          ← collapsible on mobile, sticky on desktop
  </CheckoutBody>
</main>
```

### Step structure

| Step | Route | Content |
|---|---|---|
| 1 | `/checkout/address` | Delivery address form |
| 2 | `/checkout/payment` | Payment method selection |
| 3 | `/checkout/voucher` | Voucher / promo code |
| 4 | `/checkout/review` | Full review before submit |
| ✓ | `/checkout/confirmation` | Success, order ID, next steps |

### Rules
- Minimal header (logo only — no nav distractions)
- No decorative animations on form inputs
- Validation errors: inline, clear, calm
- CTA must never be below fold without scroll
- Progress steps: accessible `<ol>` with `aria-current="step"`
- Trust signals: SSL badge, return policy visible

---

## 9. Account Blueprint

**Routes**: `/profile`, `/profile/addresses`, `/profile/reviews`, `/orders`, `/orders/:id`, `/notifications`
**SEO**: All `noindex` (authenticated only)

### Structure
```
<main>
  <AccountSidebar />              ← desktop: left sidebar nav
  <AccountContent>
    <h1>{sectionTitle}</h1>
    {/* page content */}
  </AccountContent>
</main>
```

### Mobile
- Sidebar collapses into top tab navigation or header dropdown.

### Rules
- Clean, task-focused design
- Order status badges clearly readable
- Same visual system as the rest of the site

---

## 10. Auth Pages Blueprint

**Routes**: `/login`, `/register`
**SEO**: `noindex`

### Structure
```
<main>
  <AuthCard>
    <Logo />
    <h1>Đăng Nhập</h1>
    <AuthForm />
    <SocialAuthOptions />       ← optional
    <AuthSwitch />              ← "Chưa có tài khoản? Đăng ký"
  </AuthCard>
</main>
```

### Rules
- Centered card layout on all screen sizes
- Form fields follow input design system exactly
- No distracting background effects that slow load
- Error messages inline, calm red

---

## 11. Empty, Loading, Error States

Every page must define all three:

### Loading
- Product grid: `<SkeletonCard>` × (column count × 2)
- Detail sections: `<SkeletonDetail>`
- Same dimensions as final content → zero CLS

### Empty
```tsx
<EmptyState
  icon={<ShoppingBag />}
  title="Chưa có sản phẩm nào"
  description="Hãy thử tìm kiếm hoặc xem danh mục khác."
  cta={<Button href="/products">Khám Phá Ngay</Button>}
/>
```

### Error
```tsx
<ErrorCard
  title="Đã xảy ra lỗi"
  description="Vui lòng thử lại sau."
  retry={refetch}
/>
```

---

## 12. Responsive Rules

| Page element | Mobile | Desktop |
|---|---|---|
| Hero | Stacked, full-width | Side-by-side or full-bleed |
| Product grid | 2 cols | 3–4 cols |
| Filter | Bottom drawer | Left sidebar |
| PDP layout | Stacked | 2-column |
| Cart summary | Below items | Right sticky panel |
| Checkout | Single column | Form + summary side-by-side |
| Navigation | Hamburger drawer | Full horizontal nav |

---

## 13. Motion at Page Level

### Use
- Hero section: staggered reveal sequence
- Product grids: scroll-triggered stagger on first viewport entry
- Page transitions: `AnimatePresence` with fade + translate
- Drawers/modals: slide + backdrop fade

### Avoid
- Motion in checkout form areas
- Competing animations across multiple sections simultaneously
- Heavy scroll-tied parallax

---

## 14. SEO Checklist per Page

Before shipping any page:
- [ ] `<title>` set with `PageSEO`
- [ ] `<meta name="description">` set
- [ ] `<link rel="canonical">` set
- [ ] Open Graph tags set (title, description, image)
- [ ] One visible `<h1>` per page
- [ ] Heading hierarchy correct
- [ ] Images have `alt` text
- [ ] JSON-LD rendered where applicable
- [ ] Core content in DOM (not JS-only)
- [ ] Page not accidentally `noindex`-ed

---

## 15. Final Rule

A customer web page is successful when it:
- loads fast and scores well on Core Web Vitals
- communicates brand quality immediately
- supports easy product discovery
- guides users to checkout without friction
- feels premium and cohesive across every route
