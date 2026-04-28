# 3d-guidelines.md

## 1. Purpose

Defines how 3D may be used in `customer-web`.

3D is an optional premium enhancement — not a default.
It must never compromise performance, SEO, or conversion clarity.

---

## 2. Role in Web Experience

3D may help communicate:
- premium brand identity
- product depth and materiality
- featured campaign storytelling
- immersive hero moments

It must never reduce:
- page load speed (LCP, FID, CLS)
- readability or navigation clarity
- SEO crawlability of core content
- conversion clarity

---

## 3. Recommended Use Cases

- Homepage hero ambient background
- Featured launch or campaign section
- Premium product storytelling block
- Brand / about section

---

## 4. Not Allowed

Never use 3D in:
- Checkout flows (any step)
- Cart page
- Auth pages (login, register)
- Account management pages
- Error / empty / loading states

---

## 5. Web Performance Rules

### Critical requirements

1. **Always lazy-load**:
```tsx
const HeroScene = React.lazy(() => import('./HeroScene'))

<Suspense fallback={<HeroStaticFallback />}>
  {enable3D && <HeroScene />}
</Suspense>
```

2. **Always provide static fallback**:
```tsx
function HeroStaticFallback() {
  return <img src="/hero-static.jpg" alt="Fashion Shop" width={1440} height={720} fetchpriority="high" />
}
```

3. **Never block LCP**: The static fallback image must be the LCP element. 3D loads after.

4. **Enable via feature flag**:
```env
VITE_ENABLE_3D=true  # default: false in production until tested
```

5. **Test on low-end devices**: Disable automatically if `navigator.hardwareConcurrency <= 4` or `navigator.deviceMemory <= 2`.

```ts
function should3DRender(): boolean {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false
  if (navigator.hardwareConcurrency <= 4) return false
  if ((navigator as any).deviceMemory <= 2) return false
  return import.meta.env.VITE_ENABLE_3D === 'true'
}
```

---

## 6. SEO Rules for 3D Sections

- The section's heading (`<h2>`) must be real HTML — not inside the WebGL canvas.
- The CTA button must be real HTML — not inside the canvas.
- Core product/campaign text must be in the DOM for crawling.
- 3D is purely visual enhancement — all meaning is conveyed by surrounding HTML.

---

## 7. Interaction Rules

3D must never:
- Cover or delay the primary CTA
- Require interaction to reveal product information
- Distract from the purchase flow
- Spin/animate continuously without pause or reduced-motion check

---

## 8. Visual Style Rules

3D should feel:
- elegant and lightweight
- premium — aligned with brand indigo/navy palette
- subtle — ambient drift only, no aggressive camera movement
- consistent with the overall `customer-web` visual language

Avoid:
- Game-like or cartoon aesthetics
- Excessive bloom, glow, or particle effects
- Constant rotation that fights the editorial calm of the design
- High polygon counts that cause frame drops

---

## 9. Library Guidance

Preferred stack:
- **React Three Fiber** + **@react-three/drei** for declarative Three.js
- **@react-three/postprocessing** for effects (use sparingly)
- **Leva** for dev-time scene tuning only (not in production)

Component structure:
```
features/home/components/HeroScene/
├── HeroScene.tsx          ← lazy-loaded entry point
├── HeroScene.canvas.tsx   ← Canvas + scene setup
├── HeroMesh.tsx           ← 3D geometry and materials
├── HeroScene.fallback.tsx ← static image fallback
└── index.ts
```

---

## 10. Motion Rules for 3D

If animated:
- Prefer subtle ambient drift (`sin(clock.elapsedTime * 0.3)`)
- Keep loops calm: rotation speed < 0.002 radians/frame
- Small camera motion only — no aggressive pan/zoom
- Respect `prefers-reduced-motion`: freeze animation when true

```tsx
useFrame((state) => {
  if (prefersReducedMotion) return
  meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.1
})
```

---

## 11. Approval Checklist

Before adding any 3D scene, confirm:

- [ ] Does it meaningfully enhance premium storytelling?
- [ ] Does the page work perfectly without it (static fallback)?
- [ ] Is it lazy-loaded with `React.lazy`?
- [ ] Does LCP come from the static fallback, not the canvas?
- [ ] Is core content (headings, CTAs) in real HTML outside the canvas?
- [ ] Does it respect `prefers-reduced-motion`?
- [ ] Does it have a hardware performance gate?
- [ ] Has it been tested on Android mid-range device?

If any answer is no — do not ship the 3D scene.

---

## 12. Final Rule

For `customer-web`, 3D is a premium accent for specific storytelling moments.
It must always be invisible in its loading, graceful in its fallback, and never an obstacle to browsing or buying.
