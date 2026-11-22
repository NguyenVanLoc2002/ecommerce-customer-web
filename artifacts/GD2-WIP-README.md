# GD2 design and implementation artifacts

**Status: work in progress.** These artifacts accompany the partial Customer Web changes in PR #27. They are review material and implementation notes, not a claim that every Stitch screen or acceptance criterion is complete.

- `stitch-review/` contains the reviewed responsive screen concepts, design brief, route coverage, local preview, and test fixtures.
- `storefront-preview/` contains an earlier standalone design prototype. It is reference material and is not the production React implementation.
- `storefront-issue.md` and `subissue-*.md` are planning notes for Issue #27 and its implementation groups.
- `docs-contract-*` and `link-docs-pr.json` belong to the separate API documentation work and are intentionally not part of this GD2 PR.

The application source changes are partial. Lint has passed; typecheck and build are currently blocked by missing variant attributes in mock catalog fixtures. Do not treat the preview artifacts as production-ready UI or the implementation as complete.
