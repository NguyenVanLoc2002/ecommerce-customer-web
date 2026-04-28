# visual-direction.md

## 1. Purpose

This file defines the visual identity for `customer-web`.

The web customer experience must feel:
- modern and editorial
- premium and trustworthy
- inviting and smooth
- conversion-friendly at every step

This is the visual source of truth for layout feel, hierarchy, atmosphere, motion tone, and depth treatment.

---

## 2. Product Expression

`customer-web` is a fashion commerce web experience.
Users arrive from search, social, or direct — first impressions matter enormously.

The UI must help users:
- immediately understand this is a premium fashion brand
- discover products with ease and delight
- trust the platform
- complete checkout with confidence

The web experience should feel richer than a generic e-commerce template, yet disciplined and performance-conscious.

---

## 3. Design Philosophy

### Core principles

1. **Editorial confidence**
   - Think magazine meets online store.
   - Large typography, curated white space, premium imagery.

2. **Emotion with restraint**
   - Beautiful moments in hero and campaign sections.
   - Clean, fast, and direct in browsing and checkout.

3. **Consistency across the journey**
   - Homepage → PLP → PDP → Cart → Checkout must feel like one system.
   - Visual richness tapers off as conversion intent increases.

4. **Motion as brand language**
   - Smooth page transitions, card reveals, hover states.
   - Motion should communicate quality, not distract from buying.

5. **SEO-ready structure**
   - Semantic HTML, clear heading hierarchy, structured data.
   - Performance (Core Web Vitals) is part of visual quality.

---

## 4. Visual Keywords

Use:
- premium, editorial, clean
- elegant, curated, modern
- inviting, smooth, layered
- trustworthy, conversion-focused

Avoid:
- cluttered promo-heavy layouts
- random bright color blocks
- inconsistent card treatments
- excessive novelty effects that hurt usability

---

## 5. Layout Direction

### Overall character
Pages should feel breathable, modular, and scroll-friendly.

### Desktop
- Max-width container: 1280px, centered.
- Generous horizontal padding: `clamp(16px, 5vw, 48px)`.
- Section gaps: 80–96px vertical rhythm.
- Product grids: 2 → 3 → 4 columns across breakpoints.

### Mobile
- Full-width with 16px padding.
- 2-column product grid.
- Sticky elements: header, cart bar, buy CTA on PDP.

### Preferred patterns
- Full-width hero with large type + editorial image composition
- Category strip or grid for discovery
- Product grid with filter/sort sidebar (desktop) or drawer (mobile)
- Sticky add-to-cart bar on product detail
- Single-column checkout with persistent order summary

---

## 6. Surface and Depth Style

### Surface
- Light neutral canvas (`#F9FAFB`) for pages
- Pure white (`#FFFFFF`) for cards, panels, modals
- Rich dark surface (`#1E1B4B`) for hero/promo zones

### Depth
- Soft box-shadows for cards
- Elevated card on hover (shadow + slight translate)
- Gradient overlays on hero images
- Backdrop blur for modal overlays

Avoid: excessive glassmorphism across the entire interface.

---

## 7. Color Direction

### Base strategy
- Neutral white/grey canvas keeps focus on products.
- Brand indigo (`#4F46E5`) anchors CTAs and interactive elements.
- Rich dark navy (`#1E1B4B`) for hero/campaign zones.
- Warm rose (`#E11D48`) for sale and urgency states.

### Gradients (hero/promo zones only)
- `linear-gradient(135deg, #1E1B4B 0%, #312E81 100%)` — primary hero dark
- `linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)` — brand gradient accent
- Keep gradients subtle in browsing zones.

---

## 8. Typography Direction

### Font pairing
- **Headings**: `Playfair Display` — editorial elegance
- **Body**: `DM Sans` — clean, modern readability

### Rules
- Hero headline: large display type, high contrast, commanding
- Section titles: bold but not oversized
- Product titles: clear, scannable, consistent size
- Price: always visually distinct (weight + placement)
- Long descriptions: generous line-height (1.6+), readable measure (max 70ch)

---

## 9. Hero Section Style

The homepage hero sets the entire brand tone.

### Approach options (choose one per campaign)
1. **Editorial fullscreen** — large type on left, editorial fashion image on right/background
2. **Dark immersive** — dark navy background, white headline, accent CTA
3. **3D accent** — subtle animated 3D element as background enhancement (optional)
4. **Video background** — ambient fashion video loop, low opacity, text above

### Rules
- Above-the-fold: brand name/tagline + primary CTA always visible
- Hero height: `min-height: 600px`, ideally full viewport on desktop
- CTA must be high contrast and immediately clickable
- Hero image: `loading="eager"` + `fetchpriority="high"` for LCP

---

## 10. Product Card Style

Product cards are the backbone of the browsing experience.

### Anatomy
1. Image zone (fixed ratio, `aspect-ratio: 3/4`)
2. Badge area (Sale, New, Featured — top-left overlay)
3. Title (1-2 lines, ellipsis)
4. Price (sale + original if discounted)
5. Optional: Quick Add button on hover

### Rules
- Hover: card lifts (shadow + 4px translate), image scales slightly (1.04)
- Image transitions: smooth `300ms ease`
- CTA on hover: fade in "Quick Add" button
- Consistent card height within a grid row
- Responsive: 2 cols mobile → 3 tablet → 4 desktop

---

## 11. Motion Direction

### Motion style
- Smooth fade + translate for page entries
- Card lift on hover
- Filter/drawer slide-in with backdrop fade
- Stagger for product grids (8ms per card)
- Scroll-triggered reveals for homepage sections

### Motion hierarchy
1. **Primary** (hero, page transition): slower, more theatrical — 400ms
2. **Secondary** (cards, drawers): smooth, purposeful — 250ms
3. **Micro** (hover, press): immediate, tactile — 150ms

### Avoid
- Competing animations in the same viewport
- Motion near checkout form controls
- Parallax that hurts scrolling performance

---

## 12. 3D Direction

3D is optional and always lazy-loaded.

### Suitable uses
- Homepage hero (subtle ambient scene)
- Featured product spotlight
- Campaign section
- Brand/about section

### Rules
- Always provide static fallback image
- Never block LCP
- Never obscure CTAs
- Must feel elegant — no game-like aesthetics
- Lazy load behind `React.lazy` + `Suspense`

---

## 13. SEO Visual Rules

Visual structure must support SEO:
- One `<h1>` per page — visible, not hidden
- Heading hierarchy: `h1 → h2 → h3` — never skip levels
- Hero image: real `<img>` tag with descriptive `alt`, not CSS background
- Product names in semantic `<h2>` or `<h3>` on listing pages
- Breadcrumbs: visible `<nav>` with JSON-LD markup

---

## 14. Accessibility Expectations

- All text passes WCAG AA contrast (4.5:1 for body, 3:1 for large text)
- Focus rings visible and on-brand (indigo outline)
- Motion respects `prefers-reduced-motion`
- No information conveyed by color alone
- Checkout and cart flows: highest legibility standard

---

## 15. Final Standard

A strong customer web page should feel:
- premium the moment it loads
- fast and focused for shopping
- trustworthy at checkout
- consistent from first visit to order confirmation

When in doubt:
- choose clarity over spectacle
- choose cohesion over variety
- choose fast over fancy
