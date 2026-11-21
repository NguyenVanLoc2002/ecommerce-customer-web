# Phase 2 contract readiness

Initial source review: 2026-11-21. Expanded documentation/source reconciliation: 2026-11-22. This documents local source, not deployment verification or approval to begin implementation.

## Evidence baseline

| Repository | Branch | HEAD |
| --- | --- | --- |
| Backend | dev | `1000141eb905c1e76d7d7197d6469117a5b8b135` |
| Admin Web | dev | `62b90dfe9810e2203886b0c184d92e6a08de11fc` |
| Customer Web | dev | `88a403cdeb195a020d4c6ca19c425ee80dc8a10b` |

Backend/Admin were clean; Customer Web already had untracked preview artifacts. No fetch, deployed-version check, authenticated live journey or database mutation was performed. Recheck revisions and runtime before Phase 2. No GitHub issue was supplied; scope comes from the user's documentation reconciliation request.

BE paths below are relative to `../ecommerce-backend/src/main/java/com/locnguyen/ecommerce/`; Admin paths are relative to `../ecommerce-admin-web/src/features/products/`.

## Verified capabilities

| Area | Current implementation and implication | Evidence |
| --- | --- | --- |
| Multiple variants | Product detail by ID/slug includes variants, SKU, prices, status and catalog attribute/value IDs. Listing does not contain the variant matrix. Attributes can extend beyond color/size. | BE `domains/product/dto/VariantResponse.java`, `VariantAttributeResponse.java`, `ProductDetailResponse.java`, `domains/product/service/impl/ProductServiceImpl.java` |
| Admin | Variant CRUD and attribute catalog selection already exist. No new backend variant model is needed for ordinary product selection. | Admin `services/variantService.ts`, `services/attributeCatalogService.ts` |
| Inventory | Detail excludes deleted variants but includes inactive ones; cart rejects inactive variants. Public list/detail have no stock quantity. Admin inventory uses a separate protected API. | BE `ProductServiceImpl.toDetailResponse`, `domains/admin/controller/AdminInventoryController.java`; Admin `services/productInventoryService.ts` |
| Cart/reservation | Cart returns aggregated `availableStock` by variant. Checkout reserves against a selected warehouse and can reject insufficient inventory. Cart availability is not a reservation. | BE `domains/cart/service/impl/CartServiceImpl.java`, `domains/order/service/impl/OrderServiceImpl.java` |
| Price/media | Effective price is non-null sale price or base price. Detail min/max span non-deleted variants. Media includes type, primary, sort order and optional variant association. | BE `ProductServiceImpl.toDetailResponse`; Admin `services/productService.ts` |
| Checkout | Carrier options, cart-aware order preview and creation exist. Shipping is recalculated server-side; absent carrier gives zero shipping. Preserve preview invalidation and idempotency. | BE `OrderServiceImpl.previewOrder`, `applyShippingSelection`; Customer `src/features/checkout/services/checkoutService.ts`, `hooks/useCheckout.ts`, `lib/checkoutOrder.ts` |
| Voucher | Validation endpoint does not redeem; preview calculates cart-aware discount; creation validates and atomically applies/redeems it. The previous claim that creation only stores the code was obsolete. | BE `OrderServiceImpl.applyVoucherPreview`, `applyVoucherDuringCheckout`, `domains/promotion/service/impl/VoucherServiceImpl.java` |
| Payment | Initiation returns provider redirect data; PayPal capture is separate. Customer amounts remain VND; provider conversion belongs to backend. Preserve return/cancel/capture/status flows. | BE `domains/payment/controller/PaymentController.java`, `dto/PaymentResponse.java`, backend `docs/customer-api-contract.md`; Customer `src/features/payment/services/paymentService.ts` |
| Cancellation | Ownership/transition checks apply; paid ONLINE cancellation is rejected. Cancellation does not imply refund. | BE `OrderServiceImpl.cancelMyOrder`, `doCancelOrder` |
| Shipment/invoice | Customer tracking includes provider status/link. Invoice can be absent; issued/paid/partial refund/refund/void states exist. Invoice API returns print data, not PDF. | BE `domains/shipment/dto/ShipmentResponse.java`, `domains/invoice/service/impl/InvoiceServiceImpl.java`, backend customer contract |
| Reviews | Product reviews are fetched separately; product list DTO has no rating aggregate. | BE `domains/review/controller/ReviewController.java`; Customer `src/shared/components/catalog/ReviewSection.tsx` |
| Newsletter/editorial | No dedicated subscription/editorial campaign endpoint was found by source search in BE/Admin. Product descriptions and featured listings exist. | Source search and product DTOs; real newsletter/CMS behavior needs a separate decision |

## Existing Customer Web gaps

No behavior was changed during this review.

1. `src/shared/lib/productDetailMapper.ts` assigns API variants `stock: 0`; PDP uses this to emit `OutOfStock` in JSON-LD. Missing inventory is unknown. Exact PDP stock needs a customer-safe API extension; never call Admin inventory from Customer Web.
2. Mapper retains only COLOR/SIZE, falls back to parsing names, and drops attribute/value IDs and status. PDP matches two display strings and falls back to the first variant. Variants differing by a third attribute can collapse. Agree a generic selector or explicit catalog constraint before claiming all Admin variants work.
3. Customer types omit full attribute identity (`attributeId`, `attributeName`, `valueId`) and detail min/max prices. Align types/mapping with any approved integration correction.
4. Mapper accepts VIDEO as image; gallery receives product media rather than selected variant media. Define filtering, variant association and fallback.
5. PDP compare-at fallback can inherit a product value when the selected SKU has no compare-at price. Strike-through prices must belong to the selected SKU.
6. Catalog `formatMoney` defaults to USD and PDP JSON-LD hardcodes USD. Customer commerce amounts are VND. Correct display and structured data together without speculative currency conversion.
7. `checkoutService.validateVoucher` sends only `orderAmount`, although scoped validation accepts product/category/brand context. Cart-aware preview already exists. Verify scoped vouchers and agree any validation-step correction separately; never invent context IDs or discount calculations.
8. Prototype stock, ratings, USD prices, price sorting, wishlist, add feedback, delivery/returns claims and newsletter success are fixtures, not approved API behavior.
9. Product reviews are labelled public in upstream docs/comments, but `SecurityConfig.PUBLIC_GET` omits `/reviews/product/**` and the fallback requires authentication. Guest PDP reviews need an explicit access-state design or an approved backend change; do not silently treat 401 as zero reviews.

## Second-pass reconciliation, 2026-11-22

Rechecked Backend HEAD `1000141` and Admin HEAD `62b90df`, unchanged from the baseline. Read both repositories' API documents and verified disputed statements against Backend controllers, DTOs, response wrappers, security configuration, mappers, services and enums.

Documents consulted:

- Backend `docs/customer-api-contract.md`, `docs/api-common.md`.
- Admin `docs/api/admin-api-contract.md`, `docs/api/api-common.md`, including variants/attribute validation, media upload, inventory, order/carrier and invoice sections.
- Customer root `API.md`, `AGENTS.md` and `docs/api-integration-gaps.md`.

| Surface checked | Backend source evidence | FE documentation outcome |
| --- | --- | --- |
| Auth payload/refresh | `domains/auth/controller/AuthController.java`, `dto/AuthResponse.java`, `dto/TokenResponse.java` | Corrected login/register to `data.user` + `data.tokens`; refresh remains `data.accessToken`. Customer cookie-only policy retained despite legacy BE body fallback. |
| Password recovery/change | Auth request DTOs, `PasswordResetServiceImpl`, `common/validation/PasswordPolicyValidator.java` | Endpoints exist. Added reset expiry and reset/change 8-128 limit; registration stays 8-64. |
| Security/CSRF | `common/config/SecurityConfig.java`, `common/security/CsrfDoubleSubmitFilter.java` | Documented implemented, configuration-gated CSRF on refresh/logout; corrected review-read access. |
| Envelope/status | `common/response/ApiResponse.java`, customer controller annotations | Void `data` may be omitted, not guaranteed explicit null. Factory `created()` alone does not make HTTP 201; review creation remains 200. |
| Profile/address | `domains/user/controller/UserController.java`, `dto/UpdateProfileRequest.java`; address controller/request DTOs and enums | Field limits and enum values added; existing methods preserved. |
| Catalog/cart | Product/variant DTOs and `ProductServiceImpl`, `CartServiceImpl`; category/brand controllers/services; Admin variant/media/inventory docs | Prior multiple-variant, unknown inventory and separate Admin contract findings retained. |
| Order/voucher/carrier | Order DTOs, `OrderServiceImpl`, `VoucherServiceImpl`, Admin order/carrier docs | Removed unsupported order-item `effectivePrice`; invoice item field retained. Documented exact address keys and distinct lifecycle states. |
| Payment | `PaymentController`, `PaymentCaptureRequest`, `PaymentRecordStatus`, `MockPaymentCompletionController` | Capture limits, dev-only completion and payment/order status distinction added; obsolete callback path not restored. |
| Shipment/invoice | `ShipmentResponse`, `ShipmentMapper.toCustomerResponse`, `ShipmentStatus`; invoice service/contract and Admin docs | Added derived attention; explicitly excluded Admin-only costs/booking/override fields. Existing invoice lifecycle/absence notes retained. |
| Review/notification | Review controller/service/DTO, notification controller/DTO | Corrected review authentication, obsolete moderation route claims and void serialization; retained notification references and customer ownership. |
| Errors | `common/exception/ErrorCode.java` | Added relevant payment provider/config/currency and checkout carrier error names. Existing 422 review eligibility and validation semantics retained. |

Upstream inconsistencies found and resolved locally:

| Upstream text | Executable evidence | Resolution for Customer Web |
| --- | --- | --- |
| BE common auth notes can imply flat login tokens; Admin common docs correctly specify nested tokens | `AuthResponse` has `user` and `tokens` | Use the DTO shape; do not copy a flat auth example. |
| BE common/customer auth sections still say password reset/change is not implemented, while later sections document it | `AuthController` and password reset service implement the flow | Keep existing password routes; remove the archived-auth precedence exception from FE instructions. |
| Admin common docs describe `/payments/callback` and unsigned callback TODO | Current payment controller/webhook routes and signature verification contract | Use current provider flow; no callback request from Customer Web. |
| Admin common docs say CSRF is disabled; BE prose calls it future work | Dedicated filter is registered and configuration-gated | Document implemented capability, with deployed toggle/bootstrap behavior still unverified. |
| BE customer docs call product reviews public | Security whitelist omits the path | Document authenticated behavior and flag guest reviews as a decision point. |
| BE customer docs list legacy moderation paths outside `/admin` | Current customer review controller has only submit/my/product; moderation controller uses `/admin/reviews` | Do not introduce legacy paths into customer integration. |
| Upstream no-content examples show `data: null` | Wrapper has `@JsonInclude(NON_NULL)` | Accept absent or null void data. |

Backend/Admin documents were inspected, not edited. Their discrepancies are recorded here so future FE work does not import them again. FE documentation is aligned with the inspected source for the customer-facing scope above; remote branches, deployed configuration and end-to-end behavior remain unverified. No runtime tests/build were needed for these documentation edits.

## Phase 2 boundary and acceptance

The UI-only implementation is still awaiting approval. Documentation updates do not authorize changed selection/validation/authentication behavior or new endpoints. Recommended prerequisite: agree a bounded Customer Web contract-alignment task for variant identity/status, unknown inventory, media binding, currency and scoped-voucher handling. Most use current APIs; exact pre-cart stock requires a separate backend contract decision. Persisted wishlist, operational newsletter and editorial CMS also need a product decision or omission from the design.

After approval, use isolated local/test fixtures and record actual results:

- Multiple color/size combinations, unequal prices, missing combinations, inactive variant, variant media, no media, third attribute and absent COLOR/SIZE. Confirm selected ID/price/image and reset between products.
- Guest login return, authenticated add, duplicate-submit prevention and API errors; cart update/remove/clear and stock changes. Never display unknown inventory as a count.
- Scoped/expired/exhausted vouchers, carrier quote and no-carrier fallback. Preview/create use server totals. Same key/payload retries must not duplicate order/redemption/reservation; changed payload gets a new key.
- COD and configured online provider, capture/polling, cancelled return, session expiry and recovery. Mock evidence is separate from real provider evidence.
- Order/shipment/invoice/review lifecycle, unavailable/error states; retain profile/auth/notification behavior.
- Desktop/mobile, keyboard/focus, loading/error/empty/pending/success, accurate VND/SEO. Run lint, typecheck, build and relevant tests after approved code changes.

Keep archived docs historical. Updated root docs supersede stale commerce claims. Source review reduces ambiguity but cannot guarantee error-free integration; live acceptance remains required.
