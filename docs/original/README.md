# Fashion Shop — Customer Web App

Trang web mua sắm thời trang dành cho khách hàng. Xây dựng trên **React + Vite + TypeScript**.

---

## Table of Contents

1. [Tech Stack](#1-tech-stack)
2. [Prerequisites](#2-prerequisites)
3. [Setup](#3-setup)
4. [Environment Variables](#4-environment-variables)
5. [Run](#5-run)
6. [Build & Deploy](#6-build--deploy)
7. [Folder Structure](#7-folder-structure)
8. [Routing Structure](#8-routing-structure)
9. [SEO Strategy](#9-seo-strategy)
10. [Key Conventions](#10-key-conventions)

---

## 1. Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + Vite |
| Language | TypeScript (strict) |
| Routing | React Router v6 (file-based convention) |
| Server State | TanStack Query v5 |
| Client State | Zustand |
| Forms | React Hook Form + Zod |
| Styling | Tailwind CSS v3 + CSS Variables |
| Animation | Framer Motion |
| HTTP Client | Axios |
| Auth Storage | httpOnly cookie (access) + localStorage (refresh hint) |
| Icons | Lucide React |
| SEO | React Helmet Async |
| 3D (optional) | Three.js / React Three Fiber (lazy-loaded) |

**Backend API**: `http://localhost:8080/api/v1`

---

## 2. Prerequisites

| Tool | Version |
|---|---|
| Node.js | 20+ LTS |
| npm / pnpm | latest |
| Git | any |

---

## 3. Setup

```bash
git clone <repository-url>
cd fashion-shop-web
npm install
cp .env.example .env.local
```

---

## 4. Environment Variables

```env
VITE_API_BASE_URL=http://localhost:8080/api/v1
VITE_APP_NAME=Fashion Shop
VITE_APP_URL=http://localhost:5173
VITE_ENABLE_3D=true
```

| Variable | Required | Description |
|---|---|---|
| `VITE_API_BASE_URL` | ✅ | Base URL backend API |
| `VITE_APP_NAME` | ✅ | Tên app (dùng cho SEO title) |
| `VITE_APP_URL` | ✅ | Canonical URL của site |
| `VITE_ENABLE_3D` | ❌ | Bật/tắt 3D scenes (default: false) |

---

## 5. Run

```bash
# Dev server
npm run dev

# Lint
npm run lint

# Type check
npm run typecheck

# Lint + Type check
npm run lint && npm run typecheck
```

---

## 6. Build & Deploy

```bash
# Production build
npm run build

# Preview build locally
npm run preview
```

Output: `dist/` — deploy lên Vercel / Netlify / Nginx.

### SSR / SSG (nếu cần SEO cao nhất)
Cân nhắc migrate sang **Next.js 14+ App Router** để có SSR/SSG sẵn cho product pages và category pages. Kiến trúc feature-based vẫn giữ nguyên.

---

## 7. Folder Structure

```text
src/
│
├── app/                            # App entry & global setup
│   ├── main.tsx
│   ├── App.tsx
│   ├── router/
│   │   ├── index.tsx               # createBrowserRouter config
│   │   ├── ProtectedRoute.tsx      # Auth guard
│   │   └── routes.ts               # Route name constants
│   └── providers/
│       ├── QueryProvider.tsx
│       ├── AuthProvider.tsx
│       └── HelmetProvider.tsx      # SEO provider
│
├── features/
│   ├── auth/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── pages/                  # LoginPage, RegisterPage
│   │   ├── schemas/
│   │   ├── services/
│   │   └── index.ts
│   │
│   ├── home/                       # Homepage với hero, categories, featured products
│   ├── products/                   # PLP (listing) + PDP (detail)
│   ├── cart/
│   ├── checkout/
│   ├── orders/
│   ├── payment/
│   ├── shipment/
│   ├── invoice/
│   ├── reviews/
│   ├── notifications/
│   └── profile/
│
├── shared/
│   ├── components/
│   │   ├── ui/                     # Button, Input, Badge, Divider, Avatar, Select…
│   │   ├── feedback/               # Toast, Skeleton, EmptyState, ErrorCard
│   │   ├── layout/                 # PageWrapper, SectionHeader, Container
│   │   ├── seo/                    # PageSEO, ProductSEO, BreadcrumbSEO
│   │   └── overlays/               # Modal, Drawer, ConfirmDialog, FilterPanel
│   ├── hooks/
│   │   ├── useDebounce.ts
│   │   ├── useInfiniteList.ts
│   │   ├── useScrollReveal.ts      # Intersection Observer for reveal animations
│   │   └── useToast.ts
│   ├── lib/
│   │   ├── axios.ts
│   │   ├── queryClient.ts
│   │   └── analytics.ts            # Page view tracking
│   ├── stores/
│   │   ├── authStore.ts
│   │   └── uiStore.ts
│   ├── types/
│   │   ├── api.types.ts
│   │   ├── auth.types.ts
│   │   └── enums.ts
│   └── utils/
│       ├── formatMoney.ts
│       ├── formatDate.ts
│       ├── formatRelativeTime.ts
│       └── seo.ts                  # generateTitle, generateDescription, buildJsonLd
│
└── constants/
    ├── queryKeys.ts
    ├── routes.ts
    └── config.ts
```

---

## 8. Routing Structure

```
/                           → HomePage
/products                   → ProductListPage
/products/:slug             → ProductDetailPage
/cart                       → CartPage
/checkout/address           → CheckoutAddressPage
/checkout/payment           → CheckoutPaymentPage
/checkout/voucher           → CheckoutVoucherPage
/checkout/review            → CheckoutReviewPage
/checkout/confirmation      → OrderConfirmationPage
/orders                     → OrderListPage (protected)
/orders/:orderId            → OrderDetailPage (protected)
/orders/:orderId/tracking   → ShipmentTrackingPage (protected)
/payment/result             → PaymentResultPage (protected)
/profile                    → ProfilePage (protected)
/profile/addresses          → AddressBookPage (protected)
/profile/reviews            → MyReviewsPage (protected)
/notifications              → NotificationPage (protected)
/login                      → LoginPage
/register                   → RegisterPage
```

---

## 9. SEO Strategy

### Meta tags (React Helmet Async)
Mỗi page phải render `<PageSEO>` với:
- `title` — format: `{Page Name} | Fashion Shop`
- `description` — tối đa 160 ký tự, mô tả nội dung trang
- `canonical` — URL chính xác
- `og:title`, `og:description`, `og:image` — Open Graph

### Structured Data (JSON-LD)
- **HomePage**: `WebSite` + `Organization`
- **ProductListPage**: `ItemList`
- **ProductDetailPage**: `Product` với `offers`, `aggregateRating`
- **OrderConfirmationPage**: `Order`

### URL & Slug
- Product URL dùng slug thân thiện: `/products/ao-thun-trang-basic`
- Category URL: `/products?category=ao-thun`
- Pagination: `/products?page=2` (không hash)

### Performance (Core Web Vitals)
- Images: dùng `<img loading="lazy">` + định nghĩa `width/height`
- LCP: preload hero image
- CLS: skeleton placeholder đúng kích thước
- 3D scenes: lazy-load, không block LCP

---

## 10. Key Conventions

### API call flow
```
Page → custom hook → service → Axios → Backend
```

### Auth storage
| Data | Storage |
|---|---|
| Access token | Memory (Zustand) + httpOnly cookie (nếu SSR) |
| Refresh token | localStorage (hint only) |
| User info | Zustand `authStore` |

### State classification
| State type | Tool |
|---|---|
| Server data | TanStack Query |
| Form state | React Hook Form |
| Auth state | Zustand `authStore` |
| Cart badge, toast queue | Zustand `uiStore` |
| Local UI (modal open…) | `useState` |

### Animation convention
- Dùng Framer Motion cho page transitions và complex interactions
- Dùng Tailwind `transition-*` cho hover states đơn giản
- Luôn respect `prefers-reduced-motion`

### Commit format
```
feat(products): add infinite scroll on listing page

Complete #1042
```
