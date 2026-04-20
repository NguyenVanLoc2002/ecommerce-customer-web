# design-tokens.md

## 1. Purpose

This file defines the token system for `customer-app`.
All visual implementation must use tokens instead of arbitrary values.

The token system must support:
- brand consistency
- premium presentation
- scalable components
- responsive commerce flows
- future theming

---

## 2. Token Principles

1. No hardcoded visual values in feature code unless justified.
2. Use semantic tokens at component level.
3. Keep the system flexible enough for richer hero and promo areas.
4. Reuse before creating new tokens.
5. Preserve consistency across browsing and conversion flows.

---

## 3. Token Layers

### Primitive tokens
Raw values:
- color scales
- spacing
- radius
- typography
- shadow
- motion

### Semantic tokens
Meaning-based tokens:
- background
- text
- border
- action
- state
- surface
- promotional emphasis

### Component tokens
Component-level mappings:
- button
- product-card
- input
- modal
- badge
- cart summary
- section block

---

## 4. Color Tokens

### Primitive palettes
Define:
- `color.neutral.0 ... 1000`
- `color.brand.50 ... 900`
- `color.success.50 ... 900`
- `color.warning.50 ... 900`
- `color.danger.50 ... 900`
- `color.info.50 ... 900` (optional)
- optional `color.accent.50 ... 900` only if the brand system truly needs a secondary accent

### Background tokens
- `bg.canvas`
- `bg.surface`
- `bg.surface-elevated`
- `bg.surface-hover`
- `bg.subtle`
- `bg.overlay`
- `bg.brand-subtle`
- `bg.promo`
- `bg.promo-elevated`
- `bg.success-subtle`
- `bg.warning-subtle`
- `bg.danger-subtle`

### Text tokens
- `text.primary`
- `text.secondary`
- `text.tertiary`
- `text.inverse`
- `text.brand`
- `text.price`
- `text.success`
- `text.warning`
- `text.danger`
- `text.disabled`

### Border tokens
- `border.default`
- `border.subtle`
- `border.strong`
- `border.focus`
- `border.brand`
- `border.promo`
- `border.success`
- `border.warning`
- `border.danger`

### Action tokens
- `action.primary.bg`
- `action.primary.fg`
- `action.primary.border`
- `action.primary.hover`
- `action.primary.active`

- `action.secondary.bg`
- `action.secondary.fg`
- `action.secondary.border`
- `action.secondary.hover`
- `action.secondary.active`

- `action.ghost.bg`
- `action.ghost.fg`
- `action.ghost.hover`
- `action.ghost.active`

- `action.danger.bg`
- `action.danger.fg`
- `action.danger.hover`

### State tokens
- `state.success.bg`
- `state.success.fg`
- `state.success.border`
- `state.warning.bg`
- `state.warning.fg`
- `state.warning.border`
- `state.danger.bg`
- `state.danger.fg`
- `state.danger.border`
- `state.info.bg`
- `state.info.fg`
- `state.info.border`

---

## 5. Typography Tokens

### Font families
- `font.family.sans`
- `font.family.heading`
- `font.family.mono`

### Font sizes
- `font.size.xs`
- `font.size.sm`
- `font.size.md`
- `font.size.lg`
- `font.size.xl`
- `font.size.2xl`
- `font.size.3xl`
- `font.size.4xl`
- `font.size.5xl`

### Font weights
- `font.weight.regular`
- `font.weight.medium`
- `font.weight.semibold`
- `font.weight.bold`

### Line heights
- `font.line-height.tight`
- `font.line-height.normal`
- `font.line-height.relaxed`

### Semantic typography
- `type.display`
- `type.hero-title`
- `type.page-title`
- `type.section-title`
- `type.product-title`
- `type.price`
- `type.body`
- `type.body-sm`
- `type.label`
- `type.caption`
- `type.button`

Typography can be slightly more expressive than admin, while staying clean.

---

## 6. Spacing Tokens

Use a shared rhythm based on 8px with micro-step support.

Define:
- `space.0`
- `space.1`
- `space.2`
- `space.3`
- `space.4`
- `space.5`
- `space.6`
- `space.8`
- `space.10`
- `space.12`
- `space.16`
- `space.20`
- `space.24`
- `space.32`

Semantic layout tokens:
- `layout.page-padding`
- `layout.section-gap`
- `layout.card-padding`
- `layout.product-grid-gap`
- `layout.hero-padding`
- `layout.form-gap`

---

## 7. Radius Tokens

Define:
- `radius.none`
- `radius.sm`
- `radius.md`
- `radius.lg`
- `radius.xl`
- `radius.2xl`
- `radius.full`

Guidance:
- controls: `md`
- buttons: `md` / `lg`
- cards: `lg` / `xl`
- hero, promo, premium surfaces: `xl` / `2xl`

---

## 8. Border Tokens

### Widths
- `border.width.none`
- `border.width.thin`
- `border.width.default`
- `border.width.strong`

Use semantic border tokens in implementation.

---

## 9. Shadow Tokens

Define:
- `shadow.xs`
- `shadow.sm`
- `shadow.md`
- `shadow.lg`
- `shadow.xl`

Semantic elevation:
- `elevation.surface`
- `elevation.hover`
- `elevation.overlay`
- `elevation.modal`
- `elevation.promo`

Customer surfaces may use richer elevation than admin, but must remain consistent.

---

## 10. Motion Tokens

### Durations
- `motion.duration.instant`
- `motion.duration.fast`
- `motion.duration.normal`
- `motion.duration.slow`

### Easing
- `motion.ease.standard`
- `motion.ease.enter`
- `motion.ease.exit`
- `motion.ease.emphasized`

### Distances
- `motion.distance.sm`
- `motion.distance.md`
- `motion.distance.lg`

### Scales
- `motion.scale.hover`
- `motion.scale.press`
- `motion.scale.enter`
- `motion.scale.card-hover`

---

## 11. Z-Index Tokens

- `z.base`
- `z.dropdown`
- `z.sticky`
- `z.overlay`
- `z.modal`
- `z.toast`
- `z.tooltip`
- `z.header`

---

## 12. Breakpoint Tokens

- `breakpoint.xs`
- `breakpoint.sm`
- `breakpoint.md`
- `breakpoint.lg`
- `breakpoint.xl`
- `breakpoint.2xl`

---

## 13. Layout Tokens

- `layout.page.max-width`
- `layout.content.max-width`
- `layout.hero.max-width`
- `layout.header.height`
- `layout.container.padding-x`
- `layout.section.gap`
- `layout.grid.gap`
- `layout.product-card.media-ratio`

---

## 14. Component Token Groups

### Button
- height
- padding
- radius
- typography
- bg
- fg
- border
- hover
- active
- disabled
- loading
- focus-ring

### Input
- height
- padding
- radius
- bg
- text
- placeholder
- border
- hover
- focus
- error
- disabled

### ProductCard
- bg
- border
- radius
- shadow
- hover-shadow
- media-radius
- content-padding
- title-style
- price-style

### SectionBlock
- bg
- radius
- padding
- title-style
- description-style

### Modal / Drawer
- overlay-bg
- bg
- radius
- shadow
- header-padding
- body-padding
- footer-padding

### CartSummary
- bg
- border
- radius
- padding
- shadow

---

## 15. Dark Mode Readiness

Even if not implemented immediately:
- semantic token names must remain stable
- primitive values may vary by theme
- components must consume semantic tokens only

---

## 16. Governance Rules

Before adding a token, ask:
1. Is it reusable?
2. Is it semantic or primitive?
3. Does it preserve brand consistency?
4. Is it needed for real repeated usage, not one special section?

A premium feel comes from token discipline, not random styling freedom.
