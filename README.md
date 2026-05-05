# Fashion Shop Customer Web

Customer-facing web app for the `Fashion Shop` ecommerce system.

## Overview

- Platform: React web
- Audience: `CUSTOMER` users
- Stack: React, Vite, TypeScript, React Router, TanStack Query, Zustand, Tailwind, Framer Motion
- Backend base path: `/api/v1`

Detailed implementation, design, API, and planning docs live in the root-level source-of-truth files and the archived originals under `docs/original/`.

## Catalog Search Contract

- Customer product search still sends `keyword`; there is no `searchText` query param on the frontend.
- Product keyword matching is backend FULLTEXT over internal catalog fields. Frontend code must treat relevance as backend-owned.
- Send the user's raw keyword after trimming outer whitespace only. Do not lowercase or strip Vietnamese accents on the client.
- Do not expose backend-internal `searchText` / `search_text` fields or admin product search/reindex actions in the customer app.

## Prerequisites

- Node.js `20+`
- npm or pnpm
- Git

## Setup

```bash
git clone <repository-url>
cd ecommerce-customer-web
npm install
```

Create environment variables:

```env
VITE_API_BASE_URL=http://localhost:8080/api/v1
VITE_APP_NAME=Fashion Shop
VITE_APP_URL=http://localhost:5173
VITE_ENABLE_3D=false
```

## Run

```bash
npm run dev
```

## Quality Checks

```bash
npm run lint
npm run typecheck
npm run build
```

## Build

```bash
npm run build
```

## Preview Build

```bash
npm run preview
```

## Deploy

Build output is expected in `dist/`.

Typical deployment targets:

- Vercel
- Netlify
- static hosting behind Nginx

If stronger SSR/SSG is later required for SEO, a future migration to Next.js can be evaluated without changing the product/domain model.
