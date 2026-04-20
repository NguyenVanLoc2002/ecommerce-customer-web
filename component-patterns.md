# component-patterns.md

## 1. Purpose

This document defines component architecture and UI patterns for `customer-app`.

Components must be:
- reusable
- cohesive
- token-based
- accessible
- conversion-friendly
- visually polished

---

## 2. Core Principles

1. Build a coherent ecommerce UI system, not disconnected page widgets.
2. Keep base UI separate from domain logic.
3. Prefer composition and slots over one-off page implementations.
4. Components must define states clearly.
5. Product presentation should feel premium without becoming inconsistent.

---

## 3. Component Hierarchy

### Foundation primitives
- Box
- Stack
- Inline
- Grid
- Surface
- Text
- Heading
- Icon
- Divider

### Core UI components
- Button
- IconButton
- Input
- Textarea
- Select
- Checkbox
- Radio
- Switch
- Tabs
- Badge
- Tooltip
- Modal
- Drawer
- Dropdown
- Toast
- Pagination
- Card
- Avatar
- Skeleton

### Customer-specific patterns
- HeroSection
- SectionHeader
- ProductCard
- ProductMediaGallery
- PriceDisplay
- QuantitySelector
- CategoryTile
- PromoBanner
- CartItemCard
- CartSummary
- CheckoutSection
- OrderStatusBadge
- EmptyState
- ErrorState

---

## 4. Standard Component Contract

Each reusable component should define:
- purpose
- props
- variants
- sizes
- slots
- states
- accessibility behavior
- responsive behavior
- motion behavior if interactive

---

## 5. Naming Rules

### Variants
Use:
- `primary`
- `secondary`
- `ghost`
- `outline`
- `danger`
- `success`
- `warning`
- `link`

### Sizes
- `sm`
- `md`
- `lg`

### States
- default
- hover
- focus
- active
- selected
- disabled
- loading
- error
- success

---

## 6. Button Patterns

### Usage
- `primary`: main CTA such as add to cart, checkout, continue
- `secondary`: supporting actions
- `ghost` / `outline`: lower-emphasis actions
- `danger`: remove/delete/cancel actions only

### Rules
- CTA hierarchy must be obvious
- loading state must not shift layout
- buttons should feel tactile and premium
- focus state must remain visible

---

## 7. Input Patterns

Inputs are especially important in:
- auth
- address forms
- cart/checkout
- profile/account settings

### Structure
- label
- control
- helper/error text

### Rules
- maintain clean visual rhythm
- focus state must build confidence
- error states must be clear and calm
- avoid cramped field spacing

---

## 8. Product Card Patterns

Product cards are a primary component and must be standardized.

### Should support
- media area
- product title
- price
- badge/tag if relevant
- optional rating or secondary metadata
- CTA or quick action where appropriate

### Rules
- media ratio must stay consistent within a grid
- hover motion should feel refined
- title and price hierarchy must be clear
- cards should not vary wildly between pages

---

## 9. Hero and Promotional Patterns

### HeroSection
Supports:
- title
- subtitle
- primary CTA
- secondary CTA
- visual/media/3D area

### PromoBanner
Supports:
- campaign message
- short explanation
- CTA
- optional visual treatment

### Rules
- promo styling may be richer than regular content
- still must align with the same token system
- never let hero/promo treatment break overall consistency

---

## 10. Product Detail Patterns

### ProductMediaGallery
Supports:
- image gallery
- zoom/lightbox behavior if needed
- optional 3D/immersive visual block

### Purchase block
Should support:
- title
- price
- variant selectors
- stock/info badges
- quantity selector
- primary CTA
- secondary actions

### Rules
- purchase-critical information must remain obvious
- media should feel premium but not delay conversion

---

## 11. Cart and Checkout Patterns

### CartItemCard
Supports:
- thumbnail
- title
- variant summary
- price
- quantity controls
- remove action

### CartSummary
Supports:
- subtotal
- discounts
- shipping summary
- total
- main CTA

### CheckoutSection
Supports:
- title
- form/content area
- validation area
- summary relation

### Rules
- reduce visual noise
- keep trust and clarity high
- avoid decorative over-styling in checkout-critical areas

---

## 12. Motion Patterns

Customer motion can be slightly richer than admin.

### Approved
- card hover lift
- image/media transition polish
- section reveal
- CTA feedback
- modal/drawer reveal
- tab/filter transitions
- sticky CTA transitions

### Avoid
- excessive bouncing
- attention-seeking loops
- motion that makes product browsing tiring
- anything that slows checkout flow

---

## 13. 3D-Adjacent Patterns

If 3D is used, wrap it in dedicated presentational components such as:
- `HeroScene`
- `ProductShowcase3D`
- `BrandStoryScene`

Rules:
- must have fallback static mode
- must not own purchase logic
- must be lazy-loadable
- must not interfere with CTA visibility

---

## 14. Responsive Patterns

Components must explicitly define how they adapt:
- product grid density changes
- side summary becomes stacked/sticky
- modal may become drawer
- navigation may collapse
- product detail media/content rearranges cleanly

---

## 15. Accessibility Rules

Every interactive component must support:
- keyboard navigation
- visible focus state
- semantic roles where needed
- sufficient contrast
- clear disabled/error states

Reduced-motion preferences must be supported.

---

## 16. Anti-Patterns

Do not:
- create multiple inconsistent product-card styles
- over-design promotional sections at the cost of clarity
- hardcode one-off spacing and visual values
- use animation-heavy checkout controls
- mix business logic deeply into base presentation components

---

## 17. Definition of Done

A component is complete only when it has:
- token-based styling
- documented variants and states
- accessibility behavior
- responsive behavior
- clean reusable API
- motion consistent with the customer-app visual language
