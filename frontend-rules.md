# Frontend Rules — Fashion Shop Customer Mobile App

> Applies to: `src/` in the React Native + Expo managed workflow project.
> Role served: `CUSTOMER` only.

---

## 1. Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Framework | React Native + Expo (managed workflow) | latest stable |
| Language | TypeScript | strict mode |
| Navigation | React Navigation | v6 |
| Server state | TanStack Query | v5 |
| Client state | Zustand | latest |
| Forms | React Hook Form + Zod | latest |
| Styling | NativeWind (Tailwind for RN) | latest |
| HTTP | Axios | single instance |
| Secure storage | expo-secure-store | latest |
| Icons | @expo/vector-icons | latest |

No library outside this list may be added without explicit approval. Do not install alternatives (e.g. `AsyncStorage` for tokens, `TouchableOpacity` for new buttons, `ScrollView+map` for lists).

---

## 2. Folder Structure Principles

Architecture is **feature-based**. Every feature is self-contained.

```
src/
├── app/                   # Entry, navigation tree, global providers
│   ├── navigation/        # RootNavigator, AuthNavigator, MainNavigator, linking, types
│   └── providers/         # QueryProvider, AuthProvider
├── features/              # Feature modules
│   ├── auth/
│   ├── products/
│   ├── cart/
│   ├── checkout/
│   ├── orders/
│   ├── payment/
│   ├── shipment/
│   ├── invoice/
│   ├── reviews/
│   ├── notifications/
│   └── profile/
├── shared/                # Used across all features
│   ├── components/ui/     # Button, Input, Badge, Divider, Avatar
│   ├── components/feedback/   # Toast, Skeleton*, EmptyState, ErrorCard
│   ├── components/layout/     # ScreenWrapper, SectionHeader
│   ├── components/overlays/   # ConfirmBottomSheet, LoadingOverlay, FilterBottomSheet
│   ├── hooks/             # useDebounce, useRefreshOnFocus, useInfiniteList, useToast
│   ├── lib/               # axios.ts, queryClient.ts, secureStorage.ts
│   ├── stores/            # authStore.ts, uiStore.ts
│   ├── types/             # api.types.ts, auth.types.ts, enums.ts
│   └── utils/             # formatMoney, formatDate, formatRelativeTime
├── constants/             # queryKeys.ts, routes.ts, config.ts
└── main.tsx
```

### Structural rules

- **Cross-feature imports are forbidden.** `features/A` must not import from `features/B`. Move shared code to `shared/`.
- Each feature's `index.ts` exports only its **public API**. Internal components and hooks are not exported.
- Screens only compose components and call hooks. No API calls, no business logic inside screens.
- No catch-all `helpers/` or `utils/` folders. Utilities must have clear scope (`shared/utils/` or `features/X/utils/`).
- File name must match the default export name: `ProductCard.tsx` not `index.tsx`.

### Each feature must contain

```
features/<name>/
├── components/    # UI components scoped to this feature
├── hooks/         # Data-fetching hooks (useQuery / useMutation wrappers)
├── screens/       # Screen components (compose only)
├── schemas/       # Zod validation schemas
├── services/      # API call functions (pure, no React)
├── types/         # Feature-specific TypeScript types
└── index.ts       # Public exports only
```

---

## 3. TypeScript Rules

- `strict: true`. Do not disable any strict flag.
- Never use `any`. Use `unknown` with type guards when the shape is not known.
- Never use `as SomeType` unless a type-guard or runtime check precedes it.
- Always type API responses. Response types must never be `any` or untyped.
- Use `type` for data shapes. Use `interface` for contracts that may be extended.
- Map backend enums to `const` object + union type — never use TypeScript `enum`:

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

---

## 4. Component Rules

- Functional components only. No class components.
- One file = one primary component.
- Props must be explicitly typed. Never use `React.FC<any>`.
- Components do not call API directly. All data fetching goes through custom hooks.
- Named export + default export pattern:

```ts
// Correct
export function ProductCard({ product }: ProductCardProps) { ... }
export default ProductCard;

// Wrong
export default () => <View />;
```

- Use only React Native primitives: `<View>`, `<Text>`, `<Pressable>`, `<Image>`, `<FlatList>`, `<ScrollView>`. Never use HTML elements.
- Use `<Pressable style={({ pressed }) => ...}>` for all new interactive elements. Do not use `TouchableOpacity` in new code.
- All text must be inside `<Text>`. Never render raw strings inside `<View>`.
- Never hardcode pixel dimensions. Use `Dimensions.get('window')`, percentages, or flexbox.
- Every `<Image>` must have explicit `width` and `height`, a `defaultSource` placeholder, and an `onError` fallback.
- All lists use `<FlatList>` or `<SectionList>`. Never use `<ScrollView> + .map()` for long lists.
- Every `<FlatList>` must have an explicit `keyExtractor` using the item's ID.

### Naming conventions

| Artifact | Convention | Example |
|---|---|---|
| Screen file | PascalCase + `Screen` suffix | `ProductDetailScreen.tsx` |
| Component file | PascalCase | `ProductCard.tsx` |
| Hook file | camelCase, `use` prefix | `useProductDetail.ts` |
| Service file | camelCase, `Service` suffix | `productService.ts` |
| Schema file | camelCase, `Schema` suffix | `checkoutSchema.ts` |
| Type file | camelCase, `.types` suffix | `product.types.ts` |
| Store file | camelCase, `Store` suffix | `authStore.ts` |
| Query key | Factory pattern | `queryKeys.products.detail(id)` |

---

## 5. API Integration Rules

### 5.1 Single Axios instance

File: `src/shared/lib/axios.ts`. Only one Axios instance exists in the entire app.

```ts
export const apiClient = axios.create({
  baseURL: API_BASE_URL,   // from constants/config.ts
  headers: { 'Content-Type': 'application/json' },
  timeout: REQUEST_TIMEOUT, // 15_000 ms
});
```

### 5.2 Request interceptor

Attaches `Authorization: Bearer <accessToken>` from `authStore` on every request.

### 5.3 Response interceptor

- Unwraps `data.data` from the `ApiResponse<T>` wrapper before returning to the caller.
- On 401: attempts `POST /auth/refresh-token`.
  - If refresh succeeds: store new tokens; retry original request once.
  - If refresh fails: clear `authStore`; navigate to Login with `redirect` param; show toast "Session expired. Please sign in again."
- Implements request queue: if a refresh is in-flight, queue subsequent 401ed requests and replay them all after refresh completes.
- Maps `fieldErrors[]` to `Record<string, string>` for use with React Hook Form's `setError`.

### 5.4 Response types

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
  number: number;  // zero-based
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

### 5.5 Service layer pattern

Services are pure functions. They call the API and return data. They have no knowledge of React, hooks, or stores.

```ts
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

### 5.6 TanStack Query rules

- `useQuery` / `useInfiniteQuery` for all GET requests.
- `useMutation` for POST / PATCH / DELETE.
- Default `staleTime`: 30 s for lists, 60 s for detail.
- After a successful mutation: call `queryClient.invalidateQueries` on affected keys.
- Never call API inside `useEffect`. All data fetching goes through TanStack Query.
- Use `useRefreshOnFocus` on every screen to refetch when navigating back.

### 5.7 Query key factory

```ts
// src/constants/queryKeys.ts
export const queryKeys = {
  products: {
    all: ['products'] as const,
    lists: () => [...queryKeys.products.all, 'list'] as const,
    list: (params: ProductListParams) => [...queryKeys.products.lists(), params] as const,
    detail: (id: number) => [...queryKeys.products.all, 'detail', id] as const,
  },
  // cart, orders, notifications, etc. follow same pattern
};
```

### 5.8 Infinite scroll

List screens use `useInfiniteQuery` with `FlatList.onEndReached`. Page param is zero-based.

```ts
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

### 5.9 Network retry policy

```ts
// src/shared/lib/queryClient.ts
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 2, retryDelay: 1_000, staleTime: 30_000 },
    mutations: { retry: 0 },  // Never auto-retry mutations
  },
});
```

---

## 6. Auth and Session Handling

- Access token and refresh token are stored exclusively in `expo-secure-store` (encrypted).
- Never store tokens in `AsyncStorage`, `MMKV` (unencrypted), or JavaScript-scoped variables.
- On app start, `AuthProvider` bootstraps tokens from SecureStore into `authStore`.
- `AuthProvider` shows `<SplashScreen />` while bootstrapping; shows children once complete.
- Axios request interceptor reads token from `authStore` (in-memory), not from SecureStore on each request.
- On logout: `authStore.clear()` + `secureStorage.clear()` + `queryClient.clear()`.
- Auth guard lives in `RootNavigator`: reads `authStore.isAuthenticated` and switches between `AuthNavigator` and `MainNavigator`.
- When session expires mid-flow: save the current target screen to `authStore.redirectAfterLogin`; after successful login, navigate to that target.

---

## 7. Navigation Rules

### Navigator tree

```
RootNavigator (Stack)
├── AuthNavigator (Stack)
│   ├── LoginScreen
│   └── RegisterScreen
└── MainNavigator (Bottom Tab)
    ├── HomeTab → ProductListScreen, ProductDetailScreen
    ├── CartTab → CartScreen, CheckoutStack (4 steps + confirmation)
    ├── OrdersTab → OrderListScreen, OrderDetailScreen, PaymentResultScreen, ShipmentTrackingScreen
    ├── NotificationsTab → NotificationScreen
    └── ProfileTab → ProfileScreen, AddressBookScreen, AddressFormScreen, MyReviewsScreen, WriteReviewScreen, InvoiceScreen
```

### Typed navigation — mandatory

Every navigator must have a typed param list. Never use `useNavigation()` untyped.

```ts
const navigation = useNavigation<NavigationProp<HomeStackParamList>>();
const { productId } = useRoute<RouteProp<HomeStackParamList, 'ProductDetail'>>().params;
```

### Navigation rules

- Use `navigation.navigate()` when the user should be able to go back.
- Use `navigation.replace()` when back navigation should be prevented (e.g. after login, after order confirmation).
- After successful order placement: `navigation.replace('OrderConfirmation', { orderId })`.
- Tapping a completed checkout step navigates back (not forward) to that step.
- Deep links are configured in `src/app/navigation/linking.ts` using `fashionshop://` prefix.
- Route name constants live in `src/constants/routes.ts`. Never hardcode route strings in components.

### Deep links

| URL | Screen |
|---|---|
| `fashionshop://orders/:orderId` | OrderDetailScreen |
| `fashionshop://orders/:orderId/payment` | PaymentResultScreen |
| `fashionshop://orders/:orderId/tracking` | ShipmentTrackingScreen |

---

## 8. State Management Rules

### State classification

| State type | Tool |
|---|---|
| Server data (products, orders, cart…) | TanStack Query cache |
| Form state | React Hook Form |
| Auth (tokens, user info) | Zustand `authStore` |
| Cart badge count, toast queue, redirect target | Zustand `uiStore` |
| Local UI (modal open, selected tab…) | `useState` |
| Navigation state | React Navigation |

### Key rules

- Never use Zustand to store server data. Server data lives exclusively in TanStack Query cache.
- Never copy data from the Query cache into local state just for convenience. Read directly from the hook.
- Derive values using selectors/memo instead of creating redundant state.

### Auth store shape

```ts
interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  redirectAfterLogin: string | null;
  setTokens: (tokens: Tokens) => void;
  setUser: (user: AuthUser) => void;
  setRedirectAfterLogin: (target: string | null) => void;
  clear: () => void;
}
```

### Cart badge store

`uiStore` holds `badgeCount` synced from `GET /cart` response's `totalItems` field. Badge is UI-only — never trigger a separate API call just to update it.

### Optimistic updates

Apply only to low-risk actions with simple rollback:

| Action | Optimistic | Rollback |
|---|---|---|
| Mark notification read | Dim unread dot immediately | Restore + toast |
| Mark all notifications read | Clear all dots immediately | Restore + toast |
| Remove cart item | Remove row immediately | Re-insert at original position + toast |

Never use optimistic updates for: order creation, payment, status changes, or inventory operations.

---

## 9. Form Validation Rules

### Pattern: Zod schema → React Hook Form → Controller → Input

```ts
// Schema
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});
export type LoginFormValues = z.infer<typeof loginSchema>;

// Form
const { control, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
  resolver: zodResolver(loginSchema),
  defaultValues: { email: '', password: '' },
});
```

### Server field errors

```ts
onError: (error) => {
  if (error.fieldErrors?.length) {
    error.fieldErrors.forEach(({ field, message }) => {
      form.setError(field as keyof FormValues, { message });
    });
  } else {
    toast.error(error.message ?? 'Something went wrong');
  }
}
```

### Field error display rules

- Field errors appear inline below the input with a red border.
- Never show `fieldErrors` as toasts.
- Scroll to the first error field automatically after a failed submit.
- `returnKeyType="next"` on middle fields; `"done"` on the last field.

### Dirty state guard

Address forms and profile forms must show a confirmation bottom sheet if the user navigates away with unsaved changes.

### Double submit prevention

Buttons for checkout, place order, write review, and any critical mutation must be disabled after the first tap:

```tsx
<Button
  label="Place Order"
  onPress={handleSubmit(onPlaceOrder)}
  loading={placeOrder.isPending}
  disabled={placeOrder.isPending}
/>
```

---

## 10. Reusable Component Rules

### Shared UI primitives (`shared/components/ui/`)

| Component | Required props |
|---|---|
| `Button` | `label`, `onPress`, `loading?`, `disabled?`, `variant?` |
| `Input` | `value`, `onChangeText`, `label?`, `error?`, `secureTextEntry?` |
| `Badge` | `label`, `variant` (maps to a status colour) |
| `Avatar` | `uri?`, `initials`, `size` |
| `Divider` | none |

### Layout wrappers

- `ScreenWrapper` — wraps `SafeAreaView` + `KeyboardAvoidingView`. Use on every screen. Eliminates notch/home indicator overlap and keyboard-over-content issues.
- `SectionHeader` — section label with optional right action.

### Feedback components

- `SkeletonCard` — for product grid and order card loading.
- `SkeletonDetail` — for order detail, product detail, and payment detail loading.
- `SkeletonTimeline` — for shipment event loading.
- `EmptyState` — requires `icon`, `title`, `description`. Optional `action`.
- `ErrorCard` — requires `message`, `onRetry`. Used on GET errors.

### Overlays

- `ConfirmBottomSheet` — required for all destructive actions. Do not use `Alert.alert`.
- `LoadingOverlay` — full-screen blocking overlay with message. Use for place order and payment initiation.
- `FilterBottomSheet` — for product filtering UI.

---

## 11. Loading / Empty / Error State Requirements

Every screen must handle all three async states. No exceptions.

### Loading states

| Scenario | UI |
|---|---|
| Initial screen load (GET) | Skeleton component matching the screen layout |
| Button-triggered mutation | Button shows `ActivityIndicator`; label changes; button disabled |
| Infinite scroll load-more | `ActivityIndicator` in `ListFooterComponent` |
| Full-screen blocking (place order, initiate payment) | `<LoadingOverlay>` with status message |
| Pull-to-refresh | `RefreshControl` on `FlatList` |

Rules:
- Show skeleton on initial load only. Show spinner on subsequent user-triggered actions.
- Never show skeleton and real content simultaneously.
- Skeleton animates shimmer left-to-right.

### Empty states

Every list screen must have a specific empty state:

```tsx
<EmptyState
  icon="shopping-bag"
  title="Your cart is empty"
  description="Add items to start shopping"
  action={{ label: 'Start Shopping', onPress: () => navigation.navigate(Routes.ProductList) }}
/>
```

- Filtered list with no results: "No results" + "Clear filters" button.
- Tab with no items: contextual message ("No completed orders yet").
- Never show a blank screen.

### Error states

```tsx
// Generic GET error
if (isError) return <ErrorCard message={error.message} onRetry={refetch} />;

// 404 specific
if (isApiError(error) && error.code === 'ORDER_NOT_FOUND') {
  return <NotFoundState message="Order not found" onBack={navigation.goBack} />;
}
```

### Error code handling table

| Code | Context | UI Response |
|---|---|---|
| `INVENTORY_NOT_ENOUGH` | Cart, Checkout | Inline error per row or inline banner |
| `VOUCHER_EXPIRED` | Checkout | Inline error on voucher row |
| `ORDER_CANNOT_CANCEL` | Order detail | Toast error |
| `ORDER_STATUS_INVALID` | Any order action | Toast + auto-refetch after 1 s |
| `REVIEW_NOT_ELIGIBLE` | Write review | Error banner + redirect to My Orders |
| `CONFLICT` (409) on review | Write review | Toast "Already reviewed" + navigate My Reviews |
| `ACCOUNT_DISABLED` | Login | Inline error below form; no toast |
| `PAYMENT_ALREADY_PROCESSED` | Payment | Toast + disable Pay Now |

---

## 12. Mobile-First UX Rules

### Touch targets

- Minimum: **44×44 dp** (iOS) / **48×48 dp** (Android).
- Small visual elements: add `hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}`.
- Primary buttons: `height: 52`, full-width.
- Destructive buttons: never placed at the bottom edge where accidental taps are common.

### Keyboard handling

- All screens with forms must wrap in `<KeyboardAvoidingView behavior="padding">` (iOS) / `"height"` (Android).
- Inside forms, use `<ScrollView keyboardShouldPersistTaps="handled">`.
- Scroll to first error field on submit failure.
- Set `returnKeyType` appropriately: `"next"` for middle fields, `"done"` for last.

### Safe area

- All screens use `<ScreenWrapper>` (which includes `SafeAreaView`).
- Never let content be obscured by notch, status bar, or home indicator.

### Gestures

- Swipe-to-delete for cart items and address cards.
- Long-press to copy order codes, shipment codes, SKUs: `Clipboard.setStringAsync()` + toast "Copied".
- Pull-to-refresh on every list screen and detail screen.
- Star rating in review form: tap to select, drag preview state.

### Images

```tsx
<Image
  source={{ uri: product.imageUrl }}
  defaultSource={require('@/assets/images/placeholder-product.png')}
  onError={() => setImageError(true)}
  style={{ width: CARD_WIDTH, height: CARD_WIDTH * 1.2 }}
  resizeMode="cover"
/>
```

### Toast system

```ts
toast.success('Added to cart');          // auto-dismiss 4 s
toast.info('Session restored.');         // auto-dismiss 4 s
toast.warning('Item availability changed.'); // auto-dismiss 6 s
toast.error('Payment failed. Try again.');   // manual dismiss
```

- Position: bottom of screen.
- Max 3 visible; queue the rest.
- Field errors are always inline, never toasts.

### Confirmation bottom sheets

Every destructive action requires a confirmation bottom sheet. `Alert.alert` is forbidden.

```tsx
const ok = await confirm({
  title: 'Cancel this order?',
  description: 'This action cannot be undone.',
  confirmLabel: 'Yes, cancel',
  variant: 'destructive',
});
if (!ok) return;
cancelOrder.mutate(orderId);
```

### Accessibility

- Every `<Pressable>` must have `accessibilityLabel`.
- Icon-only buttons must have `accessibilityLabel`.
- `accessibilityRole` must be set correctly: `button`, `link`, `image`, `header`.
- Minimum contrast ratio: 4.5:1 for text.

### Money display

- Always display values as returned by API — never compute totals client-side.
- Show `salePrice` in accent colour with strikethrough `price` when `salePrice` is set.
- Hide discount rows when `discountAmount = 0`.
- Business codes (order, shipment, invoice) use monospace font; long-press to copy.

### Offline / network

- Detect network status with `@react-native-community/netinfo`.
- On loss of connection: persistent banner "No internet connection" (not a toast).
- GET: auto-retry up to 2× with 1 s delay.
- POST/PATCH/DELETE: never auto-retry. Show error toast with "Try again" for user to trigger manually.
- On order placement timeout: toast "Connection lost. Check My Orders before retrying." Do not auto-retry.

---

## 13. Code Quality Rules for Claude

When implementing features, follow these rules without exception:

1. Do not add libraries outside the defined stack.
2. TypeScript strict mode only. Never use `any`. Never suppress type errors.
3. All API calls follow the chain: screen → hook → service → Axios instance. No shortcuts.
4. When creating a new feature: create all of service, hook(s), schema, types, component(s), and screen(s).
5. When creating a form: Zod schema + React Hook Form + inline field error display + dirty guard if needed.
6. No business logic in screens or components. Screens render and handle UI events only.
7. Use `FlatList` for all lists. Never use `ScrollView + .map()`.
8. Always handle all three async states: loading (skeleton/spinner), error (`ErrorCard`), success (content).
9. All destructive actions go through `ConfirmBottomSheet`. Never use `Alert.alert`.
10. Tokens stored only in `expo-secure-store`. Never use `AsyncStorage` for sensitive data.
11. Never auto-retry POST/PATCH/DELETE. Mutation failures must be user-triggered.
12. Maintain consistent naming, file structure, and import patterns with the rest of the codebase.
13. No `console.log` in production code.
14. No hardcoded URL strings, API paths, or route names in components. Use `constants/`.
15. No comments explaining what the code does. Comments only for non-obvious why.
