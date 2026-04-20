# 3d-guidelines.md

## 1. Purpose

This document defines how 3D may be used in `customer-app`.

In customer-app, 3D is allowed as a selective enhancement for premium storytelling and product presentation.
It is not a default requirement for all pages.

---

## 2. Role of 3D in Customer Experience

3D may help communicate:
- premium brand identity
- product depth or materiality
- featured campaigns
- immersive hero storytelling

But it must never reduce:
- readability
- performance
- conversion clarity
- ease of browsing

---

## 3. Recommended Use Cases

3D is most suitable for:
- homepage hero
- featured launch/campaign section
- premium product storytelling block
- product detail showcase for selected products
- brand story or about section

---

## 4. Not Recommended

Do not use 3D in:
- checkout forms
- cart summary
- authentication forms
- dense account management pages
- utility-only pages
- empty/error/loading states unless purely decorative and lightweight

---

## 5. Performance Rules

If 3D is used:
- lazy-load it
- provide static or 2D fallback
- avoid blocking core content rendering
- keep asset size optimized
- keep scene complexity controlled
- test on lower-end consumer devices

3D must be enhancement, not dependency.

---

## 6. Interaction Rules

3D must never:
- hide key CTA areas
- delay product information visibility
- become the only way to understand the product
- distract near purchase-critical actions

The product title, price, variants, and CTA must remain dominant.

---

## 7. Visual Style Rules

3D should feel:
- elegant
- modern
- premium
- lightweight
- aligned with brand colors and surface language

Avoid:
- game-like aesthetics
- noisy materials
- excessive bloom/glow
- aggressive camera movement
- constant spinning objects that steal attention

---

## 8. Motion Rules for 3D

If animated:
- prefer subtle ambient drift
- keep loops calm and short
- use small camera motion only
- minimize activity when not central to the screen
- respect reduced-motion preferences

---

## 9. Implementation Guidance

Preferred approach:
- isolate 3D into dedicated presentational components
- expose simple props to page code
- separate 3D rendering from product/business logic
- ensure fallback rendering path is always available

Suggested component examples:
- `HeroScene`
- `ProductShowcase3D`
- `BrandStoryScene`

---

## 10. Approval Standard

Before using 3D, ask:
1. Does it strengthen premium storytelling?
2. Is it relevant to the product or campaign?
3. Can the page still work perfectly without it?
4. Does it preserve performance and CTA clarity?

If the answer is no, do not use 3D.

---

## 11. Final Rule

For `customer-app`, 3D can be a premium accent.
It should create selective wow moments, not become the default interface language.
