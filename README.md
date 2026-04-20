# Fashion Shop — Customer Mobile App

Ứng dụng mua sắm thời trang dành cho khách hàng. Xây dựng trên **React Native + Expo**.

---

## Table of Contents

1. [Tech Stack](#1-tech-stack)
2. [Prerequisites](#2-prerequisites)
3. [Setup](#3-setup)
4. [Environment Variables](#4-environment-variables)
5. [Run](#5-run)
6. [Build](#6-build)
7. [Folder Structure](#7-folder-structure)
8. [Navigation Structure](#8-navigation-structure)
9. [Key Conventions](#9-key-conventions)

---

## 1. Tech Stack

| Layer | Technology |
|---|---|
| Framework | React Native + Expo (managed workflow) |
| Language | TypeScript (strict) |
| Navigation | React Navigation v6 |
| Server State | TanStack Query v5 |
| Client State | Zustand |
| Forms | React Hook Form + Zod |
| Styling | NativeWind (Tailwind for React Native) |
| HTTP Client | Axios |
| Secure Storage | expo-secure-store |
| Icons | @expo/vector-icons |

**Backend API**: `http://localhost:8080/api/v1`

---

## 2. Prerequisites

### Cài đặt bắt buộc

| Tool | Version | Notes |
|---|---|---|
| Node.js | 20+ | LTS recommended |
| npm / pnpm | latest | — |
| Git | any | — |
| Expo CLI | latest | `npm install -g expo-cli` |
| EAS CLI | latest | `npm install -g eas-cli` (chỉ cần khi build) |

### Thiết bị / Simulator

**iOS**:
- macOS + Xcode 15+ (để chạy iOS Simulator)
- hoặc thiết bị thật + ứng dụng **Expo Go** (App Store)

**Android**:
- Android Studio + Android Emulator (API 33+)
- hoặc thiết bị thật + ứng dụng **Expo Go** (Play Store)

### Backend

Backend phải đang chạy tại `http://localhost:8080` trước khi dùng app.
Khi test trên thiết bị thật, thay `localhost` bằng IP local của máy (VD: `http://192.168.1.10:8080`).

---

## 3. Setup

### 3.1 Clone repository

```bash
git clone <repository-url>
cd fashion-shop-app
```

### 3.2 Install dependencies

```bash
npm install
# hoặc
pnpm install
```

### 3.3 Tạo file environment

```bash
cp .env.example .env.local
```

Sau đó điền giá trị vào `.env.local` (xem [§4 Environment Variables](#4-environment-variables)).

### 3.4 Prebuild (nếu dùng bare workflow hoặc native module)

```bash
npx expo prebuild
```

> Bỏ qua bước này nếu chạy trên Expo Go.

---

## 4. Environment Variables

Expo đọc biến môi trường có prefix `EXPO_PUBLIC_` và expose cho client code.

### File `.env.local` (local development)

```env
EXPO_PUBLIC_API_BASE_URL=http://localhost:8080/api/v1
EXPO_PUBLIC_APP_NAME=Fashion Shop
```

> Khi test trên thiết bị thật, thay `localhost` bằng IP LAN của máy:
> ```env
> EXPO_PUBLIC_API_BASE_URL=http://192.168.1.10:8080/api/v1
> ```

### File `.env.production`

```env
EXPO_PUBLIC_API_BASE_URL=https://api.fashionshop.com/api/v1
EXPO_PUBLIC_APP_NAME=Fashion Shop
```

### File `.env.example` (checked into git)

```env
EXPO_PUBLIC_API_BASE_URL=
EXPO_PUBLIC_APP_NAME=Fashion Shop
```

> **Lưu ý**: Không commit `.env.local` hay `.env.production`. Chỉ commit `.env.example`.

### Bảng biến môi trường

| Variable | Required | Description |
|---|---|---|
| `EXPO_PUBLIC_API_BASE_URL` | ✅ | Base URL của backend API (không có trailing slash) |
| `EXPO_PUBLIC_APP_NAME` | ✅ | Tên ứng dụng hiển thị |

---

## 5. Run

### Khởi động Expo dev server

```bash
npx expo start
```

Sau đó:
- Nhấn `i` để mở iOS Simulator
- Nhấn `a` để mở Android Emulator
- Quét QR bằng Expo Go app trên thiết bị thật

### Chạy trực tiếp trên iOS Simulator

```bash
npx expo run:ios
```

### Chạy trực tiếp trên Android Emulator

```bash
npx expo run:android
```

### Lint

```bash
npm run lint
```

### Type check

```bash
npm run typecheck
```

### Lint + Type check (trước khi push)

```bash
npm run lint && npm run typecheck
```

---

## 6. Build

App được build qua **EAS Build** (Expo Application Services).

### Cài EAS CLI

```bash
npm install -g eas-cli
eas login
```

### Build preview (internal testing)

```bash
# Android APK
eas build --platform android --profile preview

# iOS IPA (cần Apple Developer account)
eas build --platform ios --profile preview
```

### Build production

```bash
eas build --platform android --profile production
eas build --platform ios --profile production
```

### Submit lên store

```bash
eas submit --platform android
eas submit --platform ios
```

### File cấu hình EAS

```json
// eas.json
{
  "build": {
    "preview": {
      "distribution": "internal",
      "android": { "buildType": "apk" }
    },
    "production": {
      "android": { "buildType": "app-bundle" }
    }
  }
}
```

---

## 7. Folder Structure

```text
src/
│
├── app/                            # App entry & global setup
│   ├── App.tsx
│   ├── navigation/
│   │   ├── RootNavigator.tsx       # Auth vs Main switch
│   │   ├── AuthNavigator.tsx       # Login, Register
│   │   ├── MainNavigator.tsx       # Bottom tabs + nested stacks
│   │   ├── linking.ts              # Deep link config
│   │   └── types.ts                # Typed param lists for all navigators
│   └── providers/
│       ├── QueryProvider.tsx       # TanStack Query setup
│       └── AuthProvider.tsx        # Bootstrap tokens from secure storage
│
├── features/                       # Feature modules (domain-driven)
│   ├── auth/
│   │   ├── components/             # UI components scoped to feature
│   │   ├── hooks/                  # useLogin, useRegister
│   │   ├── screens/                # LoginScreen, RegisterScreen
│   │   ├── schemas/                # Zod schemas
│   │   ├── services/               # authService.ts (API calls only)
│   │   └── index.ts                # Public exports only
│   │
│   ├── products/                   # Product listing + detail + variant selector
│   ├── cart/                       # Cart screen + item management
│   ├── checkout/                   # 4-step checkout wizard + order confirmation
│   ├── orders/                     # Order list + detail + cancellation
│   ├── payment/                    # Payment initiation + result polling
│   ├── shipment/                   # Shipment tracking + event timeline
│   ├── invoice/                    # Invoice view
│   ├── reviews/                    # Write review + my reviews
│   ├── notifications/              # Notification list + mark read
│   └── profile/                    # Profile edit + address book
│
├── shared/                         # Reusable across all features
│   ├── components/
│   │   ├── ui/                     # Primitive components
│   │   │   ├── Button.tsx          # loading, disabled, variant props
│   │   │   ├── Input.tsx           # error, label, secureTextEntry
│   │   │   ├── Badge.tsx
│   │   │   ├── Divider.tsx
│   │   │   └── Avatar.tsx
│   │   ├── feedback/
│   │   │   ├── Toast.tsx           # Bottom toast system
│   │   │   ├── SkeletonCard.tsx
│   │   │   ├── SkeletonDetail.tsx
│   │   │   ├── SkeletonTimeline.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   └── ErrorCard.tsx
│   │   ├── layout/
│   │   │   ├── ScreenWrapper.tsx   # SafeAreaView + KeyboardAvoidingView
│   │   │   └── SectionHeader.tsx
│   │   └── overlays/
│   │       ├── ConfirmBottomSheet.tsx
│   │       ├── LoadingOverlay.tsx  # Full-screen blocking overlay
│   │       └── FilterBottomSheet.tsx
│   ├── hooks/
│   │   ├── useDebounce.ts
│   │   ├── useRefreshOnFocus.ts    # Refetch on screen focus
│   │   ├── useInfiniteList.ts      # Infinite scroll helper
│   │   └── useToast.ts
│   ├── lib/
│   │   ├── axios.ts                # Axios instance + interceptors
│   │   ├── queryClient.ts          # TanStack Query config
│   │   └── secureStorage.ts        # Wrapper cho expo-secure-store
│   ├── stores/
│   │   ├── authStore.ts            # Zustand: tokens + user
│   │   └── uiStore.ts              # Zustand: cart badge + toast queue + redirect
│   ├── types/
│   │   ├── api.types.ts            # ApiResponse, PaginatedResponse, FieldError, ApiError
│   │   ├── auth.types.ts
│   │   └── enums.ts                # OrderStatus, PaymentStatus… (mirrors backend)
│   └── utils/
│       ├── formatMoney.ts
│       ├── formatDate.ts
│       └── formatRelativeTime.ts   # "2h ago", "Yesterday", full date
│
├── constants/
│   ├── queryKeys.ts                # TanStack Query key factory
│   ├── routes.ts                   # Screen name constants
│   └── config.ts                   # API_BASE_URL, timeouts, polling config
│
└── main.tsx
```

### Quy tắc quan trọng

- **Cross-feature import cấm.** Feature A không được import từ `features/B/`. Nếu cần dùng chung, chuyển vào `shared/`.
- `index.ts` trong mỗi feature chỉ export public API của feature đó.
- **Screens** chỉ compose components + gọi hooks. Không chứa API call trực tiếp hay logic phức tạp.
- Dùng `FlatList` cho tất cả danh sách — không dùng `ScrollView + .map()` cho list dài.

---

## 8. Navigation Structure

```
RootNavigator
│
├── AuthNavigator              (khi chưa đăng nhập)
│   ├── LoginScreen
│   └── RegisterScreen
│
└── MainNavigator — Bottom Tab (khi đã đăng nhập)
    │
    ├── [Tab] Home
    │   ├── ProductListScreen
    │   └── ProductDetailScreen
    │
    ├── [Tab] Cart
    │   ├── CartScreen
    │   └── CheckoutStack
    │       ├── CheckoutAddressScreen     ← Step 1
    │       ├── CheckoutPaymentScreen     ← Step 2
    │       ├── CheckoutVoucherScreen     ← Step 3
    │       ├── CheckoutReviewScreen      ← Step 4
    │       └── OrderConfirmationScreen
    │
    ├── [Tab] Orders
    │   ├── OrderListScreen
    │   ├── OrderDetailScreen
    │   ├── PaymentResultScreen
    │   └── ShipmentTrackingScreen
    │
    ├── [Tab] Notifications
    │   └── NotificationScreen
    │
    └── [Tab] Profile
        ├── ProfileScreen
        ├── AddressBookScreen
        ├── AddressFormScreen
        ├── MyReviewsScreen
        ├── WriteReviewScreen
        └── InvoiceScreen
```

### Deep links được hỗ trợ

| URL | Screen |
|---|---|
| `fashionshop://orders/:orderId` | OrderDetailScreen |
| `fashionshop://orders/:orderId/payment` | PaymentResultScreen |
| `fashionshop://orders/:orderId/tracking` | ShipmentTrackingScreen |

---

## 9. Key Conventions

### API call flow

```
Screen
  → custom hook (useProducts, useCreateOrder…)
    → service function (productService.getList…)
      → Axios instance (với auth interceptor)
        → Backend API
```

### Token storage

| Data | Storage |
|---|---|
| Access token | `expo-secure-store` (encrypted) |
| Refresh token | `expo-secure-store` (encrypted) |
| User info | Zustand `authStore` (in-memory) |

Không lưu token trong `AsyncStorage` (không mã hóa).

### State classification

| State type | Tool |
|---|---|
| Server data (fetched from API) | TanStack Query |
| Form state | React Hook Form |
| Auth state (tokens, user) | Zustand `authStore` |
| Cart badge count, toast queue | Zustand `uiStore` |
| Local UI state (modal open…) | `useState` |

### Mutation retry

- GET requests: auto-retry tối đa 2 lần với delay 1s khi mất mạng.
- POST/PATCH/DELETE: **không auto-retry**. Lỗi phải do user trigger lại thủ công.

### Commit message format

```
{type}({feature}): {title}

{description nếu cần}

{Fixes/Complete #issue_number}
```

Ví dụ:
```
feat(checkout): implement 4-step checkout wizard

Complete #2010
```
