# Design System — Fashion Shop Customer Web App

> Platform: React Web (Tailwind CSS + CSS Variables)
> Scope: Customer-facing web app only.

---

## 1. Visual Direction

**Brand personality**: Clean, modern, fashion-forward. Prioritises content over chrome. White space is generous. Colour is used intentionally to convey state, not decoration.

**Layout principle**: Max-width container centered on desktop. Responsive grid. Cards have subtle elevation and smooth hover states. CTAs are always prominent and reachable.

---

## 2. Color Roles

### Brand / Primary

| Role | CSS Variable | Tailwind Class | Hex | Usage |
|---|---|---|---|---|
| Primary | `--color-brand` | `bg-indigo-600` | `#4F46E5` | Primary buttons, active nav, links, selected states |
| Primary hover | `--color-brand-hover` | `bg-indigo-700` | `#4338CA` | Button hover |
| Primary light | `--color-brand-subtle` | `bg-indigo-50` | `#EEF2FF` | Chip backgrounds, highlights |

### Neutrals

| Role | CSS Variable | Hex | Usage |
|---|---|---|---|
| Canvas | `--color-canvas` | `#F9FAFB` | Page background |
| Surface | `--color-surface` | `#FFFFFF` | Cards, inputs, modals |
| Border | `--color-border` | `#E5E7EB` | Card borders, dividers |
| Text primary | `--color-text-primary` | `#111827` | Headings, body |
| Text secondary | `--color-text-secondary` | `#6B7280` | Labels, captions |
| Text disabled | `--color-text-disabled` | `#D1D5DB` | Disabled states |

### Semantic / Status

| Role | Hex | Usage |
|---|---|---|
| Success | `#22C55E` / `#15803D` | COMPLETED, DELIVERED, PAID |
| Warning | `#FBBF24` / `#B45309` | PENDING, OUT_FOR_DELIVERY |
| Danger | `#EF4444` / `#B91C1C` | CANCELLED, FAILED, destructive |
| Info | `#3B82F6` / `#1D4ED8` | CONFIRMED, PROCESSING, IN_TRANSIT |

### Accent / Commerce

| Role | Class | Usage |
|---|---|---|
| Sale price | `text-rose-600` | Sale price in cards and PDP |
| Original price | `text-gray-400 line-through` | Crossed-out original price |
| Sale badge | `bg-rose-500 text-white` | Product card badge |
| Featured badge | `bg-indigo-500 text-white` | Featured products |

---

## 3. Typography

Use Google Fonts or system stack. Import via `index.html`.

**Recommended pairing:**
- Display / Heading: `Playfair Display` or `DM Serif Display` — elegant, editorial
- Body: `DM Sans` or `Plus Jakarta Sans` — clean, modern, readable

### Scale

| Token | Size (rem) | Weight | Usage |
|---|---|---|---|
| `display` | 3.5rem (56px) | 700 | Hero headline |
| `heading-1` | 2.25rem (36px) | 700 | Page titles |
| `heading-2` | 1.5rem (24px) | 600 | Section titles |
| `heading-3` | 1.125rem (18px) | 600 | Card titles, sub-sections |
| `body-lg` | 1rem (16px) | 400 | Primary body |
| `body` | 0.875rem (14px) | 400 | Secondary body |
| `label` | 0.75rem (12px) | 500 | Labels, captions |
| `price` | 1.25rem (20px) | 700 | Product price |
| `price-sm` | 1rem (16px) | 600 | Card price |

---

## 4. Spacing

Base unit: 4px. Scale: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 128px.

Tailwind classes: `p-1` (4px) through `p-32` (128px).

### Layout tokens

| Token | Value | Usage |
|---|---|---|
| `--layout-page-px` | `clamp(16px, 5vw, 48px)` | Horizontal page padding |
| `--layout-max-width` | `1280px` | Max content width |
| `--layout-section-gap` | `80px` (desktop), `48px` (mobile) | Between page sections |
| `--layout-card-padding` | `16px` (mobile), `24px` (desktop) | Card inner padding |
| `--layout-grid-gap` | `16px` (mobile), `24px` (desktop) | Product grid gap |

---

## 5. Radius

| Token | Value | Usage |
|---|---|---|
| `--radius-sm` | `4px` | Chips, tags |
| `--radius-md` | `8px` | Inputs, small buttons |
| `--radius-btn` | `10px` | Standard buttons |
| `--radius-card` | `16px` | Product cards |
| `--radius-card-lg` | `24px` | Hero cards, promo blocks |
| `--radius-full` | `9999px` | Pills, avatar |

---

## 6. Shadows

| Token | Value | Usage |
|---|---|---|
| `--shadow-xs` | `0 1px 3px rgba(0,0,0,0.06)` | Subtle border-like |
| `--shadow-card` | `0 4px 24px rgba(0,0,0,0.06)` | Product cards (default) |
| `--shadow-card-hover` | `0 12px 40px rgba(0,0,0,0.12)` | Card hover state |
| `--shadow-modal` | `0 20px 60px rgba(0,0,0,0.16)` | Modals, drawers |
| `--shadow-sticky` | `0 2px 16px rgba(0,0,0,0.08)` | Sticky header/cart bar |

---

## 7. Motion

### Variables
```css
--motion-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
--motion-normal: 250ms cubic-bezier(0.4, 0, 0.2, 1);
--motion-slow: 400ms cubic-bezier(0.4, 0, 0.2, 1);
--motion-spring: 500ms cubic-bezier(0.34, 1.56, 0.64, 1);
```

### Framer Motion presets

```ts
// Page fade in
export const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.25 } },
}

// Stagger children
export const staggerContainer = {
  animate: { transition: { staggerChildren: 0.08 } }
}

// Card reveal
export const cardVariants = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4 } }
}

// Modal
export const modalVariants = {
  initial: { opacity: 0, scale: 0.96 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, scale: 0.96, transition: { duration: 0.15 } }
}
```

### Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 8. Component States

Every component must define:

| State | Visual treatment |
|---|---|
| Default | Base style |
| Hover | Lift shadow + brand tint |
| Focus | `outline: 2px solid var(--color-brand)` + `outline-offset: 2px` |
| Active | Compressed/darker |
| Disabled | 50% opacity, `cursor-not-allowed` |
| Loading | Spinner or skeleton, no layout shift |
| Error | Red border + error text below |
| Success | Green border + success text below |

---

## 9. Breakpoints

| Name | Min Width | Use |
|---|---|---|
| `sm` | 640px | Large phones |
| `md` | 768px | Tablets |
| `lg` | 1024px | Small laptops |
| `xl` | 1280px | Desktop |
| `2xl` | 1536px | Large screens |

Mobile-first: base styles = mobile, breakpoint prefixes = scale up.

---

## 10. Grid System

### Product Grid
```css
/* Mobile: 2 columns | Tablet: 3 | Desktop: 4 */
grid-template-columns: repeat(2, 1fr);         /* default */
@screen md { grid-template-columns: repeat(3, 1fr); }
@screen xl { grid-template-columns: repeat(4, 1fr); }
```

### Layout Grid
```css
/* Content max-width centered */
max-width: var(--layout-max-width);
margin-inline: auto;
padding-inline: var(--layout-page-px);
```

---

## 11. Z-Index Scale

| Token | Value | Usage |
|---|---|---|
| `--z-base` | 0 | Default flow |
| `--z-sticky` | 10 | Sticky header |
| `--z-dropdown` | 20 | Dropdowns |
| `--z-overlay` | 30 | Backdrop |
| `--z-drawer` | 40 | Side drawers |
| `--z-modal` | 50 | Modals |
| `--z-toast` | 60 | Toast notifications |
| `--z-tooltip` | 70 | Tooltips |

---

## 12. Icon Rules

- Use `lucide-react` exclusively.
- Size: `16px` (inline), `20px` (button), `24px` (standalone).
- Icon-only buttons must have `aria-label`.
- Never use emoji as UI icons.

---

## 13. Image Rules

- Always define `width` + `height` to prevent CLS.
- Use `object-fit: cover` inside fixed-ratio containers.
- Use `aspect-ratio` CSS to maintain product image ratios.
- Lazy load all images below the fold: `loading="lazy"`.
- Hero / first product image: `loading="eager"` + `fetchpriority="high"`.
- Always provide meaningful `alt` text.

---

## 14. Dark Mode Readiness

Even if not implemented immediately:
- All colors must go through CSS variables, not hardcoded Tailwind hex.
- Component code must consume only semantic variables.
- A `[data-theme="dark"]` CSS class switch must be the only change needed.
