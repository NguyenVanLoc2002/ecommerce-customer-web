Apply the reviewed editorial storefront direction to the customer app, starting with the shared shell, home, catalog and PDP, then carrying the design through transactional and account surfaces.

Acceptance criteria:
- Preserve canonical routes, architecture, API endpoints, auth, validation and backend business rules.
- Apply the reviewed responsive design through shared tokens/components and route layouts.
- Correct the explicitly approved frontend integration gaps: exact variant identity/status, unknown inventory, variant media, VND display and cart-aware voucher validation using existing APIs only.
- Retain accessible loading/error/empty/pending/success states and reduced motion.
- Verify variant selection, cart, checkout/order flow against existing APIs, reporting unavailable live evidence honestly.
- Pass lint, typecheck, build and relevant tests; provide desktop/mobile evidence.

Depends on documentation PR for #25. No backend/API changes, newsletter service, wishlist persistence or invented delivery promises.
