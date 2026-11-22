# Fashion Shop · Bản duyệt 01

Ngày: 2026-11-22. Chờ duyệt thiết kế, chưa áp dụng vào app.

Stitch: https://stitch.withgoogle.com/projects/15029798778414010901

## Phạm vi

Home `/`, PLP `/products`, PDP `/products/:slug` trên desktop/mobile; design system; prototype riêng bấm thử Home → PLP → PDP → chọn variant → thêm giỏ giả lập. Giữ tên Fashion Shop. Brief này thay hướng FORME/Playfair Display/DM Sans cũ. Chỉ sửa artifact, không sửa src, runtime, router, API, xác thực, validation hoặc nghiệp vụ.

## Nhận diện

- Be Vietnam Pro cho mọi chữ, giá, tiêu đề, nhãn, nút; weight 400/500/600/700.
- Canvas #FAF9F6, surface #FFFFFF, ink #22221F, secondary #625E57, border #E4E0D8, olive #4B563D. CTA mua charcoal/chữ trắng.
- Repo hiện dùng primary đen, nền hồng nhạt, Playfair Display/DM Sans. Bản duyệt giữ CTA tối, đổi nền và thêm olive theo brief mới, chưa coi là nhận diện đã duyệt.
- Desktop: display 64/72, h1 40/50, h2 28/38, body 16/26, label 14/20. Mobile: display 36/44, h1 28/36, body 16/26. Tên dài xuống dòng, giữ dấu tiếng Việt.
- Spacing 4/8/12/16/24/32/48/64/96px. Gutter desktop 48px/mobile 20px. Radius control 2px/ảnh 4px, border 1px. Focus 2px olive, offset 3px. Touch target ≥44px.
- Ảnh card 3:4; tên/giá dưới ảnh; 4 cột home desktop, 3 cột PLP có sidebar, 2 cột mobile. PDP ảnh trước thông tin mua, sticky CTA không che nội dung.

## Tham khảo đã đọc

- [ARKET](https://styles.refero.design/style/3c605c8e-daf2-4d46-94d7-2cb705a93b7b): grid, ảnh đều, divider và control gọn.
- [UY Studio](https://styles.refero.design/style/b376d42c-b2cb-4a52-8cec-ebf19cf1883f): ảnh lớn, khoảng trống; dùng ảnh thời trang riêng.
- [SSENSE](https://styles.refero.design/style/fa157687-ee42-443e-a992-5f8a3fcdd48f): ảnh cạnh nội dung editorial ngắn; bỏ serif, xếp dọc mobile.

## Khảo sát code

Đã đọc AGENTS.md, API.md, ba page, catalog.types.ts, productSearch.ts, mockCatalog.ts, index.css, Issue #27 và GIT_CONVENTIONS.md. Lúc bắt đầu git ở docs/25-reconcile-customer-contracts; trong khi dựng preview PR #26 được merge và checkout chuyển sang dev. Giữ nguyên WIP. Local AGENTS/API mới khác các ghi chú cũ được dán vào hội thoại: lookup slug đã có; order creation đã áp voucher. Thiết kế theo hợp đồng đã đối chiếu, không theo ghi chú voucher cũ.

| Trang | Hành vi hiện có | States cần duyệt |
| --- | --- | --- |
| HomePage | Hero, category, featured, arrivals, newsletter chỉ UI | Success, skeleton, error/retry, catalog rỗng |
| ProductListPage | URL q/category/brand/minPrice/maxPrice/sort/page; search debounce; sidebar/drawer, chips/reset, pagination | Success, loading, error/retry, no results/reset |
| ProductDetailPage | Slug lookup, gallery, variants, quantity, login-aware add, toast, related, reviews | Loading, error, not found, chưa chọn, tổ hợp thiếu, inactive, pending/success/error, guest |

Luồng mua: khám phá → PDP → login nếu cần → add variantId/quantity → cart → address → payment → voucher → review → confirmation. Sau PDP thuộc đợt duyệt tiếp theo.

## Ràng buộc

- List DTO có thumbnail/minPrice/maxPrice, không có ma trận variant hoặc tồn kho. Card không bịa màu/size/stock.
- Detail có variants[] và thuộc tính catalog-backed attributeId/attributeCode/valueId/displayValue. Chỉ chọn tổ hợp tồn tại/ACTIVE. Không đồng nhất INACTIVE, tổ hợp thiếu và hết hàng.
- Public detail không có stock. Không hiện “còn 5” hay coi missing là 0. Lỗi hết hàng/không đủ hàng chỉ từ server; sheet ghi rõ ví dụ lỗi sau add.
- Giá salePrice nếu khác null, nếu không basePrice; compareAtPrice thuộc variant. Tiền VND. Media IMAGE theo variant với fallback ảnh chung, không render VIDEO bằng img.
- Filter danh mục/thương hiệu/khoảng giá/từ khóa. Sort featured, createdAt, updatedAt, name; không sort giá/rating, không filter màu/size. Keyword giữ nguyên dấu/chỉ trim, tin relevance BE, không client-filter kết quả thật.
- Prototype lọc fixtures để thử UI, không đưa logic đó vào integration. Hash routes chỉ để mở bằng file, không thay route app.
- Add cart cần CUSTOMER đăng nhập. Thanh duyệt có phiên giả lập riêng, không gọi API, không token. Pending khóa submit, error giữ lựa chọn, success tăng giỏ mẫu.
- Reviews yêu cầu xác thực, không hiểu guest thành “chưa có đánh giá”.
- Voucher order preview dùng giỏ thực; create revalidate/redeem; tiền theo server. Checkout trong bản duyệt mở rộng chỉ mô phỏng tương tác, không gọi API.

## Nội dung và phụ thuộc

Public chỉ có favicon/OG SVG, chưa có bộ ảnh shop được duyệt. Ảnh, sản phẩm và editorial trong preview là minh họa; cần thay ảnh shop và duyệt nội dung trước GD2. CTA editorial đi catalog/category hiện có, không giả định campaign API. Không đưa newsletter/wishlist, lời hứa giao hàng/đổi trả chưa xác minh vào luồng mua.

Fixture theo ProductListItemResponse, ProductDetailResponse, VariantResponse và ProductMediaResponse; giá/tên là giả lập. Newsletter thật, CMS campaign, tồn kho trực tiếp PDP, filter/sort mới cần quyết định phạm vi riêng. Các sửa integration đã được cho phép trước đây chỉ bắt đầu sau duyệt thiết kế, dùng Backend/API hiện tại.

## Điểm dừng

Bộ duyệt đầu tiên gồm 6 khung trang và 1 design system trên Stitch. Sau khi kiểm kê các route, bản duyệt được mở rộng thành 41 khung chính trên Stitch và prototype độc lập bao phủ 31 route; xem `ROUTE-COVERAGE.md`. Chờ duyệt bố cục, font, palette, grid, variant selector, responsive và states trước khi sửa app.
