# design-tokens.md

## 1. Purpose

This file defines the token system for `customer-web`.
All visual implementation must use tokens instead of arbitrary values.

Platform: **React Web — Tailwind CSS + CSS Custom Properties**.

---

## 2. Token Principles

1. No hardcoded visual values in component code.
2. Use semantic tokens at component level, not primitive tokens.
3. Keep the system flexible enough for richer hero and promo areas.
4. Dark mode must be achievable by swapping semantic token values only.
5. Tailwind config must reference CSS variables for all design tokens.

---

## 3. Token Layers

### Primitive tokens
Raw values defined in `tailwind.config.js`:
- color scales (Tailwind's default + brand extension)
- spacing (4px base)
- radius
- shadows

### Semantic tokens
Defined as CSS custom properties in `src/index.css`:
- background, text, border
- action (CTA) colors
- state colors
- surface variants
- motion timings

### Component tokens
Defined inline via Tailwind or as CSS classes in component files:
- `btn-primary`, `card-product`, `input-base`

---

## 4. CSS Variables — index.css

```css
:root {
  /* === Brand === */
  --color-brand: #4F46E5;
  --color-brand-hover: #4338CA;
  --color-brand-active: #3730A3;
  --color-brand-subtle: #EEF2FF;
  --color-brand-fg: #FFFFFF;

  /* === Background === */
  --bg-canvas: #F9FAFB;
  --bg-surface: #FFFFFF;
  --bg-surface-elevated: #FFFFFF;
  --bg-surface-hover: #F3F4F6;
  --bg-subtle: #F3F4F6;
  --bg-overlay: rgba(0, 0, 0, 0.4);
  --bg-promo: #1E1B4B;
  --bg-promo-elevated: #312E81;

  /* === Text === */
  --text-primary: #111827;
  --text-secondary: #6B7280;
  --text-tertiary: #9CA3AF;
  --text-inverse: #FFFFFF;
  --text-brand: #4F46E5;
  --text-price: #111827;
  --text-sale: #E11D48;
  --text-success: #15803D;
  --text-warning: #B45309;
  --text-danger: #B91C1C;
  --text-disabled: #D1D5DB;

  /* === Border === */
  --border-default: #E5E7EB;
  --border-subtle: #F3F4F6;
  --border-strong: #D1D5DB;
  --border-focus: #4F46E5;
  --border-brand: #4F46E5;
  --border-promo: #6366F1;
  --border-success: #22C55E;
  --border-warning: #F59E0B;
  --border-danger: #EF4444;

  /* === Action — Primary === */
  --action-primary-bg: #4F46E5;
  --action-primary-fg: #FFFFFF;
  --action-primary-border: transparent;
  --action-primary-hover: #4338CA;
  --action-primary-active: #3730A3;

  /* === Action — Secondary === */
  --action-secondary-bg: #FFFFFF;
  --action-secondary-fg: #111827;
  --action-secondary-border: #E5E7EB;
  --action-secondary-hover: #F9FAFB;
  --action-secondary-active: #F3F4F6;

  /* === Action — Ghost === */
  --action-ghost-bg: transparent;
  --action-ghost-fg: #4F46E5;
  --action-ghost-hover: #EEF2FF;
  --action-ghost-active: #E0E7FF;

  /* === Action — Danger === */
  --action-danger-bg: #EF4444;
  --action-danger-fg: #FFFFFF;
  --action-danger-hover: #DC2626;

  /* === State === */
  --state-success-bg: #F0FDF4;
  --state-success-fg: #15803D;
  --state-success-border: #22C55E;
  --state-warning-bg: #FFFBEB;
  --state-warning-fg: #B45309;
  --state-warning-border: #F59E0B;
  --state-danger-bg: #FEF2F2;
  --state-danger-fg: #B91C1C;
  --state-danger-border: #EF4444;
  --state-info-bg: #EFF6FF;
  --state-info-fg: #1D4ED8;
  --state-info-border: #3B82F6;

  /* === Radius === */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-btn: 10px;
  --radius-card: 16px;
  --radius-card-lg: 24px;
  --radius-full: 9999px;

  /* === Shadow === */
  --shadow-xs: 0 1px 3px rgba(0,0,0,0.06);
  --shadow-card: 0 4px 24px rgba(0,0,0,0.06);
  --shadow-card-hover: 0 12px 40px rgba(0,0,0,0.12);
  --shadow-modal: 0 20px 60px rgba(0,0,0,0.16);
  --shadow-sticky: 0 2px 16px rgba(0,0,0,0.08);
  --shadow-promo: 0 8px 32px rgba(79,70,229,0.24);

  /* === Motion === */
  --motion-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
  --motion-normal: 250ms cubic-bezier(0.4, 0, 0.2, 1);
  --motion-slow: 400ms cubic-bezier(0.4, 0, 0.2, 1);
  --motion-spring: 500ms cubic-bezier(0.34, 1.56, 0.64, 1);
  --motion-ease-enter: cubic-bezier(0, 0, 0.2, 1);
  --motion-ease-exit: cubic-bezier(0.4, 0, 1, 1);

  /* === Layout === */
  --layout-max-width: 1280px;
  --layout-page-px: clamp(16px, 5vw, 48px);
  --layout-section-gap: 80px;
  --layout-card-padding: 16px;
  --layout-grid-gap: 16px;
  --layout-hero-min-height: 600px;
  --layout-header-height: 64px;

  /* === Z-index === */
  --z-base: 0;
  --z-sticky: 10;
  --z-dropdown: 20;
  --z-overlay: 30;
  --z-drawer: 40;
  --z-modal: 50;
  --z-toast: 60;
  --z-tooltip: 70;
}

@screen md {
  :root {
    --layout-card-padding: 24px;
    --layout-grid-gap: 24px;
    --layout-section-gap: 96px;
  }
}
```

---

## 5. Tailwind Config Extension

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#EEF2FF',
          100: '#E0E7FF',
          500: '#6366F1',
          600: '#4F46E5',
          700: '#4338CA',
          900: '#1E1B4B',
        },
        sale: '#E11D48',
      },
      fontFamily: {
        heading: ['Playfair Display', 'serif'],
        body: ['DM Sans', 'sans-serif'],
      },
      boxShadow: {
        card: 'var(--shadow-card)',
        'card-hover': 'var(--shadow-card-hover)',
        modal: 'var(--shadow-modal)',
        sticky: 'var(--shadow-sticky)',
      },
      borderRadius: {
        btn: 'var(--radius-btn)',
        card: 'var(--radius-card)',
        'card-lg': 'var(--radius-card-lg)',
      },
      transitionTimingFunction: {
        spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
    },
  },
}
```

---

## 6. Typography Tokens

```css
/* Semantic type styles */
.type-display     { font-family: var(--font-heading); font-size: 3.5rem; font-weight: 700; line-height: 1.1; }
.type-hero-title  { font-family: var(--font-heading); font-size: 2.75rem; font-weight: 700; line-height: 1.15; }
.type-page-title  { font-family: var(--font-heading); font-size: 2rem; font-weight: 700; line-height: 1.2; }
.type-section-title { font-size: 1.5rem; font-weight: 600; line-height: 1.3; }
.type-product-title { font-size: 1rem; font-weight: 500; line-height: 1.4; }
.type-price       { font-size: 1.25rem; font-weight: 700; color: var(--text-price); }
.type-price-sale  { font-size: 1.25rem; font-weight: 700; color: var(--text-sale); }
.type-body        { font-size: 1rem; font-weight: 400; line-height: 1.6; }
.type-body-sm     { font-size: 0.875rem; font-weight: 400; line-height: 1.5; }
.type-label       { font-size: 0.75rem; font-weight: 500; }
.type-caption     { font-size: 0.75rem; font-weight: 400; color: var(--text-secondary); }
```

---

## 7. Component Token Groups

### Button
```css
.btn-base {
  height: 44px;
  padding: 0 20px;
  border-radius: var(--radius-btn);
  font-size: 0.875rem;
  font-weight: 600;
  transition: background var(--motion-fast), box-shadow var(--motion-fast), transform var(--motion-fast);
}
.btn-primary {
  background: var(--action-primary-bg);
  color: var(--action-primary-fg);
}
.btn-primary:hover {
  background: var(--action-primary-hover);
  box-shadow: 0 4px 16px rgba(79,70,229,0.3);
  transform: translateY(-1px);
}
```

### ProductCard
```css
.product-card {
  background: var(--bg-surface);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card);
  transition: box-shadow var(--motion-normal), transform var(--motion-normal);
  overflow: hidden;
}
.product-card:hover {
  box-shadow: var(--shadow-card-hover);
  transform: translateY(-4px);
}
```

### Input
```css
.input-base {
  height: 44px;
  padding: 0 16px;
  border-radius: var(--radius-md);
  border: 1.5px solid var(--border-default);
  background: var(--bg-surface);
  color: var(--text-primary);
  transition: border-color var(--motion-fast), box-shadow var(--motion-fast);
}
.input-base:focus {
  border-color: var(--border-focus);
  box-shadow: 0 0 0 3px rgba(79,70,229,0.12);
  outline: none;
}
.input-base.error {
  border-color: var(--border-danger);
}
```

---

## 8. Dark Mode Readiness

Even if not launched immediately, the token structure supports dark mode:

```css
[data-theme="dark"] {
  --bg-canvas: #0F0F13;
  --bg-surface: #1A1A24;
  --bg-surface-elevated: #222233;
  --text-primary: #F9FAFB;
  --text-secondary: #9CA3AF;
  --border-default: #2D2D44;
  /* ... all semantic tokens overridden here ... */
}
```

No component code changes required — only the CSS variable values change.

---

## 9. Governance Rules

Before adding a token:
1. Is it reusable across at least 2 components?
2. Is it semantic (meaning-based) or primitive (raw value)?
3. Does it belong in CSS variables (runtime-swappable) or Tailwind config (build-time)?
4. Is it needed for real repeated usage, not one special section?

Premium feel comes from token discipline — not random styling freedom.
