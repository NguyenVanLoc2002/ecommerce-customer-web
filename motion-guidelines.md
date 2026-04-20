# motion-guidelines.md

## 1. Purpose

This document defines motion principles for `customer-app`.

Motion should support:
- perceived quality
- browsing smoothness
- interaction feedback
- continuity between sections and states
- tasteful brand expression

---

## 2. Motion Philosophy

Customer motion should feel:
- smooth
- premium
- tactile
- elegant
- controlled

It may be richer than admin, but it must remain disciplined and conversion-aware.

---

## 3. Core Motion Principles

1. Motion should improve experience, not distract from shopping.
2. Interactive feedback should feel immediate and polished.
3. Browsing transitions should feel calm and continuous.
4. Conversion-critical flows must stay clear and fast.
5. Reduced-motion preferences must always be respected.

---

## 4. Approved Motion Types

### Micro-interactions
Use for:
- button hover/press
- card hover
- image hover
- quantity control interaction
- tab switches
- wishlist/save feedback

### Reveal/hide motion
Use for:
- filter drawer
- accordion details
- cart drawer
- sort menu
- modal/drawer surfaces

### Content transition
Use for:
- product grid updates
- image gallery changes
- tab content changes
- route/page intro
- section reveal on scroll in moderation

### Emphasis motion
Use selectively for:
- hero reveal
- featured product spotlight
- promotional storytelling zones

---

## 5. Motion Style

Preferred effects:
- fade
- soft translate
- subtle scale
- elevation change
- image/content interpolation
- restrained stagger where truly helpful

Avoid:
- bounce-heavy animation
- exaggerated elastic behavior
- aggressive zooming
- overly theatrical transitions on shopping flows

---

## 6. Timing Guidance

### Fast
Use for:
- hover
- press
- icon state changes
- quick feedback

### Normal
Use for:
- drawers
- modals
- section reveal
- content replacement

### Slow
Use sparingly for:
- hero or premium storytelling moments only

Do not use slow motion in cart or checkout-critical interactions.

---

## 7. Easing Guidance

Use smooth premium easings:
- standard easing for most transitions
- enter/exit easing for surfaces
- emphasized easing only in hero/promo moments

Avoid overly springy motion unless it is very restrained.

---

## 8. Component-Level Rules

### Buttons
- hover: subtle lift or tonal change
- press: slight compression/active depth
- loading: preserve width and label alignment

### Product cards
- may lift slightly on hover
- image may scale subtly or shift gently
- motion must remain consistent across grids

### Inputs
- focus transition should feel clean and confidence-building
- error states should appear clearly without drama

### Drawers/modals
- backdrop fades in/out
- content enters with short fade + translate/scale
- exit should feel slightly faster than entry

---

## 9. Page-Level Rules

### Allowed
- gentle hero intro
- section reveal on homepage
- product-grid update transitions
- sticky CTA transitions
- smooth media changes on product detail

### Use carefully
- parallax
- scroll-tied hero effects
- promotional motion layers

### Avoid
- multiple competing animated sections on one screen
- distracting movement near CTA or form fields
- showy transitions in checkout/account flows

---

## 10. Loading Motion

Prefer:
- skeletons for cards, product grids, and content blocks
- subtle spinner for small actions
- calm progress feedback

Avoid:
- flashy loaders
- loader patterns that feel game-like or noisy

---

## 11. State Change Motion

Motion should help users understand:
- an item was added to cart
- a wishlist action succeeded
- a filter changed results
- a drawer opened
- content switched smoothly

Combine motion with strong visual feedback, not motion alone.

---

## 12. Reduced Motion

In reduced-motion mode:
- remove decorative reveal effects
- reduce distances
- avoid scale theatrics
- keep only essential state feedback

---

## 13. Anti-Patterns

Do not:
- animate every product card aggressively
- overuse staggered reveals
- make product browsing feel slow
- add strong motion to checkout controls
- use motion as a substitute for clear hierarchy

---

## 14. Final Rule

If motion improves polish, continuity, or confidence, keep it.
If it distracts from browsing or buying, remove it.
