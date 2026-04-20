# Design System — Fashion Shop Customer Mobile App

> Platform: React Native (NativeWind / Tailwind-style classes)
> Scope: Customer-facing mobile app only.

---

## 1. Visual Direction

**Brand personality**: Clean, modern, fashion-forward. Prioritises content over chrome. White space is generous. Colour is used intentionally to convey state, not decoration.

**Layout principle**: Single-column on mobile. Content fills the screen width with consistent horizontal padding. Cards have subtle elevation. Actions are always reachable with one thumb.

---

## 2. Color Roles

### Brand / Primary

| Role | Class / Value | Usage |
|---|---|---|
| Primary | `bg-indigo-600` / `#4F46E5` | Primary buttons, active tab indicator, links, selected states |
| Primary light | `bg-indigo-50` / `#EEF2FF` | Chip background, subtle highlight |
| Primary dark | `bg-indigo-700` / `#4338CA` | Button pressed state |

### Neutrals

| Role | Class / Value | Usage |
|---|---|---|
| Background | `bg-gray-50` / `#F9FAFB` | Screen background |
| Surface | `bg-white` / `#FFFFFF` | Cards, inputs, bottom sheets |
| Border | `border-gray-200` / `#E5E7EB` | Card borders, input borders, dividers |
| Text primary | `text-gray-900` / `#111827` | Headings, body text |
| Text secondary | `text-gray-500` / `#6B7280` | Labels, captions, placeholders |
| Text disabled | `text-gray-300` / `#D1D5DB` | Disabled inputs and buttons |

### Semantic / Status

| Role | Class | Hex | Usage |
|---|---|---|---|
| Success (green) | `bg-green-500` / `text-green-700` | `#22C55E` / `#15803D` | COMPLETED, DELIVERED, PAID, APPROVED |
| Warning (amber) | `bg-amber-400` / `text-amber-700` | `#FBBF24` / `#B45309` | PENDING (COD), OUT_FOR_DELIVERY, stale items |
| Danger (red) | `bg-red-500` / `text-red-700` | `#EF4444` / `#B91C1C` | CANCELLED, FAILED, RETURNED, REJECTED, destructive |
| Info (blue) | `bg-blue-500` / `text-blue-700` | `#3B82F6` / `#1D4ED8` | CONFIRMED, PROCESSING, IN_TRANSIT |
| Orange | `bg-orange-500` / `text-orange-700` | `#F97316` / `#C2410C` | AWAITING_PAYMENT |
| Teal | `bg-teal-500` / `text-teal-700` | `#14B8A6` / `#0F766E` | SHIPPED |
| Grey (neutral) | `bg-gray-400` / `text-gray-500` | `#9CA3AF` / `#6B7280` | REFUNDED, PENDING shipment |

### Accent / Sale

| Role | Class | Usage |
|---|---|---|
| Sale price | `text-rose-600` | `salePrice` in product cards and detail |
| Strikethrough price | `text-gray-400 line-through` | Original `price` when sale is active |
| "Sale" badge | `bg-rose-500 text-white` | Badge on product cards |
| "Featured" badge | `bg-indigo-500 text-white` | Featured products |

### Unread / Notification

| Role | Class | Usage |
|---|---|---|
| Unread dot | `bg-blue-500` | Notification unread indicator |
| Unread border | `border-l-4 border-blue-500` | Unread row left border |
| Badge count | `bg-red-500 text-white` | Tab icon badge |

---

## 3. Typography

Use system fonts. NativeWind maps to the device's native font stack.

### Hierarchy

| Token | Size | Weight | Line Height | Usage |
|---|---|---|---|---|
| `display` | 28 sp | 700 | 34 | Screen titles (Order Confirmation, Payment Result) |
| `heading-1` | 22 sp | 700 | 28 | Page headings |
| `heading-2` | 18 sp | 600 | 24 | Section headings, card titles |
| `heading-3` | 16 sp | 600 | 22 | Sub-section labels |
| `body-lg` | 16 sp | 400 | 24 | Primary body text |
| `body` | 14 sp | 400 | 20 | Secondary body, list items |
| `caption` | 12 sp | 400 | 16 | Labels, timestamps, captions |
| `label` | 12 sp | 600 | 16 | Input labels, chip text |
| `code` | 13 sp | 400 | 18 | Monospace (order codes, SKUs) — use `font-mono` |

### NativeWind class equivalents

| Token | NativeWind |
|---|---|
| `display` | `text-2xl font-bold` |
| `heading-1` | `text-xl font-bold` |
| `heading-2` | `text-lg font-semibold` |
| `heading-3` | `text-base font-semibold` |
| `body-lg` | `text-base font-normal` |
| `body` | `text-sm font-normal` |
| `caption` | `text-xs font-normal` |
| `label` | `text-xs font-semibold` |
| `code` | `text-sm font-mono` |

---

## 4. Spacing Scale

Base unit: 4 dp.

| Token | Value | NativeWind |
|---|---|---|
| `xs` | 4 dp | `p-1`, `gap-1` |
| `sm` | 8 dp | `p-2`, `gap-2` |
| `md` | 12 dp | `p-3`, `gap-3` |
| `base` | 16 dp | `p-4`, `gap-4` |
| `lg` | 20 dp | `p-5`, `gap-5` |
| `xl` | 24 dp | `p-6`, `gap-6` |
| `2xl` | 32 dp | `p-8`, `gap-8` |
| `3xl` | 48 dp | `p-12`, `gap-12` |

**Screen horizontal padding**: `px-4` (16 dp) on all screens.
**Section vertical spacing**: `py-4` between sections.
**Card internal padding**: `p-4` (16 dp).
**List item vertical padding**: `py-3` (12 dp).

---

## 5. Border Radius

| Token | Value | NativeWind | Usage |
|---|---|---|---|
| `sm` | 4 dp | `rounded` | Chips, badges, small inputs |
| `md` | 8 dp | `rounded-lg` | Cards, inputs, buttons |
| `lg` | 12 dp | `rounded-xl` | Bottom sheets, modals |
| `xl` | 16 dp | `rounded-2xl` | Large cards, image containers |
| `full` | 999 dp | `rounded-full` | Avatars, circular badges, pill buttons |

---

## 6. Shadows / Elevation

| Token | Usage | NativeWind |
|---|---|---|
| `shadow-none` | Flat sections | — |
| `shadow-sm` | Subtle card lift | `shadow shadow-gray-200` |
| `shadow-md` | Interactive cards, selected states | `shadow-md shadow-gray-300` |
| `shadow-lg` | Bottom sheets, floating elements | `shadow-lg shadow-gray-400` |

On Android: use `elevation` prop (2, 4, 8 respectively).

---

## 7. Reusable UI Primitives

### Button

```
Variants:   primary | secondary | outline | ghost | destructive
Sizes:      sm (h-9) | md (h-11) | lg (h-13, full-width default)
States:     default | loading (spinner replaces label) | disabled (40% opacity)
```

Rules:
- Primary CTA at bottom of screen is always full-width `h-13`.
- Loading state: disable the button, show `ActivityIndicator` in place of label text.
- Destructive variant: red background (`bg-red-600`), white text.

### Input

```
States:   default | focused (primary border) | error (red border + error message below) | disabled
```

Rules:
- Label sits above the input field.
- Error message in `text-red-600 text-xs` below the field.
- Password input: always includes a show/hide toggle (`text-gray-400` eye icon).
- Disabled: `bg-gray-100 text-gray-400`.

### Badge

Inline status indicator. No interactive behaviour.

```
Variants:  success | warning | danger | info | orange | teal | grey
Size:      always small (text-xs, px-2 py-0.5, rounded-full)
```

See Section 8 for status-to-variant mapping.

### Avatar

```
Sizes:    sm (32 dp) | md (40 dp) | lg (56 dp)
Fallback: initials (first letter of first + last name), bg-gray-200, text-gray-600
```

### Divider

Horizontal `<View>` with `h-px bg-gray-200`. Used between list sections.

---

## 8. Status Badge System

### Order Status

| Status | Badge Variant | Label |
|---|---|---|
| `PENDING` | `warning` (amber) | Pending |
| `AWAITING_PAYMENT` | `orange` | Awaiting Payment |
| `CONFIRMED` | `info` (blue) | Confirmed |
| `PROCESSING` | `info` (blue) | Processing |
| `SHIPPED` | `teal` | Shipped |
| `DELIVERED` | `success` (green) | Delivered |
| `COMPLETED` | `success` (green) | Completed |
| `CANCELLED` | `danger` (red) | Cancelled |
| `REFUNDED` | `grey` | Refunded |

### Payment Status

| Status | Badge Variant | Label |
|---|---|---|
| `PENDING` | `warning` | Unpaid |
| `INITIATED` | `orange` | Processing |
| `PAID` | `success` | Paid |
| `FAILED` | `danger` | Failed |

### Shipment Status

| Status | Badge Variant | Progress Bar Colour | Label |
|---|---|---|---|
| `PENDING` | `grey` | grey | Preparing |
| `IN_TRANSIT` | `info` | blue | In Transit |
| `OUT_FOR_DELIVERY` | `warning` | amber | Out for Delivery |
| `DELIVERED` | `success` | green | Delivered |
| `FAILED` | `danger` | red | Delivery Failed |
| `RETURNED` | `danger` | red | Returned |

### Review Status

| Status | Badge Variant | Label |
|---|---|---|
| `PENDING` | `warning` | Under Review |
| `APPROVED` | `success` | Published |
| `REJECTED` | `danger` | Not Approved |

### Address Type

| Type | Badge Variant | Label |
|---|---|---|
| `HOME` | `info` | Home |
| `OFFICE` | `grey` | Office |
| `OTHER` | `grey` | Other |

---

## 9. Card Guidelines

### Product Card (2-column grid)

```
┌──────────────────┐
│   Product Image  │  aspect ratio 5:6
│                  │
├──────────────────┤
│ Brand Name       │  text-xs text-gray-500
│ Product Name     │  text-sm font-semibold text-gray-900 (2 lines max)
│ ¥sale  ~~price~~ │  text-sm text-rose-600 + text-xs text-gray-400 line-through
│ [Sale] [Featured]│  badges (optional)
└──────────────────┘
```

- Corner radius: `rounded-xl`
- Shadow: `shadow-sm`
- Image placeholder: grey with product initial letter

### Order Card (full-width list item)

```
┌─────────────────────────────────────────┐
│ ORD202604060001           [Status Badge] │
│ April 6, 2026                           │
│ [img][img][img] +2 more                 │
│ 3 items                    $125.00      │
│                       [ Pay Now ] or CTA│
└─────────────────────────────────────────┘
```

- Corner radius: `rounded-xl`
- Shadow: `shadow-sm`
- Item thumbnails: 40×40 dp, `rounded-lg`, max 3 shown

### Address Card

```
┌─────────────────────────────────────────┐
│ [HOME]  [Default]              [Edit]   │
│ Nguyen Van Loc — 0901234567             │
│ 123 Street, Ward X, District Y, HCM    │
└─────────────────────────────────────────┘
```

### Notification Card

```
┌─────────────────────────────────────────┐
│ ● [ORDER icon]  Order Confirmed    2h ago│  (● = unread blue dot)
│   Your order ORD... has been confirmed. │
└─────────────────────────────────────────┘
```

- Unread: `border-l-4 border-blue-500 bg-blue-50` with bold title.
- Read: `bg-white` normal weight.

---

## 10. List Guidelines

- Use `<FlatList>` for all lists.
- `keyExtractor` must use item ID, never index.
- Separator: `<Divider />` or `ItemSeparatorComponent`.
- Pull-to-refresh on all list and detail screens via `RefreshControl`.
- `onEndReachedThreshold={0.3}` for infinite scroll trigger.
- `ListFooterComponent`: `<ActivityIndicator />` when `isFetchingNextPage`, otherwise `null`.
- List item minimum height: 64 dp for compact rows, 88 dp for rich content rows.

---

## 11. Bottom Tab Bar

5 tabs: Home | Cart | Orders | Notifications | Profile.

```
┌────────────────────────────────────────────────┐
│  [Home]   [Cart 🔴3]  [Orders]  [🔔2]  [Profile] │
└────────────────────────────────────────────────┘
```

- Active tab: `text-indigo-600` icon + label with underline bar or filled icon.
- Inactive: `text-gray-400`.
- Badge: `bg-red-500 text-white text-xs rounded-full` positioned top-right of icon.
- Cart badge: driven by `uiStore.badgeCount`.
- Notification badge: driven by `unreadCount` from API.
- Height: 56 dp + safe area bottom inset.

---

## 12. Checkout Stepper

Horizontal progress indicator for the 4-step checkout flow.

```
● Delivery ── ● Payment ── ○ Voucher ── ○ Review
  (done)        (current)    (future)    (future)
```

- Completed step: filled green circle + checkmark icon, coloured label.
- Current step: filled primary circle, bold label, pulsing ring.
- Future step: empty grey circle, grey label.
- Connector line: grey by default; green when the step is completed.
- Tapping a completed step navigates back to it.

---

## 13. Order Status Timeline (Stepper)

Used on Order Detail screen.

```
✅ Placed     ── ✅ Confirmed ── ✅ Processing ── 🔵 Shipped ── ○ Delivered ── ○ Completed
```

- Completed: filled green circle, checkmark.
- Current: pulsing blue circle.
- Future: empty grey circle.
- CANCELLED or REFUNDED: replace entire stepper with a coloured banner.

---

## 14. Shipment Event Timeline

Vertical timeline, most recent event at top.

```
│  [highlighted] DELIVERED — Ho Chi Minh City   Apr 10, 14:32
│  OUT_FOR_DELIVERY — Distribution centre       Apr 10, 08:00
│  IN_TRANSIT — Da Nang hub                     Apr 9, 22:15
│  PICKED_UP — Hanoi hub                        Apr 8, 16:00
```

- Latest event: coloured left border (colour matches shipment status colour).
- Past events: grey left border.
- Each row: status label (bold), location (secondary text), description, timestamp (caption).
- Loading: `SkeletonTimeline`.
- No events: "Awaiting carrier scan" placeholder row.

---

## 15. Form Guidelines

### Form layout

- Labels above inputs, always visible (not placeholder-as-label).
- Vertical stacking with 12 dp gap between fields.
- Section headers (`SectionHeader`) separate logical groups (e.g. "Personal Info", "Contact").
- Submit button at the bottom, full-width, sticky if form is long.

### Input states

| State | Border | Background |
|---|---|---|
| Default | `border-gray-300` | `bg-white` |
| Focused | `border-indigo-500 ring-1 ring-indigo-200` | `bg-white` |
| Error | `border-red-500` | `bg-white` |
| Disabled | `border-gray-200` | `bg-gray-100` |

### Keyboard handling

- Wrap form screens in `ScreenWrapper` (includes `KeyboardAvoidingView`).
- `scrollKeyboardShouldPersistTaps="handled"` on inner `ScrollView`.
- Auto-scroll to first error field after submit failure.

---

## 16. Modal / Bottom Sheet Guidelines

### Bottom sheet (ConfirmBottomSheet)

```
╔═════════════════════════════════╗
║  Cancel this order?             ║  heading-2
║  This action cannot be undone.  ║  body text-gray-600
║                                 ║
║  [       Yes, cancel       ]    ║  destructive button (red), full-width
║  [         Go back         ]    ║  secondary button, full-width
╚═════════════════════════════════╝
```

- Corner radius: `rounded-t-2xl` (top corners only).
- Background: white with `shadow-lg`.
- Drag handle: 4×40 dp pill at top center, `bg-gray-300`.
- Swipe down to dismiss without action.
- Destructive button always below the cancel button.

### Loading overlay (LoadingOverlay)

Full-screen semi-transparent dark overlay (`bg-black/60`) with centred:
- `ActivityIndicator` (white, large)
- Status message in white body text below spinner

Used only for blocking operations: place order, initiate payment.

### Filter bottom sheet (FilterBottomSheet)

- Max height: 80% of screen.
- Scrollable content if filters exceed visible height.
- "Apply Filters" primary button + "Clear All" ghost button at bottom, sticky.

---

## 17. Toast Guidelines

```
┌────────────────────────────────┐
│ ✅  Added to cart              │  success (green left border)
└────────────────────────────────┘

┌────────────────────────────────┐
│ ❌  Payment failed.            │  error (red, manual dismiss ×)
└────────────────────────────────┘
```

- Position: bottom of screen, 16 dp above home indicator / tab bar.
- Corner radius: `rounded-xl`.
- Max width: screen width minus 32 dp.
- Variants: `success` (green), `error` (red), `warning` (amber), `info` (blue).
- Icon: left-aligned status icon.
- Dismiss button: `×` on right edge; only shown on error toasts.
- Max 3 visible simultaneously; subsequent toasts queue.
- Auto-dismiss: success / info 4 s, warning 6 s, error manual only.

---

## 18. Empty State Guidelines

```
        [Illustration SVG]

      Your cart is empty

  Add items from the product list
        to get started.

    [ Start Shopping ]   ← primary button (optional)
```

- Illustration: 120×120 dp SVG icon related to context.
- Title: `heading-2`, `text-gray-900`, centered.
- Description: `body`, `text-gray-500`, centered, max 2 lines.
- CTA button: optional, only when a clear next action exists.
- Each screen has its own specific illustration and copy — no generic "nothing here" fallback.

---

## 19. Skeleton Guidelines

### Animation

Left-to-right shimmer using `Animated.Value`. Gradient from `#F3F4F6` to `#E5E7EB` back to `#F3F4F6`.

### SkeletonCard (product grid / order cards / notification list)

```
┌──────────────────┐
│    ░░░░░░░░░░    │  image block
│                  │
├──────────────────┤
│ ░░░░░░           │  brand line
│ ░░░░░░░░░░░░░░   │  title line
│ ░░░░░            │  price line
└──────────────────┘
```

### SkeletonDetail (order detail / product detail)

Full-width blocks: image placeholder (200 dp tall), then stacked lines of varying widths (100%, 80%, 60%, 100%, 90%, 70%).

### SkeletonTimeline (shipment events)

Each row: circle (16 dp) on left + two lines (80%, 50%) stacked with gap.

### SkeletonForm (address form / profile edit)

Label block (40%, 10 dp tall) above input block (100%, 44 dp tall), repeated per field.

Rules:
- Show skeleton on initial load and hard refresh only.
- Show `ActivityIndicator` spinner on subsequent user-triggered reloads.
- Never show skeleton and real content at the same time.

---

## 20. Star Rating Component

Used in Write Review (interactive) and product reviews section (display-only).

### Interactive

- 5 stars, tappable.
- Tap: fill up to and including the tapped star.
- Drag: preview fill state; commit on release.
- Filled: `text-amber-400` star icon.
- Empty: `text-gray-300` star outline icon.
- Minimum: 1 star (required).

### Display-only

- Fractional stars supported (e.g. 4.2 = four full + one 20% filled).
- Label: "4.2 (128 reviews)" in `caption` text.

---

## 21. Network Banner

Persistent `<View>` displayed below the status bar when the device is offline.

```
┌────────────────────────────────────┐
│  ⚠  No internet connection         │  bg-amber-400 text-white text-sm
└────────────────────────────────────┘
```

- Always visible while offline — not dismissible.
- Hides automatically when connection is restored.
- Does not use the Toast system (toast is transient; this is persistent).
