# motion-guidelines.md

## 1. Purpose

Motion principles for `customer-web`.

Motion supports:
- perceived quality and brand premium feel
- smooth browsing experience
- interaction feedback
- visual continuity between states
- SEO-neutral delight (animations don't hide content from crawlers)

---

## 2. Motion Philosophy

Web motion should feel:
- **smooth** — no jank, 60fps minimum
- **premium** — editorial and restrained
- **purposeful** — every animation earns its place
- **fast** — browsing and checkout flows are never slowed

It may be richer than a pure utility app, but must be disciplined and Core Web Vitals-aware.

---

## 3. Animation Library

Primary: **Framer Motion**
Secondary: **Tailwind CSS transitions** (for simple hover/focus states)

### When to use Framer Motion
- Page transitions (`AnimatePresence`)
- Complex enter/exit animations (modal, drawer, bottom sheet)
- Scroll-triggered reveals
- Staggered product grid reveals
- Hero sequence animations
- List item reorder/removal

### When to use Tailwind transitions
- Button hover (`transition-colors`, `transition-shadow`)
- Card hover lift (`transition-transform`, `transition-shadow`)
- Input focus (`transition-[border-color,box-shadow]`)
- Simple opacity toggles

---

## 4. Reduced Motion — Always First

```tsx
import { useReducedMotion } from 'framer-motion'

const shouldReduce = useReducedMotion()

const variants = shouldReduce
  ? { initial: {}, animate: {}, exit: {} }
  : { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0 } }
```

Also in CSS:
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 5. Standard Motion Presets

```ts
// src/shared/lib/motionPresets.ts

export const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } },
}

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
}

export const staggerContainer = {
  animate: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
}

export const cardReveal = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.4, 0, 0.2, 1] } },
}

export const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.25 } },
}

export const drawerVariants = {
  initial: { x: '100%' },
  animate: { x: 0, transition: { duration: 0.3, ease: [0, 0, 0.2, 1] } },
  exit: { x: '100%', transition: { duration: 0.25, ease: [0.4, 0, 1, 1] } },
}

export const drawerBottomVariants = {
  initial: { y: '100%' },
  animate: { y: 0, transition: { duration: 0.3, ease: [0, 0, 0.2, 1] } },
  exit: { y: '100%', transition: { duration: 0.25, ease: [0.4, 0, 1, 1] } },
}

export const modalVariants = {
  initial: { opacity: 0, scale: 0.96, y: 8 },
  animate: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.2 } },
  exit: { opacity: 0, scale: 0.96, transition: { duration: 0.15 } },
}

export const backdropVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
}

export const stickyBarVariants = {
  initial: { y: '100%', opacity: 0 },
  animate: { y: 0, opacity: 1, transition: { duration: 0.3, ease: [0, 0, 0.2, 1] } },
  exit: { y: '100%', opacity: 0, transition: { duration: 0.2 } },
}
```

---

## 6. Scroll-Triggered Reveals

Use `useScrollReveal` hook (wraps Intersection Observer):

```tsx
// src/shared/hooks/useScrollReveal.ts
export function useScrollReveal(threshold = 0.15) {
  const ref = useRef<HTMLElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true) },
      { threshold }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [threshold])

  return { ref, isVisible }
}
```

Usage:
```tsx
const { ref, isVisible } = useScrollReveal()
return (
  <motion.section
    ref={ref}
    variants={staggerContainer}
    initial="initial"
    animate={isVisible ? 'animate' : 'initial'}
  >
    {products.map(p => (
      <motion.div key={p.id} variants={cardReveal}>
        <ProductCard product={p} />
      </motion.div>
    ))}
  </motion.section>
)
```

---

## 7. Hero Animation Sequence

```tsx
// Homepage hero — staggered reveal
<motion.div>
  <motion.h1
    initial={{ opacity: 0, y: 32 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
  >
    New Season Collection
  </motion.h1>
  <motion.p
    initial={{ opacity: 0, y: 24 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: 0.15 }}
  >
    {subtitle}
  </motion.p>
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay: 0.3 }}
  >
    <Button variant="primary">Shop Now</Button>
  </motion.div>
</motion.div>
```

---

## 8. Page Transitions

Wrap routes with `AnimatePresence`:

```tsx
// app/router/index.tsx
<AnimatePresence mode="wait">
  <Routes location={location} key={location.pathname}>
    <Route path="/" element={
      <motion.div {...pageVariants}>
        <HomePage />
      </motion.div>
    } />
    {/* ... */}
  </Routes>
</AnimatePresence>
```

---

## 9. Component-Level Rules

### Buttons
```css
/* Tailwind — no Framer Motion needed */
.btn-primary {
  transition: background-color 150ms ease, box-shadow 150ms ease, transform 150ms ease;
}
.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(79,70,229,0.3);
}
.btn-primary:active {
  transform: translateY(0);
}
```

### Product cards
```tsx
<motion.div
  whileHover={{ y: -4, boxShadow: 'var(--shadow-card-hover)' }}
  transition={{ duration: 0.25 }}
>
  <motion.img
    whileHover={{ scale: 1.04 }}
    transition={{ duration: 0.3 }}
  />
</motion.div>
```

### Inputs
```css
/* Tailwind */
.input-base {
  transition: border-color 150ms ease, box-shadow 150ms ease;
}
```

### Cart item remove
```tsx
<AnimatePresence>
  {cartItems.map(item => (
    <motion.div
      key={item.id}
      layout
      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
      transition={{ duration: 0.25 }}
    >
      <CartItemCard item={item} />
    </motion.div>
  ))}
</AnimatePresence>
```

---

## 10. Timing Reference

| Context | Duration | When to use |
|---|---|---|
| Hover/press feedback | 100–150ms | Buttons, inputs, links |
| Card hover | 200–250ms | Product cards |
| Drawer open | 280–320ms | Filter, cart, nav drawers |
| Modal open | 180–220ms | Confirmation dialogs |
| Page transition | 350–450ms | Route changes |
| Hero reveal | 500–600ms | First load only |
| Stagger per item | 50–80ms | Product grid reveals |

---

## 11. Performance Rules

- **Never** animate `width`, `height`, `top`, `left`, `margin`, `padding` — causes layout thrash.
- **Always** animate `transform` and `opacity` — GPU-composited.
- Use `layout` prop in Framer Motion only when necessary (expensive).
- Lazy-load Framer Motion if bundle size is a concern.
- 3D scenes: always `React.lazy` + `Suspense` fallback.
- Use `will-change: transform` sparingly, only on actively animated elements.

---

## 12. Anti-Patterns

Do not:
- Animate checkout form controls
- Stack competing reveal animations in one viewport
- Use `spring` easing on page-level transitions (save for micro only)
- Apply `whileHover` on mobile (no hover intent)
- Loop decorative animations indefinitely without pause
- Use motion as a substitute for clear visual hierarchy
- Block LCP with animation logic (hero image must load first)

---

## 13. Final Rule

If motion makes the experience feel faster, more premium, or more responsive — keep it.
If it makes browsing feel slow or checkout feel nervous — remove it.
