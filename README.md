# Fashion Shop Customer Web

Customer-facing web app for the `Fashion Shop` ecommerce system.

## Overview

- Platform: React web
- Audience: `CUSTOMER` users
- Stack: React, Vite, TypeScript, React Router, TanStack Query, Zustand, Tailwind, Framer Motion
- Backend base path: `/api/v1`

Detailed implementation, design, API, and planning docs live in the root-level source-of-truth files and the archived originals under `docs/original/`.

## Auth Contract

- Customer auth follows `docs/original/api-common.md` and `docs/original/customer-api-contract.md`.
- `POST /auth/login` and `POST /auth/register` return `ApiResponse<AuthResponse>` with `data.user` and `data.tokens.accessToken` / `tokenType` / `expiresIn`.
- The backend sets the refresh token as an `HttpOnly` cookie. The frontend must not read, store, or send `refreshToken` in JavaScript.
- `POST /auth/refresh-token` reads the refresh token from the cookie and returns only a new access token payload.
- `POST /auth/logout` clears the refresh cookie on the backend. The frontend only clears its local auth state.
- Login, register, refresh, and logout requests should send `withCredentials: true` so the browser can receive and send the refresh cookie.
- Access tokens stay in memory in the customer web app. Do not store access tokens or bearer tokens in `localStorage`.
- `localStorage` and `sessionStorage` are reserved for non-sensitive UI data only.

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
VITE_SITE_URL=http://localhost:5173
VITE_USE_MOCK_DATA=false
```

Local development notes:

- If the frontend and API run on different origins, the backend must allow credentials for the frontend origin.
- Local cookie-based auth needs the backend refresh cookie configured for local HTTP development and the frontend to call auth endpoints with `withCredentials: true`.
- `VITE_SITE_URL` should match the customer-web origin used for canonical URLs and SEO metadata.

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
