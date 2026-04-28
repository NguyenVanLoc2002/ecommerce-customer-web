# Stitch Visual Audit: Phase 0-7

## Scope

- Repo audited on `2026-04-28`
- Visual source: Stitch project `6681847091792507757`
- Architecture/API constraints still come from `AGENTS.md`, `API.md`, `DESIGN.md`, `DELIVERY_PLAN.md`, and `README.md`
- This is a read-only audit. No source code was changed in this step.

## Audit Method

Inputs reviewed:

- `AGENTS.md`
- `DESIGN.md`
- `API.md`
- `DELIVERY_PLAN.md`
- `README.md`
- Implemented React routes and shared UI components under `src/`
- Stitch project metadata and screen inventory via MCP
- Stitch screen HTML exports for all Phase 0-7-relevant pages

Resolution rule used for this audit:

- Keep architecture and API behavior from repo docs
- Match Stitch visually as closely as possible
- If Stitch screen output conflicts with the Stitch project-level design theme, prefer the actual exported screen output for parity work

## Important Stitch Observation

The new Stitch project has two visual layers:

- Project-level theme: soft indigo editorial system with rounded surfaces
- Screen-level exports: warmer near-monochrome palette, much squarer cards, more black/stone emphasis, less decorative chrome

For actual parity work, the exported screens should be treated as the visual source of truth. The implemented app is currently much closer to the older repo `DESIGN.md` language than to the new Stitch screens.

## Stitch Screen Inventory

| Stitch screen | Screen id | Phase relevance | Intended route | In scope |
|---|---|---:|---|---|
| Home Page - Maison Editorial (Final Refinement) | `a7dbac22ffa5407f985ffb203b68c425` | 3 | `/` | Yes |
| Product List - Maison Editorial | `c57796457e4b4f26b490d71c68661b39` | 4 | `/products` | Yes |
| Product Detail - Maison Editorial | `bd9072526f7849a2b6fafc024cfec9dd` | 4 | `/products/:slug` | Yes |
| Cart - Maison Editorial | `7e2ef39966a84501a9c976f771b41c8f` | 5 | `/cart` | Yes |
| Checkout Address - Maison Editorial | `5df2096c6b0b46ce83d26d842a3f1d9f` | 6 | `/checkout/address` | Yes |
| Checkout Payment - Maison Editorial | `568148ed82fc4a65b2e019d204d80d54` | 6 | `/checkout/payment` | Yes |
| Checkout Voucher Page | `b54c07b436d04ff8a6228f75bc011bfd` | 6 | `/checkout/voucher` | Yes |
| Checkout Review - Maison Editorial | `6783690b6dd24974a38a65470b898b4f` | 6 | `/checkout/review` | Yes |
| Order Confirmation - Maison Editorial | `c945279be8414a3b8335394d1e60de91` | 6 | `/checkout/confirmation` | Yes |
| Login - Maison Editorial | `b40d34ae8442440d8bea0970f8b12d71` | 1 | `/login` | Yes |
| Register - Maison Editorial | `828a60c004ca4438bbf34c901287ca6e` | 1 | `/register` | Yes |
| Order List - Maison Editorial | `f255689b7d784abea7cc5b5025b0d631` | 7 | `/orders` | Yes |
| Order Detail - Maison Editorial | `9e00df1cc24e42fb8e93a4a0abf6c630` | 7 | `/orders/:orderId` | Yes |
| Payment Result Page | `0aabbe951c7c42c394c65708e8eaf8cf` | 8 | `/payment/result` | No |
| Shipment Tracking - Maison Editorial | `80c43329585f43e2862b241aa3b2eebf` | 9 | `/orders/:orderId/tracking` | No |
| Write Review Page | `7c28a259abd44179b845d91aa7e4bdfe` | 10 | `/orders/:orderId/review` | No |
| Notifications - Maison Editorial | `8474fd3f2cec4162a0b2a4a7db0900dd` | 11 | `/notifications` | No |
| Profile - Maison Editorial | `6018756b1e144681a2b73340fc93b775` | 12 | `/profile` | No |
| Address Book - Maison Editorial | `4023e7cb9cbe45268973efc35108a0a7` | 12 | `/profile/addresses` | No |
| Invoice Page | `7796ea4bd13549d2983e4fcfd5974ba2` | 12+ | `/orders/:orderId/invoice` | No |

Non-route artifacts:

- `Aura Editorial E-commerce Flow`
- `Fashion Shop User Flow Documentation`

Missing from Stitch:

- `/404`

## Route-to-Stitch Mapping

| Route | Stitch screen |
|---|---|
| `/` | `a7dbac22ffa5407f985ffb203b68c425` |
| `/products` | `c57796457e4b4f26b490d71c68661b39` |
| `/products/:slug` | `bd9072526f7849a2b6fafc024cfec9dd` |
| `/login` | `b40d34ae8442440d8bea0970f8b12d71` |
| `/register` | `828a60c004ca4438bbf34c901287ca6e` |
| `/cart` | `7e2ef39966a84501a9c976f771b41c8f` |
| `/checkout/address` | `5df2096c6b0b46ce83d26d842a3f1d9f` |
| `/checkout/payment` | `568148ed82fc4a65b2e019d204d80d54` |
| `/checkout/voucher` | `b54c07b436d04ff8a6228f75bc011bfd` |
| `/checkout/review` | `6783690b6dd24974a38a65470b898b4f` |
| `/checkout/confirmation` | `c945279be8414a3b8335394d1e60de91` |
| `/orders` | `f255689b7d784abea7cc5b5025b0d631` |
| `/orders/:orderId` | `9e00df1cc24e42fb8e93a4a0abf6c630` |
| `/404` | No Stitch screen exists |

## Cross-Route Findings

### 1. Shared Tokens Are Off

Severity: `critical`

Observed mismatch:

- Current tokens in `src/index.css` are cool-indigo and soft-gray
- Stitch exports skew warmer and more monochrome: `#fdf8f8`, `#f7f3f2`, near-black primary text/actions, lighter stone borders
- Current radii are too soft: `16px` cards and `24px` feature surfaces dominate the app
- Stitch exports use much squarer surfaces on most pages, especially home, PLP, orders, and auth
- Current shadows are used too often and too heavily

Exact fix instructions:

- Retune semantic tokens to a warm off-white / stone / near-black system
- Reduce default card radius sharply; keep large rounding only where the target screen visibly uses it
- Introduce per-surface token variants if needed instead of using one oversized card style everywhere
- Reduce `shadow-card` usage and move most surfaces to flat or bordered treatments

### 2. Layout Shells Do Not Match Stitch

Severity: `critical`

Observed mismatch:

- `Header`, `Footer`, `AuthLayout`, `CheckoutLayout`, `MobileNav`, and `PageWrapper` impose one reusable app shell
- Stitch uses different chrome by surface:
  - discovery screens: glass top bar, large offset content, minimal footer
  - auth screens: centered form, editorial background, transactional footer
  - checkout screens: fixed top bar plus minimal 2-column transaction layout
  - order archive: sticky filter bar and mobile bottom nav pattern
- Current `PageWrapper` adds generic top/bottom padding that breaks screen-specific vertical rhythm

Exact fix instructions:

- Stop using one universal spacing shell for all routes
- Make shell variants route-aware and screen-specific
- Replace generic footer with Stitch-specific footer variants
- Remove generic breadcrumbs from routes where Stitch does not show them

### 3. Typography Scale and Casing Are Wrong

Severity: `major`

Observed mismatch:

- Current app uses the correct font families, but not the correct type behavior
- Stitch uses more uppercase microcopy, tighter tracking, more serif nav usage, and more dramatic heading scale
- Current buttons, pills, and filters read like standard product UI rather than editorial UI

Exact fix instructions:

- Add typographic tokens for nav labels, label-uppercase, and button tracking
- Promote uppercase micro-labels and tighter tracking across nav, filters, and transactional labels
- Increase hero and page-title scale where Stitch does
- Reduce paragraph density on transactional pages

### 4. Card Language Is Too Heavy

Severity: `critical`

Observed mismatch:

- Current UI overuses `rounded-feature bg-white shadow-card`
- Stitch often uses flat image tiles, bordered rows, or low-contrast panels instead of lifted cards
- Current cart, checkout, PLP, orders, and 404 all feel component-library-driven rather than editorial

Exact fix instructions:

- Replace generic white card wrappers with route-specific surface treatments
- Reserve elevated card shadows for the few screens that actually use them
- Favor flat rows, thin borders, inset panels, and image-led layouts

### 5. Motion Tone Is Too Uniform

Severity: `minor`

Observed mismatch:

- Current app applies page fade/translate and hover-lift patterns broadly
- Stitch exports mostly use restrained hover transitions, image zooms, underline changes, and subtle opacity changes
- The current product-card lift and generic page transitions read more like a modern app kit than the exported editorial screens

Exact fix instructions:

- Reduce global motion
- Replace card-lift defaults with slower image-scale or underline transitions where Stitch does so
- Keep Framer Motion, but use it more sparingly and only where the screen composition calls for it

## Per-Route Audit

### `/`

Overall severity: `critical`

- `critical`: Hero layout does not match. Stitch uses a full-bleed image hero under a glass header, white headline copy on image, and one dominant CTA. Current `HeroSection` is a 2-column split layout with an inset rounded image card, decorative indigo glow, and two CTAs. Fix: rebuild `HeroSection` as full-bleed media with overlay copy and one primary action.
- `critical`: Header/footer appearance is off. Stitch home uses an airy glass header with serif nav links and icon-only actions; current `Header` uses a denser app-style bar, generic links, hamburger drawer, and account button. Fix: create a discovery header variant that matches Stitch nav spacing, hover underline treatment, and icon placement.
- `major`: Section rhythm is too compressed and too card-heavy. Stitch home uses larger sectional breaks, more open category tiles, and cleaner transitions between editorial blocks. Current `CategoryGrid`, `FeaturedProducts`, `NewArrivals`, `TrustSection`, and `BrandStorySection` all rely on elevated cards. Fix: remove most card wrappers, widen section spacing, and use frameless image-first tiles.
- `major`: Home content hierarchy diverges. Stitch sections are `hero -> category grid -> editorial highlight -> arrivals -> newsletter/footer`. Current home adds `BrandStorySection` and a 3-up trust-card row that do not match the exported structure. Fix: remove or fold extra sections into the Stitch sequence instead of keeping them as separate card bands.
- `minor`: Animation behavior is off. Stitch leans on image zoom and understated CTA transitions. Current home uses staggered motion and card hover lift. Fix: tone down Framer motion on home and prefer slower image-scale transitions.

### `/products`

Overall severity: `critical`

- `critical`: PLP layout is structurally wrong. Stitch uses a 1440px editorial frame, wide left filter rail, flat product field, and no boxed sidebar shell. Current page renders `FilterPanel` inside a white rounded card and a standard app grid. Fix: replace the boxed sidebar with a typographic left rail and align the product field to Stitch spacing.
- `critical`: Filter design is wrong. Stitch uses category text links, color swatches, size boxes, and investment checkboxes with almost no card chrome. Current `FilterPanel` uses form-style inputs and checkbox lists for category and brand. Fix: rewrite `FilterPanel` to use Stitch's visual control language while keeping the current URL-state architecture.
- `critical`: Product cards do not match. Stitch product list items are flatter and more editorial, with less shadow, more open spacing, and stronger typography. Current `ProductCard` is a rounded elevated commerce card with badges and hover image swap. Fix: refactor `ProductCard` and `ProductGrid` to the Stitch tile language.
- `major`: Sort and active filters are off. Stitch uses tiny uppercase labels and flat inline filter chips. Current `SortDropdown` and `ActiveFilterChips` feel generic and too pill-like. Fix: reduce control weight, use inline chip bars, and match the exported dropdown/filter spacing.
- `major`: Typography and page intro do not match. Current page intro copy and large `h1` framing differ from Stitch's tighter editorial title block. Fix: restyle the PLP header to the exported title and description proportions.
- `minor`: Breadcrumbs should be removed unless reproduced exactly from Stitch. Current PLP shows `BreadcrumbNav`; the exported PLP does not. Fix: remove breadcrumbs from this route.

### `/products/:slug`

Overall severity: `critical`

- `critical`: PDP purchase area is visually wrong. Stitch uses a cleaner editorial purchase block with numeric size buttons, store/editorial utility links, and less container chrome. Current `PurchaseBlock` is a large rounded white card with extra trust rows and a more app-like control stack. Fix: refactor `PurchaseBlock`, `VariantSelector`, and `QuantitySelector` to Stitch's flatter purchase UI.
- `critical`: PDP page composition is off. Stitch includes product title, gallery, purchase area, editorial story, and "complete the look" sections in a more minimal grid. Current page uses multiple large white cards and a review card beside a story card. Fix: reduce card framing and mirror the exported column hierarchy.
- `major`: Media gallery treatment is off. Current `ProductMediaGallery` uses rounded image containers and bordered thumbnails. Stitch is flatter and more editorial. Fix: remove excess rounding/shadow and restyle thumbnails to the exported treatment.
- `major`: Related/review sections do not match. Stitch highlights "Complete the Look" more strongly and does not foreground a boxed review panel the way the current implementation does. Fix: reorder and restyle the lower PDP modules to match Stitch emphasis.
- `minor`: Mobile sticky bar likely needs visual rework. Current `StickyCartBar` uses a rounded floating card; Stitch's transactional/mobile intent is cleaner and less pill-like. Fix: restyle mobile CTA to a flatter sticky action bar.

### `/login`

Overall severity: `critical`

- `critical`: Auth layout does not match. Stitch login is a centered minimalist form with oversized background wordmark, grayscale editorial side imagery, and a transactional footer. Current `AuthLayout` uses a dark promo panel and a rounded white card. Fix: replace `AuthLayout` with a screen-specific auth shell matching the exported composition.
- `critical`: Field styling is wrong. Stitch uses uppercase micro-labels and underlined inputs with almost no box chrome. Current `Input` renders bordered rounded inputs. Fix: create an auth-field variant with bottom borders only, uppercase labels, and reduced padding.
- `major`: CTA/button design is wrong. Stitch login CTA is a full-width black button with uppercase tracking and arrow icon. Current login uses the default shared primary button. Fix: add a transactional-auth button style matching exported height, casing, and icon treatment.
- `major`: Secondary content is wrong. Current demo-account banner and helper copy are not present in Stitch. Fix: remove the demo banner from the visual layout and keep any necessary dev credential hint out of the core card.
- `minor`: Footer/social link pattern is missing. Stitch includes footer links and minimal share/mail actions. Fix: add the same visual footer group if the product wants strict parity.

### `/register`

Overall severity: `critical`

- `critical`: Register screen composition is off. Stitch register is not the same generic shell as login; it is more editorial and asymmetric. Current register simply reuses `AuthLayout`. Fix: give register its own page structure matching the exported composition.
- `critical`: Form styling is still too app-like. Current `RegisterForm` uses boxed inputs, rounded shell, and default button. Stitch uses the same minimalist auth-field language as login. Fix: restyle the register form with underlined fields and more editorial spacing.
- `major`: Field grouping differs. Stitch visually reads as a simpler identity form, while API still requires `firstName` and `lastName`. Fix: keep both fields for API correctness, but style them as one visual row so the screen still matches the editorial form feel.
- `major`: Link/footer hierarchy is wrong. Current page uses simple inline auth switching; Stitch uses stronger uppercase links and a route-footer structure. Fix: align footer link placement and casing to the exported screen.

### `/cart`

Overall severity: `critical`

- `critical`: Cart page structure is wrong. Stitch cart is a minimalist "Bag" page with flatter line items, packaging option controls, a quieter summary, and multiple payment paths. Current `CartItemCard` and `CartSummary` are heavy rounded cards. Fix: convert cart items into flatter row layouts and restyle summary as a quieter side panel.
- `critical`: Header/footer appearance is off. Stitch cart keeps the editorial storefront chrome, while current cart inherits the generic shop shell. Fix: align cart shell to the exported bar and footer treatment.
- `major`: Summary area mismatches. Stitch shows `Proceed to Payment`, an Apple Pay CTA, packaging/gift options, and voucher application inside the cart context. Current summary lacks that visual hierarchy. Fix: restructure the summary into exported CTA order and option blocks, even if some actions remain non-functional placeholders for now.
- `major`: Typography and labels are wrong. Current cart uses "Your current edit" and app-style explanatory copy. Stitch uses "Bag" with much leaner content. Fix: rewrite the page heading block to the exported hierarchy and remove explanatory product-dev copy from the visible layout.
- `minor`: Empty/loading/error states are too generic. Current shared states use dashed borders and card shells. Fix: create cart-specific quiet states aligned to Stitch's surface language.

### `/checkout/address`

Overall severity: `critical`

- `critical`: Checkout stepper design is wrong. Stitch address page uses a simple `STEP 01` label and 2-column transaction layout, not a five-card `CheckoutStepper`. Fix: replace `CheckoutStepper` with a minimal progress treatment that matches the checkout screen family.
- `critical`: Address cards are wrong. Stitch uses flat selectable tiles with radio indicators, hidden hover actions, and a dashed add-address tile. Current address options are rounded feature cards with badge pills. Fix: rebuild address selection to the exported tile treatment.
- `major`: Breadcrumbs and shell chrome are wrong. Current page shows breadcrumbs and a generic checkout header. Stitch uses the editorial transaction shell without breadcrumb chrome. Fix: remove breadcrumbs and align the top bar to the exported layout.
- `major`: Summary panel is wrong. Current `CartSummary` is too card-like and too rounded. Fix: create a checkout-summary variant with flatter container styling, tighter type, and the exported secure-checkout note block.
- `minor`: CTA copy/order is off. Stitch uses `Return to Bag` and `Continue to Shipping`. Current page uses `Back to cart` and `Continue to payment`. Fix: align wording and button order where it does not conflict with route flow.

### `/checkout/payment`

Overall severity: `critical`

- `critical`: Payment page composition does not match. Stitch uses a lean payment-method screen with two large flat choices, selection summary, and footer navigation. Current page uses the shared stepper/breadcrumb/card stack. Fix: rebuild the payment page around the exported two-column transaction pattern.
- `major`: Payment options are styled incorrectly. Current option cards are oversized rounded panels. Stitch uses flatter bordered tiles with quieter copy. Fix: reduce radius/shadow and mirror the exported selection state.
- `major`: Customer note field is visually wrong. API requires the note, but Stitch does not give it dominant form weight. Fix: keep the note field for behavior parity, but restyle it as a secondary low-emphasis field within the selected method or review flow.
- `minor`: Button hierarchy/order is off. Fix: match Stitch's back/review footer action row instead of the current stacked summary-footer buttons.

### `/checkout/voucher`

Overall severity: `critical`

- `critical`: Voucher page structure is wrong. Stitch includes `Apply Rewards & Vouchers`, member offers, a compact order summary, and supporting brand/footer content. Current page is a generic voucher form plus preview card. Fix: redesign this route to the exported two-column offer-and-summary composition.
- `major`: Voucher controls are wrong. Current form sits inside a large shadow card. Stitch uses lighter transactional surfaces and inline apply actions. Fix: flatten `VoucherForm` and embed member-offer rows matching Stitch.
- `major`: Summary and copy hierarchy are wrong. Current page foregrounds implementation caveats. Stitch foregrounds order total and available offers. Fix: move contract caveats into quieter helper text and let the order summary dominate visually.
- `minor`: Newsletter/join block is missing. If strict parity is required, add the same low-emphasis join block from the Stitch screen.

### `/checkout/review`

Overall severity: `critical`

- `critical`: Review screen composition is wrong. Stitch shows concise summary blocks with inline `EDIT` actions and a strong final CTA. Current review page is a stack of elevated cards plus a separate action bar. Fix: rebuild the review screen as flatter summary sections with inline edit links and a single dominant order CTA.
- `critical`: Stepper and breadcrumb chrome are wrong here as well. Fix: remove the current `CheckoutStepper` card grid and breadcrumb row from this screen family.
- `major`: Address/payment/note blocks are too heavy. Current blocks are all `rounded-feature bg-white p-6 shadow-card`. Stitch uses lighter section grouping. Fix: restyle the review blocks to flatter panels with tighter spacing.
- `major`: Order total treatment is wrong. Current `OrderSummaryPanel` just wraps `CartSummary`. Stitch uses a more premium review-total block. Fix: create a review-specific summary component instead of reusing cart summary visuals.

### `/checkout/confirmation`

Overall severity: `critical`

- `critical`: Confirmation screen structure is wrong. Stitch confirmation centers the "Order Confirmed" message, exposes a copyable order id, shows logistics/item modules, and leads with post-order actions. Current page is a generic thank-you card plus address card and summary panel. Fix: rebuild this route around the exported confirmation hierarchy.
- `major`: Status and metadata presentation are wrong. Current `OrderStatusBadge` plus monospace code row do not match the prominent copy-ID and logistics language in Stitch. Fix: promote order id to a dedicated copy block and match the exported action arrangement.
- `major`: Item preview treatment is missing. Stitch confirmation shows confirmed item previews. Current page does not. Fix: add the exported item preview strip/module before the summary.
- `minor`: Stepper should not remain as the dominant top element once the order is confirmed. Fix: reduce or remove it to match Stitch.

### `/orders`

Overall severity: `critical`

- `critical`: Orders page layout is wrong. Stitch `Your Archive` uses a sticky horizontal filter bar and border-separated article cards with image grids. Current `OrdersPage` uses pill filters and elevated `OrderCard`s. Fix: replace pill chips with the exported sticky filter strip and rebuild `OrderCard` into a multi-column archive row.
- `critical`: Header/mobile behavior is off. Stitch order archive includes a different top app bar and a mobile bottom navigation pattern. Current page inherits the generic storefront header and global `MobileNav`. Fix: create the order-archive shell and mobile nav to match the exported route family.
- `major`: Typography and metadata hierarchy are wrong. Stitch foregrounds order codes and total value with uppercase micro-labels. Current order cards foreground "Order placed {date}" inside a rounded card. Fix: align order-card hierarchy to code/status/date/total first.
- `major`: Action styling is wrong. Stitch uses underlined text actions like `Order Details`, `Support`, `Reorder`, `Track Package`. Current page uses a single clickable card surface. Fix: add explicit action rows and lower the card affordance.

### `/orders/:orderId`

Overall severity: `critical`

- `critical`: Order detail stepper design is wrong. Stitch uses a horizontal timeline with connected line, icon states, and timestamp labels. Current `OrderStatusStepper` renders five independent rounded tiles. Fix: replace the tile stepper with a timeline/connector component matching Stitch.
- `critical`: Main layout is wrong. Stitch uses item rows on the left and a flatter summary/action column on the right. Current page uses large white cards and a reused `CartSummary`. Fix: create an order-detail-specific summary block and flatten the left-column modules.
- `major`: Primary actions are wrong. Stitch emphasizes `Download Invoice` and `Track My Order`. Current page emphasizes `Cancel order` and hides tracking/invoice on this route. Fix: add the exported action hierarchy while preserving route/API rules by linking to the existing tracking/invoice routes or placeholders.
- `major`: Item rows are wrong. Current order items are boxed mini-cards with image, text, and price. Stitch uses border-separated rows with less rounding and more white space. Fix: refactor line items to flatter rows and align review-link placement to Stitch.
- `minor`: Cancellation action should become secondary visual priority. Keep the behavior, but move it into a lower-emphasis action group so the page matches Stitch's post-purchase tone.

### `/404`

Overall severity: `major`

- `major`: No Stitch screen exists, so parity cannot be signed off. Current `NotFoundPage` is a generic elevated feature card and does not inherit the visual language of the new Stitch screens. Fix: restyle `/404` using the closest Stitch empty/auth language: warm canvas, minimal chrome, large serif heading, restrained CTA row, little or no card shadow.
- `major`: This route is blocked by missing visual source. Fix: either add a Stitch 404 screen or accept a derivative implementation based on the new project's auth/empty-state patterns.

## Components That Need Refactor

Shared foundations:

- `src/index.css`
- `tailwind.config.cjs`
- `src/shared/components/layout/Container.tsx`
- `src/shared/components/layout/PageWrapper.tsx`
- `src/shared/components/layout/Header.tsx`
- `src/shared/components/layout/Footer.tsx`
- `src/shared/components/layout/MobileNav.tsx`
- `src/shared/components/layout/AuthLayout.tsx`
- `src/shared/components/layout/CheckoutLayout.tsx`
- `src/shared/components/layout/BreadcrumbNav.tsx`

Primitives:

- `src/shared/components/ui/Button.tsx`
- `src/shared/components/ui/buttonStyles.ts`
- `src/shared/components/ui/Input.tsx`
- `src/shared/components/ui/Textarea.tsx`
- `src/shared/components/ui/Badge.tsx`

Discovery/product:

- `src/features/home/components/HeroSection.tsx`
- `src/features/home/components/CategoryGrid.tsx`
- `src/features/home/components/FeaturedProducts.tsx`
- `src/features/home/components/NewArrivals.tsx`
- `src/features/home/components/PromoBanner.tsx`
- `src/features/home/components/TrustSection.tsx`
- `src/features/home/components/BrandStorySection.tsx`
- `src/features/home/components/NewsletterSection.tsx`
- `src/shared/components/catalog/ProductCard.tsx`
- `src/shared/components/catalog/ProductGrid.tsx`
- `src/shared/components/catalog/FilterPanel.tsx`
- `src/shared/components/catalog/SortDropdown.tsx`
- `src/shared/components/catalog/ActiveFilterChips.tsx`
- `src/shared/components/catalog/ProductMediaGallery.tsx`
- `src/shared/components/catalog/PurchaseBlock.tsx`
- `src/shared/components/catalog/VariantSelector.tsx`
- `src/shared/components/catalog/QuantitySelector.tsx`
- `src/shared/components/catalog/StickyCartBar.tsx`

Commerce/transactional:

- `src/shared/components/commerce/CartItemCard.tsx`
- `src/shared/components/commerce/CartSummary.tsx`
- `src/shared/components/commerce/CheckoutStepper.tsx`
- `src/shared/components/commerce/OrderCard.tsx`
- `src/shared/components/commerce/OrderStatusStepper.tsx`
- `src/shared/components/commerce/OrderSummaryPanel.tsx`

Feedback states:

- `src/shared/components/feedback/EmptyState.tsx`
- `src/shared/components/feedback/ErrorCard.tsx`
- `src/shared/components/feedback/LoadingOverlay.tsx`

Auth forms:

- `src/features/auth/components/LoginForm.tsx`
- `src/features/auth/components/RegisterForm.tsx`

## Shared Tokens That Need Adjustment

- `canvas/background`: move from cool gray to warm off-white used across Stitch exports
- `surface/surface-low`: add warm layered neutrals instead of pure white everywhere
- `primary`: near-black should become the dominant action/text token on most audited routes; current indigo is overused
- `border/outline`: use lighter stone borders, not current app-gray defaults
- `radius-card`: reduce substantially; current `16px` is too round for most screens
- `radius-feature`: current `24px` should not remain the default large surface treatment
- `shadow-card`: reduce usage and intensity
- `space-page`: support wider editorial shells where Stitch uses `1440px` framing
- `type scales`: add screen-faithful nav/button/uppercase label scales

## Pages Missing Visual Parity

None of the audited routes are currently at visual parity with the new Stitch project.

Highest-priority parity failures:

- `/`
- `/products`
- `/products/:slug`
- `/login`
- `/register`
- `/cart`
- `/checkout/address`
- `/checkout/payment`
- `/checkout/voucher`
- `/checkout/review`
- `/checkout/confirmation`
- `/orders`
- `/orders/:orderId`

Blocked by missing Stitch source:

- `/404`

## Recommended Implementation Order

1. Rebuild shared visual tokens and route shells first: header/footer/auth/checkout/mobile nav/page spacing.
2. Refactor shared primitives next: button, input, textarea, badge, and feedback states.
3. Rework discovery surfaces: home, PLP, PDP, plus shared product components.
4. Rework auth screens after the auth shell and field variants exist.
5. Rework cart and the entire checkout route family together so the transaction surface stays visually consistent.
6. Rework orders list and order detail together, including the archive card language and timeline stepper.
7. Add a Stitch-derived `/404` only after the main routes are aligned or after a dedicated Stitch screen exists.

## Sign-Off

Current implementation is not visually acceptable against Stitch project `6681847091792507757`.

The main issue is not isolated polish. The shared tokens, shell strategy, card language, and transactional layout patterns all diverge from the exported Stitch screens, so parity work should start at the system level rather than page-by-page patching alone.
