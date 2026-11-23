# Checkout Stitch audit

Reference: original HTML in Stitch project 15029798778414010901. The viewport captures use isolated fixtures.

| Frame | Route | Reference structure | Gap at start of refactor |
| --- | --- | --- | --- |
| 09 Desktop | /checkout/address | Store navigation, centered progress, address and carriers beside item summary | Legacy oversized address and carrier cards |
| Address Mobile | /checkout/address | Back, screen title, lock, saved addresses, carriers, order summary | Generic storefront header |
| 10 Desktop | /checkout/payment | Compact method selector and note beside order summary | Oversized type and technical copy |
| 10M Mobile | /checkout/payment | Back and lock, compact options, totals and continuation | Generic header and collapsed totals |
| 11 Desktop | /checkout/voucher | Voucher form and result, item summary on right | Mixed-language controls, wallet has no API |
| Voucher Mobile | /checkout/voucher | Back and security, compact cart context and code entry | Generic header and summary below form |
| 12 Desktop | /checkout/review | Address, carrier, payment, items beside cost summary | Voucher and note interrupt section order |
| Review Mobile | /checkout/review | Back and lock, compact package item rows, final totals | Generic header and oversized legacy item rows |
| 13 Desktop | /checkout/confirmation | Order state, information and order summary | Unbalanced large text and image-only product grid |
| Confirmation Mobile | /checkout/confirmation | Confirmation-specific header with state, summary and actions | Generic header and image-only product grid |
