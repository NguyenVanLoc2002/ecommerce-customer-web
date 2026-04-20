# CLAUDE-APP.md

## 1. Project Overview

Customer Mobile App cho hệ thống **Fashion Shop** — ứng dụng mua sắm thời trang dành cho khách hàng (role: `CUSTOMER`).

**Tech Stack**:
- React Native (Expo managed workflow)
- TypeScript (strict mode)
- React Navigation v6 (navigation)
- TanStack Query v5 (server state)
- Zustand (client state)
- React Hook Form + Zod (forms & validation)
- Axios (HTTP client)
- NativeWind (Tailwind-style utility classes cho React Native)

**Backend**: REST API tại `http://localhost:8080/api/v1`
**Auth**: JWT Bearer token (access token + refresh token) lưu trong `expo-secure-store`
**Role**: `CUSTOMER` only — app không phục vụ admin hay staff

---

## 2. Folder Structure

Feature-based architecture. Mỗi feature tự chứa đủ các lớp của nó.

```text
src/
│
├── app/                            # App entry & global setup
│   ├── App.tsx
│   ├── navigation/
│   │   ├── RootNavigator.tsx       # Auth vs Main stack switch
│   │   ├── AuthNavigator.tsx       # Login, Register screens
│   │   ├── MainNavigator.tsx       # Bottom tab + nested stacks
│   │   ├── linking.ts              # Deep link config
│   │   └── types.ts                # Navigation param list types
│   └── providers/
│       ├── QueryProvider.tsx
│       └── AuthProvider.tsx        # Bootstrap auth state on app start
│
├── features/                       # Feature modules
│   ├── auth/
│   │   ├── components/
│   │   │   └── LoginForm.tsx
│   │   ├── hooks/
│   │   │   ├── useLogin.ts
│   │   │   └── useRegister.ts
│   │   ├── screens/
│   │   │   ├── LoginScreen.tsx
│   │   │   └── RegisterScreen.tsx
│   │   ├── schemas/
│   │   │   └── authSchema.ts
│   │   ├── services/
│   │   │   └── authService.ts
│   │   └── index.ts
│   │
│   ├── products/
│   │   ├── components/
│   │   │   ├── ProductCard.tsx
│   │   │   ├── ProductGrid.tsx
│   │   │   ├── VariantSelector.tsx
│   │   │   └── ReviewSection.tsx
│   │   ├── hooks/
│   │   │   ├── useProducts.ts
│   │   │   └── useProductDetail.ts
│   │   ├── screens/
│   │   │   ├── ProductListScreen.tsx
│   │   │   └── ProductDetailScreen.tsx
│   │   ├── services/
│   │   │   └── productService.ts
│   │   ├── types/
│   │   │   └── product.types.ts
│   │   └── index.ts
│   │
│   ├── cart/
│   ├── checkout/
│   │   ├── screens/
│   │   │   ├── CheckoutAddressScreen.tsx   # Step 1
│   │   │   ├── CheckoutPaymentScreen.tsx   # Step 2
│   │   │   ├── CheckoutVoucherScreen.tsx   # Step 3
│   │   │   ├── CheckoutReviewScreen.tsx    # Step 4
│   │   │   └── OrderConfirmationScreen.tsx
│   │   └── ...
│   ├── orders/
│   ├── payment/
│   ├── shipment/
│   ├── invoice/
│   ├── reviews/
│   ├── notifications/
│   └── profile/
│       ├── screens/
│       │   ├── ProfileScreen.tsx
│       │   └── AddressBookScreen.tsx
│       └── ...
│
├── shared/                         # Dùng được ở mọi feature
│   ├── components/
│   │   ├── ui/                     # Primitive components
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Divider.tsx
│   │   │   └── Avatar.tsx
│   │   ├── feedback/
│   │   │   ├── Toast.tsx
│   │   │   ├── Skeleton.tsx
│   │   │   ├── SkeletonCard.tsx
│   │   │   ├── SkeletonDetail.tsx
│   │   │   ├── SkeletonTimeline.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   └── ErrorCard.tsx
│   │   ├── layout/
│   │   │   ├── ScreenWrapper.tsx   # SafeAreaView + KeyboardAvoid
│   │   │   └── SectionHeader.tsx
│   │   └── overlays/
│   │       ├── ConfirmBottomSheet.tsx
│   │       ├── LoadingOverlay.tsx
│   │       └── FilterBottomSheet.tsx
│   ├── hooks/
│   │   ├── useDebounce.ts
│   │   ├── useRefreshOnFocus.ts    # Re-fetch khi screen focus lại
│   │   ├── useInfiniteList.ts      # Wrapper cho infinite scroll
│   │   └── useToast.ts
│   ├── lib/
│   │   ├── axios.ts                # Axios instance + interceptors
│   │   ├── queryClient.ts
│   │   └── secureStorage.ts       # Wrapper expo-secure-store
│   ├── stores/
│   │   ├── authStore.ts
│   │   └── cartStore.ts            # Cart badge count (UI only)
│   ├── types/
│   │   ├── api.types.ts
│   │   ├── auth.types.ts
│   │   └── enums.ts
│   └── utils/
│       ├── formatMoney.ts
│       ├── formatDate.ts
│       └── formatRelativeTime.ts   # "2h ago", "Yesterday"
│
├── constants/
│   ├── queryKeys.ts
│   ├── routes.ts                   # Screen name constants
│   └── config.ts                   # API base URL, timeouts, limits
│
└── main.tsx
```

### Rules

- **Cross-feature imports cấm.** Feature A không được import từ `features/B/components/...`. Nếu cần dùng chung, chuyển vào `shared/`.
- `index.ts` trong mỗi feature chỉ export những gì public. Internal component/hook không export ra ngoài.
- **Screens** chỉ compose components + gọi hooks. Không chứa API call trực tiếp hay business logic.
- Không tạo `helpers/` hay `utils/` chung chứa mọi thứ lẫn lộn. Utility phải có scope rõ ràng.

---

## 3. Navigation Structure

### 3.1 Navigator Tree

```
RootNavigator (Stack)
│
├── AuthNavigator (Stack)                 — khi chưa đăng nhập
│   ├── LoginScreen
│   └── RegisterScreen
│
└── MainNavigator (Bottom Tab)            — khi đã đăng nhập
    ├── HomeTab (Stack)
    │   ├── ProductListScreen
    │   └── ProductDetailScreen
    │
    ├── CartTab (Stack)
    │   ├── CartScreen
    │   └── CheckoutStack (Stack)
    │       ├── CheckoutAddressScreen     # Step 1
    │       ├── CheckoutPaymentScreen     # Step 2
    │       ├── CheckoutVoucherScreen     # Step 3
    │       ├── CheckoutReviewScreen      # Step 4
    │       └── OrderConfirmationScreen
    │
    ├── OrdersTab (Stack)
    │   ├── OrderListScreen
    │   ├── OrderDetailScreen
    │   ├── PaymentResultScreen
    │   └── ShipmentTrackingScreen
    │
    ├── NotificationsTab (Stack)
    │   └── NotificationScreen
    │
    └── ProfileTab (Stack)
        ├── ProfileScreen
        ├── AddressBookScreen
        ├── AddressFormScreen
        ├── MyReviewsScreen
        ├── WriteReviewScreen
        └── InvoiceScreen
```

### 3.2 Navigation Types

Mọi navigator phải có typed param list. Không dùng `useNavigation()` untyped.

```ts
// src/app/navigation/types.ts

export type HomeStackParamList = {
  ProductList: { categoryId?: number; brandId?: number };
  ProductDetail: { productId: number };
};

export type OrdersStackParamList = {
  OrderList: { status?: OrderStatus };
  OrderDetail: { orderId: number };
  PaymentResult: { orderId: number };
  ShipmentTracking: { orderId: number };
};

export type ProfileStackParamList = {
  Profile: undefined;
  AddressBook: undefined;
  AddressForm: { addressId?: number };
  MyReviews: undefined;
  WriteReview: { productId: number; orderId: number };
  Invoice: { orderId: number };
};
```

```ts
// Dùng trong screen
const navigation = useNavigation<NavigationProp<HomeStackParamList>>();
const { productId } = useRoute<RouteProp<HomeStackParamList, 'ProductDetail'>>().params;
```

### 3.3 Deep Links

Cấu hình deep link cho các entry point quan trọng:

```ts
// src/app/navigation/linking.ts
const linking: LinkingOptions<RootParamList> = {
  prefixes: ['fashionshop://', 'https://fashionshop.com'],
  config: {
    screens: {
      Main: {
        screens: {
          Orders: {
            screens: {
              OrderDetail: 'orders/:orderId',
              PaymentResult: 'orders/:orderId/payment',
              ShipmentTracking: 'orders/:orderId/tracking',
            },
          },
        },
      },
    },
  },
};
```

### 3.4 Navigation Rules

- Dùng `navigation.navigate()` khi muốn user có thể back về. Dùng `navigation.replace()` khi không cần back (VD: sau login redirect).
- Sau đặt hàng thành công: `navigation.replace('OrderConfirmation', { orderId })` — không để user back về checkout.
- Auth guard ở `RootNavigator` — kiểm tra `authStore.accessToken`, switch giữa `AuthNavigator` và `MainNavigator`.
- `redirect` param: khi session expire mid-flow, lưu target screen vào store trước khi push về Login. Sau login, navigate đến target đó.

---

## 4. Coding Rules

### 4.1 TypeScript

- `strict: true`. Không tắt bất kỳ strict flag nào.
- Không dùng `any`. Dùng `unknown` nếu cần type-guard.
- Không dùng `as SomeType` trừ khi đã validate trước đó.
- Luôn type data từ API — không để response type là `any`.
- Dùng `type` cho data shapes, `interface` cho contracts có thể extend.
- Enum từ backend map sang `const` object + union type:

```ts
export const OrderStatus = {
  PENDING: 'PENDING',
  AWAITING_PAYMENT: 'AWAITING_PAYMENT',
  CONFIRMED: 'CONFIRMED',
  PROCESSING: 'PROCESSING',
  SHIPPED: 'SHIPPED',
  DELIVERED: 'DELIVERED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  REFUNDED: 'REFUNDED',
} as const;

export type OrderStatus = typeof OrderStatus[keyof typeof OrderStatus];
```

### 4.2 Component Rules

- Functional components only.
- Một file = một component chính. Không nhồi nhiều component lớn vào một file.
- Props phải có type rõ ràng — không dùng `React.FC<any>`.
- Component không gọi API trực tiếp. Data fetching đi qua custom hook.
- Không dùng default export kết hợp inline anonymous function:

```ts
// Bad
export default () => <View />;

// Good
export function ProductCard({ product }: ProductCardProps) { ... }
export default ProductCard;
```

- Không dùng index.tsx làm tên file component. Tên file phải match tên component: `ProductCard.tsx`.

### 4.3 React Native Specific

- Luôn dùng `<View>`, `<Text>`, `<Pressable>` — không dùng HTML element.
- Không dùng `TouchableOpacity` cho code mới. Dùng `<Pressable>` với `style={({ pressed }) => ...}`.
- Text phải nằm trong `<Text>` — không render string trần trong `<View>`.
- Không hardcode dimension bằng pixel tuyệt đối. Dùng `Dimensions.get('window')`, `%`, hoặc flexbox.
- Image phải có `width` + `height` xác định — không để undefined dimension.
- Mọi list dùng `<FlatList>` hoặc `<SectionList>` — không dùng `<ScrollView>` + `.map()` cho list dài.
- Thêm `keyExtractor` rõ ràng vào mọi `<FlatList>` — không dùng index làm key.

### 4.4 Naming Conventions

| Thing | Convention | Example |
|---|---|---|
| Screen file | PascalCase + suffix `Screen` | `ProductDetailScreen.tsx` |
| Component file | PascalCase | `ProductCard.tsx` |
| Hook file | camelCase, prefix `use` | `useProductDetail.ts` |
| Service file | camelCase, suffix `Service` | `productService.ts` |
| Schema file | camelCase, suffix `Schema` | `checkoutSchema.ts` |
| Type file | camelCase, suffix `.types` | `product.types.ts` |
| Store file | camelCase, suffix `Store` | `authStore.ts` |
| Query key | Organized factory trong `queryKeys.ts` | `queryKeys.products.detail(id)` |

### 4.5 General

- Không để `console.log` trong production code.
- Không hardcode string URL, API path, hay route name trong component. Dùng constants.
- Xử lý loading, error, empty state ở mọi screen.
- Không dùng `Math.random()` hay index làm React key. Dùng id từ data.
- Không viết comment giải thích WHAT. Viết comment khi WHY là non-obvious.

---

## 5. API Integration Rules

### 5.1 Axios Instance

File: `src/shared/lib/axios.ts`

```ts
import axios from 'axios';
import { API_BASE_URL, REQUEST_TIMEOUT } from '@/constants/config';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,   // http://localhost:8080/api/v1
  headers: { 'Content-Type': 'application/json' },
  timeout: REQUEST_TIMEOUT, // 15_000ms
});
```

**Request interceptor**: Attach `Authorization: Bearer <accessToken>` từ `authStore`.

**Response interceptor**:
- Unwrap `data.data` từ `ApiResponse<T>` wrapper trước khi trả về caller.
- 401 → attempt token refresh via `POST /auth/refresh-token`:
  - Refresh success → retry original request once
  - Refresh fail → clear `authStore` → navigate to Login (với redirect target được lưu)
- Map `fieldErrors[]` thành `Record<string, string>` để dễ feed vào React Hook Form.

Chỉ có một Axios instance duy nhất trong app.

### 5.2 Response Types

```ts
// src/shared/types/api.types.ts

export interface ApiResponse<T> {
  success: boolean;
  code: string;
  message: string;
  data: T;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;   // current page, zero-based
  size: number;
}

export interface ApiError {
  success: false;
  code: string;
  message: string;
  path: string;
  timestamp: string;
  fieldErrors?: FieldError[];
}

export interface FieldError {
  field: string;
  message: string;
}
```

### 5.3 Service Layer

Mỗi feature có `services/` chứa các hàm gọi API thuần túy. Service không biết về React, không gọi hook, không access store trực tiếp.

```ts
// features/orders/services/orderService.ts

import { apiClient } from '@/shared/lib/axios';
import type { Order, CreateOrderRequest } from '../types/order.types';
import type { PaginatedResponse } from '@/shared/types/api.types';

export const orderService = {
  getMyOrders: (params: OrderListParams) =>
    apiClient.get<PaginatedResponse<Order>>('/orders', { params }),

  getById: (id: number) =>
    apiClient.get<Order>(`/orders/${id}`),

  create: (body: CreateOrderRequest) =>
    apiClient.post<Order>('/orders', body),

  cancel: (id: number) =>
    apiClient.post(`/orders/my/${id}/cancel`),
};
```

### 5.4 Query Keys

```ts
// src/constants/queryKeys.ts

export const queryKeys = {
  products: {
    all: ['products'] as const,
    lists: () => [...queryKeys.products.all, 'list'] as const,
    list: (params: ProductListParams) => [...queryKeys.products.lists(), params] as const,
    detail: (id: number) => [...queryKeys.products.all, 'detail', id] as const,
  },
  cart: {
    all: ['cart'] as const,
    current: () => [...queryKeys.cart.all, 'current'] as const,
  },
  orders: {
    all: ['orders'] as const,
    lists: () => [...queryKeys.orders.all, 'list'] as const,
    list: (params: OrderListParams) => [...queryKeys.orders.lists(), params] as const,
    detail: (id: number) => [...queryKeys.orders.all, 'detail', id] as const,
  },
  notifications: {
    all: ['notifications'] as const,
    list: (params?: object) => [...queryKeys.notifications.all, 'list', params] as const,
    unreadCount: () => [...queryKeys.notifications.all, 'unread-count'] as const,
  },
  // ... other features
};
```

### 5.5 TanStack Query Rules

- GET requests dùng `useQuery` hoặc `useInfiniteQuery`.
- Mutations (POST/PATCH/DELETE) dùng `useMutation`.
- `staleTime` mặc định: 30s cho lists, 60s cho detail.
- Sau mutation thành công: `queryClient.invalidateQueries` để refresh data liên quan.
- Không gọi API trong `useEffect`. Tất cả data fetching đi qua TanStack Query.
- Dùng `useRefreshOnFocus` hook để refetch khi user navigate back về một screen:

```ts
// shared/hooks/useRefreshOnFocus.ts
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';

export function useRefreshOnFocus(refetch: () => void) {
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );
}
```

### 5.6 Infinite Scroll

List screens dùng `useInfiniteQuery` + `FlatList.onEndReached`:

```ts
// features/products/hooks/useProducts.ts

export function useProducts(params: ProductListParams) {
  return useInfiniteQuery({
    queryKey: queryKeys.products.list(params),
    queryFn: ({ pageParam = 0 }) =>
      productService.getList({ ...params, page: pageParam }),
    getNextPageParam: (last) =>
      last.number + 1 < last.totalPages ? last.number + 1 : undefined,
    staleTime: 30_000,
  });
}
```

```tsx
// Screen usage
const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useProducts(filters);
const items = data?.pages.flatMap((p) => p.content) ?? [];

<FlatList
  data={items}
  keyExtractor={(item) => String(item.id)}
  renderItem={({ item }) => <ProductCard product={item} />}
  onEndReached={() => hasNextPage && fetchNextPage()}
  onEndReachedThreshold={0.3}
  ListFooterComponent={isFetchingNextPage ? <ActivityIndicator /> : null}
/>
```

---

## 6. UI/UX Rules for Mobile

### 6.1 Touch Targets

- Minimum touch target: **44×44 dp** (Apple HIG) / **48×48 dp** (Material).
- Nếu visual element nhỏ hơn, dùng padding để tăng hit area: `hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}`.
- Nút primary: `height: 52`, full-width trên mobile.
- Nút destructive: không đặt ở vị trí dễ chạm nhầm (tránh bottom của màn hình khi single-hand).

### 6.2 Keyboard Handling

- Mọi screen có form phải wrap trong `<KeyboardAvoidingView>` với `behavior="padding"` (iOS) / `"height"` (Android).
- Dùng `<ScrollView keyboardShouldPersistTaps="handled">` bên trong form để tap ngoài field dismiss keyboard nhưng không dismiss press event.
- Tự động scroll đến field lỗi sau khi submit form thất bại.
- `returnKeyType` phù hợp: `"next"` cho field giữa, `"done"` cho field cuối.

### 6.3 Safe Area

- Mọi screen phải dùng `<SafeAreaView>` hoặc `useSafeAreaInsets()`. Không để content bị che bởi notch / status bar / home indicator.
- Dùng `<ScreenWrapper>` shared component bao gồm SafeArea + KeyboardAvoid để tránh lặp code.

### 6.4 Loading States

| Situation | UI |
|---|---|
| Initial screen load (GET) | Skeleton component phù hợp (`SkeletonCard`, `SkeletonDetail`, `SkeletonTimeline`) |
| Button-triggered mutation | Button `loading` prop → `ActivityIndicator` thay label; button disabled |
| Load more (infinite scroll) | `ActivityIndicator` ở `ListFooterComponent` |
| Full-screen blocking action (place order, initiate payment) | `<LoadingOverlay>` với message |
| Pull-to-refresh | `FlatList` `refreshControl` prop |

```tsx
// Pull to refresh
<FlatList
  refreshControl={
    <RefreshControl
      refreshing={isRefetching}
      onRefresh={refetch}
      tintColor={colors.primary}
    />
  }
/>
```

**Rules**:
- Show skeleton trên initial load. Show spinner/ActivityIndicator trên user-triggered action.
- Không show cả skeleton và content cùng lúc.
- Skeleton animate shimmer left-to-right.

### 6.5 Empty States

Mỗi list screen phải có empty state riêng biệt — không dùng blank screen:

```tsx
<EmptyState
  icon="shopping-bag"
  title="Your cart is empty"
  description="Add items to start shopping"
  action={{ label: 'Start Shopping', onPress: () => navigation.navigate('ProductList') }}
/>
```

Empty state của filtered list: "No results" + "Clear filters" button.
Empty state của tab (VD: Completed orders tab): "No completed orders yet".

### 6.6 Error States

```tsx
// GET error
if (isError) {
  return <ErrorCard message={error.message} onRetry={refetch} />;
}

// 404
if (error?.code === 'ORDER_NOT_FOUND') {
  return <NotFoundState message="Order not found" onBack={navigation.goBack} />;
}
```

### 6.7 Toast System

Dùng `useToast` hook — không dùng `Alert.alert()` cho non-destructive feedback:

```ts
const toast = useToast();

// Success
toast.success('Added to cart');

// Error (manual dismiss)
toast.error('Payment failed. Please try again.');

// Warning
toast.warning('Some items are no longer available.');

// Info
toast.info('Session expired. Please sign in again.');
```

**Rules**:
- Position: bottom của màn hình (tránh notch).
- Max 3 toasts cùng lúc; queue các toast tiếp theo.
- Success/Info: auto-dismiss 4s. Warning: 6s. Error: manual dismiss.
- Mutation field errors (`fieldErrors[]`) đi inline trong form — không dùng toast.

### 6.8 Confirmation Bottom Sheets

Destructive action phải qua confirmation bottom sheet — không dùng `Alert.alert`:

```tsx
const { confirm } = useConfirmBottomSheet();

const handleCancelOrder = async () => {
  const ok = await confirm({
    title: 'Cancel this order?',
    description: 'This action cannot be undone.',
    confirmLabel: 'Yes, cancel',
    variant: 'destructive',
  });
  if (!ok) return;
  cancelOrder.mutate(orderId);
};
```

Swipe-down bottom sheet để dismiss mà không thực hiện action.

### 6.9 Gestures & Interactions

- Swipe-to-delete cho cart items và address list (dùng `react-native-swipe-list-view` hoặc `Swipeable` từ `react-native-gesture-handler`).
- Long-press để copy text (order code, shipment code, SKU): dùng `Clipboard.setStringAsync()` + toast "Copied".
- Pull-to-refresh trên mọi list screen và detail screen.
- Star rating: tap để select, có preview state khi drag.

### 6.10 Image Handling

- Tất cả `Image` phải có `defaultSource` (placeholder) và `onError` fallback.
- Product images trong list: set width/height theo grid column size.
- Product detail gallery: swipeable carousel.
- Avatar: có fallback initials nếu không có ảnh.

```tsx
<Image
  source={{ uri: product.imageUrl }}
  defaultSource={require('@/assets/images/placeholder-product.png')}
  onError={(e) => setImageError(true)}
  style={{ width: CARD_WIDTH, height: CARD_WIDTH * 1.2 }}
  resizeMode="cover"
/>
```

### 6.11 Accessibility

- Mọi `<Pressable>` phải có `accessibilityLabel` mô tả action.
- Icon-only button phải có `accessibilityLabel`.
- `accessibilityRole` đúng: `button`, `link`, `image`, `header`...
- Contrast ratio tối thiểu 4.5:1 cho text.

---

## 7. State Management Rules

### 7.1 Phân loại state

| Loại state | Tool |
|---|---|
| Server data (products, orders, cart...) | TanStack Query |
| Form state | React Hook Form |
| Global auth state (tokens, user info) | Zustand `authStore` |
| Global UI state (cart badge count, toast queue) | Zustand `uiStore` |
| Local UI state (modal open, selected tab) | `useState` |
| Navigation state | React Navigation |

**Không dùng Zustand cho server data.** Server data luôn sống trong TanStack Query cache.
**Không copy data từ Query cache vào state local** chỉ để dễ dùng — truy cập trực tiếp từ hook.

### 7.2 Auth Store

```ts
// src/shared/stores/authStore.ts

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  setTokens: (tokens: Tokens) => void;
  setUser: (user: AuthUser) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
  accessToken: null,
  refreshToken: null,
  user: null,
  isAuthenticated: false,
  setTokens: ({ accessToken, refreshToken }) =>
    set({ accessToken, refreshToken, isAuthenticated: true }),
  setUser: (user) => set({ user }),
  clear: () =>
    set({ accessToken: null, refreshToken: null, user: null, isAuthenticated: false }),
}));
```

Tokens lưu trong `expo-secure-store` — không lưu `AsyncStorage` (unencrypted). Store được bootstrap từ SecureStore khi app khởi động trong `AuthProvider`.

```ts
// src/shared/lib/secureStorage.ts
import * as SecureStore from 'expo-secure-store';

export const secureStorage = {
  getAccessToken: () => SecureStore.getItemAsync('access_token'),
  setAccessToken: (v: string) => SecureStore.setItemAsync('access_token', v),
  getRefreshToken: () => SecureStore.getItemAsync('refresh_token'),
  setRefreshToken: (v: string) => SecureStore.setItemAsync('refresh_token', v),
  clear: () => Promise.all([
    SecureStore.deleteItemAsync('access_token'),
    SecureStore.deleteItemAsync('refresh_token'),
  ]),
};
```

### 7.3 Cart Badge Store

Cart badge count là UI state — không cần refetch API chỉ để cập nhật số trên tab icon:

```ts
// src/shared/stores/cartStore.ts

interface CartState {
  badgeCount: number;
  setBadgeCount: (count: number) => void;
  increment: () => void;
  decrement: () => void;
}
```

Đồng bộ badge count sau mỗi lần `GET /cart` thành công (trích từ `totalItems` trong response).

### 7.4 Redirect Store

Lưu target screen khi session expire mid-flow:

```ts
// Trong uiStore hoặc authStore
redirectAfterLogin: string | null;
setRedirectAfterLogin: (target: string | null) => void;
```

### 7.5 Không duplicate state

- Nếu data đã có trong TanStack Query cache, không copy vào Zustand hay `useState`.
- Derive value bằng selector/memo thay vì tạo thêm state.

---

## 8. Forms & Validation

### 8.1 React Hook Form + Zod Pattern

```ts
// features/auth/schemas/authSchema.ts
import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
```

```tsx
// features/auth/components/LoginForm.tsx
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

export function LoginForm({ onSubmit }: LoginFormProps) {
  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  return (
    <>
      <Controller
        control={control}
        name="email"
        render={({ field }) => (
          <Input
            label="Email"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={errors.email?.message}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        )}
      />
      <Button
        label="Sign In"
        onPress={handleSubmit(onSubmit)}
        loading={isSubmitting}
      />
    </>
  );
}
```

### 8.2 Server Field Errors

```ts
mutation.mutate(data, {
  onSuccess: () => toast.success('Profile updated'),
  onError: (error) => {
    if (error.fieldErrors?.length) {
      error.fieldErrors.forEach(({ field, message }) => {
        form.setError(field as keyof FormValues, { message });
      });
    } else {
      toast.error(error.message ?? 'Something went wrong');
    }
  },
});
```

### 8.3 Dirty State Guard

Form quan trọng (address, profile) phải confirm trước khi navigate away khi có unsaved changes:

```ts
const isDirty = form.formState.isDirty;

useFocusEffect(
  useCallback(() => {
    return () => {
      if (isDirty) {
        // Show confirm bottom sheet nếu user back
      }
    };
  }, [isDirty])
);
```

### 8.4 Double Submit Prevention

Nút submit của checkout, place order, và review phải disabled sau tap đầu tiên:

```tsx
<Button
  label="Place Order"
  onPress={handleSubmit(onPlaceOrder)}
  loading={placeOrder.isPending}
  disabled={placeOrder.isPending}  // Prevent double tap
/>
```

---

## 9. Secure Storage & Token Handling

- Access token + refresh token lưu trong `expo-secure-store` (encrypted native storage).
- Không lưu token trong `AsyncStorage`, `MMKV` unencrypted, hay global variable.
- Token được load vào `authStore` khi app khởi động (trong `AuthProvider`).
- Axios interceptor đọc token từ `authStore` — không đọc trực tiếp từ SecureStore mỗi request.
- Khi logout: clear `authStore` + xóa token khỏi SecureStore + `queryClient.clear()`.

```ts
// src/app/providers/AuthProvider.tsx
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setTokens, setUser } = useAuthStore();
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  useEffect(() => {
    async function bootstrap() {
      const [accessToken, refreshToken] = await Promise.all([
        secureStorage.getAccessToken(),
        secureStorage.getRefreshToken(),
      ]);
      if (accessToken && refreshToken) {
        setTokens({ accessToken, refreshToken });
        // optionally: fetch /me to restore user info
      }
      setIsBootstrapping(false);
    }
    bootstrap();
  }, []);

  if (isBootstrapping) return <SplashScreen />;
  return <>{children}</>;
}
```

---

## 10. Offline & Network Handling

- Detect network status bằng `@react-native-community/netinfo`.
- Khi mất mạng: show persistent banner "No internet connection" (không toast — user cần biết liên tục).
- GET request: retry tự động tối đa 2 lần với delay 1s (cấu hình trong `queryClient.ts`).
- POST/PATCH/DELETE: **không auto-retry**. Show error toast với "Try again" action cho user tự trigger.
- Order placement timeout: show warning "Check My Orders before retrying" — không auto-retry.

```ts
// src/shared/lib/queryClient.ts
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      retryDelay: 1_000,
      staleTime: 30_000,
    },
    mutations: {
      retry: 0,  // Không auto-retry mutation
    },
  },
});
```

---

## 11. Optimistic Updates

Chỉ áp dụng cho action có failure rate thấp và rollback đơn giản:

| Action | Optimistic | Rollback |
|---|---|---|
| Mark notification read | ✅ | Restore trạng thái cũ + toast |
| Mark all notifications read | ✅ | Restore + toast |
| Remove cart item | ✅ | Re-insert tại vị trí cũ + toast |

**Không dùng optimistic update cho**: đặt hàng, thanh toán, thay đổi trạng thái, inventory — những action này cần confirmed server state.

```ts
useMutation({
  mutationFn: cartService.removeItem,
  onMutate: async (itemId) => {
    await queryClient.cancelQueries({ queryKey: queryKeys.cart.current() });
    const previous = queryClient.getQueryData(queryKeys.cart.current());
    queryClient.setQueryData(queryKeys.cart.current(), (old: Cart) => ({
      ...old,
      items: old.items.filter((i) => i.id !== itemId),
    }));
    return { previous };
  },
  onError: (_err, _itemId, context) => {
    queryClient.setQueryData(queryKeys.cart.current(), context?.previous);
    toast.error('Could not remove item. Please try again.');
  },
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.cart.current() });
  },
});
```

---

## 12. Error Handling

### 12.1 Error types

```ts
function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'success' in error &&
    (error as ApiError).success === false
  );
}
```

### 12.2 Screen-level error handling

```tsx
const { data, isError, error, refetch } = useOrderDetail(orderId);

if (isError) {
  if (isApiError(error) && error.code === 'ORDER_NOT_FOUND') {
    return <NotFoundState message="Order not found" onBack={navigation.goBack} />;
  }
  return <ErrorCard message={error?.message} onRetry={refetch} />;
}
```

### 12.3 Concurrency errors

`ORDER_STATUS_INVALID` (order bị update bởi admin trong lúc user đang xem):
1. Toast: "This order was updated. Refreshing…"
2. `refetch()` sau 1s.

### 12.4 Payment flow errors

- Polling timeout (30s, 10 lần): show "Payment is still being confirmed" screen với "Check Order Status" button.
- `PAYMENT_ALREADY_PROCESSED` (409): toast + disable "Pay Now" button.
- Payment window expired (`payment.expiredAt < now`): amber banner, remove "Pay Now" button.

### 12.5 Key error codes

| Code | Xử lý trên mobile |
|---|---|
| `INVENTORY_NOT_ENOUGH` | Inline error trên cart/checkout; toast nếu là cart add |
| `VOUCHER_EXPIRED` | Inline error trên voucher row ở checkout |
| `ORDER_CANNOT_CANCEL` | Toast error |
| `ORDER_STATUS_INVALID` | Toast + auto-refetch |
| `REVIEW_NOT_ELIGIBLE` | Error banner, redirect về My Orders |
| `CONFLICT` (409) trên review | Toast "Already reviewed", navigate My Reviews |
| `ACCOUNT_DISABLED` | Error inline Login; không toast |

---

## 13. Branching & Commit Conventions

### Branch types
- `dev`: branch chính của mobile team
- `feat/`: tính năng mới
- `bugfix/`: sửa lỗi
- `hotfix/`: fix gấp production
- `refactor/`: tái cấu trúc

### Branch naming
```
{type}/{task_id}_{title}
```

Ví dụ:
- `feat/2001_product_list_screen`
- `bugfix/2042_fix_cart_badge_count`
- `refactor/2088_checkout_flow_cleanup`

### Commit message
```
{type}({feature}): {title}

{description nếu cần}

{Fixes/Complete #issue_number}
```

Ví dụ:
```
feat(checkout): implement 4-step checkout wizard

Add address, payment method, voucher, and review steps
Add validation gates between steps
Handle inventory race on order placement

Complete #2010
```

---

## 14. Environment Config

```ts
// src/constants/config.ts
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL!;
export const REQUEST_TIMEOUT = 15_000;
export const POLLING_INTERVAL = 3_000;
export const POLLING_MAX_ATTEMPTS = 10;
export const SEARCH_DEBOUNCE_MS = 300;
export const NUMERIC_DEBOUNCE_MS = 500;
```

```env
# .env.local
EXPO_PUBLIC_API_BASE_URL=http://localhost:8080/api/v1

# .env.production
EXPO_PUBLIC_API_BASE_URL=https://api.fashionshop.com/api/v1
```

Không commit `.env.local` hay `.env.production`. Chỉ commit `.env.example`.

---

## 15. Development Priorities

### Phase 1 — Core Customer Flow
- auth (login / register / token refresh)
- product listing + detail
- variant selection
- cart management
- checkout 4-step flow
- order list + detail
- order cancellation

### Phase 2
- online payment flow + result screen
- shipment tracking
- invoice view
- voucher entry in checkout

### Phase 3
- review write + my reviews
- notifications
- profile + address book
- pull-to-refresh everywhere
- deep links

---

## 16. AI Collaboration Instructions

Khi AI hỗ trợ code trong project này:

1. Không tự ý thêm thư viện ngoài stack đã định nghĩa.
2. Luôn viết TypeScript strict — không dùng `any`, không bỏ qua type error.
3. Mọi API call đi qua: service → custom hook → screen. Không shortcut.
4. Khi tạo feature mới: tạo đủ service, hook(s), schema, types, components, screen(s).
5. Khi tạo form: Zod schema + React Hook Form + field error display + dirty guard nếu cần.
6. Không viết business logic trong screen/component. Screen chỉ render và handle UI event.
7. Dùng `FlatList` cho list — không dùng `ScrollView` + `.map()`.
8. Luôn handle 3 state của async operation: loading (skeleton/spinner), error (`ErrorCard`), success.
9. Mọi nút destructive phải qua `ConfirmBottomSheet` — không dùng `Alert.alert`.
10. Tokens lưu trong `expo-secure-store` — không dùng `AsyncStorage` cho sensitive data.
11. Không auto-retry POST/PATCH/DELETE. Mutation failure phải do user trigger lại.
12. Giữ nhất quán naming convention, file structure, và import pattern với phần còn lại của codebase.
