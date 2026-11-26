# Issue #32 · Đối chiếu Home và Products với Stitch

Đối chiếu Customer Web tại `dev` `84a52be634f80be85ee73c8aea66282a072ada24`. PR #46, PR #48 và bản chỉnh layout dùng chung #63 đã có trên baseline. Mã sửa và bằng chứng nằm trong worktree riêng. Checkout chính giữ nguyên WIP. [Issue #32](https://github.com/NguyenVanLoc2002/ecommerce-customer-web/issues/32) · [Stitch đã duyệt](https://stitch.withgoogle.com/projects/15029798778414010901)

## Before / After / Stitch

| Màn hình | Frame | Viewport CSS | Ảnh ghép | Ảnh localhost lưu cục bộ |
| --- | --- | --- | --- | --- |
| Home Desktop `/` | 01 · `e474bffa04a449cdbf2bc683661a01d0` | 1280 × 900 | [Đối chiếu](compare-home-desktop.jpg) | `before-live-home-desktop.jpg` · `after-live-home-desktop.jpg` |
| Home Mobile `/` | 02 · `d2e776bf0d584c94b0fa52c21419ac04` | 390 × 844 | [Đối chiếu](compare-home-mobile.jpg) | `before-live-home-mobile.jpg` · `after-live-home-mobile.jpg` |
| Products Desktop `/products` | 03 · `9bc171d8a40d45d2976fc395170bf395` | 1280 × 900 | [Đối chiếu](compare-products-desktop.jpg) | `before-live-products-desktop.jpg` · `after-live-products-desktop.jpg` |
| Products Mobile `/products` | 04 · `5a0e895135684792be768aac0a35c9d7` | 390 × 844 | [Đối chiếu](compare-products-mobile.jpg) | `before-live-products-mobile.jpg` · `after-live-products-mobile.jpg` |
| Drawer Products | Mẫu A trong frame 04 | 390 × 844 | [Đối chiếu](compare-products-mobile-filter.jpg) | `before-live-products-mobile-filter.jpg` · `after-live-products-mobile-filter.jpg` |

Cột Stitch là Chromium render HTML export trực tiếp từ bốn frame. Render dùng các ảnh Stitch đã lưu trong repo khi Google CDN không trả ảnh cho Chromium. Frame 04 có bốn ảnh PLP mobile riêng, được thay bằng ảnh Stitch của cùng bốn sản phẩm ở frame Desktop khi tạo ảnh đối chiếu. Cột Before và After dùng chung fixture API theo nội dung bản duyệt, gồm sáu card PLP, ba trang mẫu và cùng danh mục tiêu biểu; fixture chỉ chạy trong script chụp ảnh. Ảnh localhost dùng catalog thật của môi trường phát triển. Drawer Stitch được cắt từ mẫu A trong frame 04. [Thông số fixture Before](before-metrics.json) · [Thông số fixture After](after-metrics.json) · `before-live-metrics.json` (cục bộ) · `after-live-metrics.json` (cục bộ)

## Sai lệch, nguyên nhân và sửa đổi

| Màn hình hoặc trạng thái | Nguyên nhân gốc | Sửa đổi |
| --- | --- | --- |
| Home Desktop · Hero, danh mục, nổi bật và editorial | CSS và component cũ dùng crop khác, container lồng khác gutter, style nút dùng chung và kiểu chữ đậm hơn thiết kế. Font tải thiếu weight 300. | Giữ bố cục Hero 8/4 và yêu cầu full-bleed. Căn crop, CTA, font, ba danh mục 3:4, bốn card nổi bật và editorial 7/5 theo frame. Giữ khoảng cách đã rút gọn theo feedback trước đó. |
| Home Mobile · Hero, danh mục và editorial | Desktop dùng chung ảnh với mobile. Danh mục từng xếp 2+1 thay cho ba card toàn chiều rộng. Editorial bị đặt trong container có gutter. | Dùng ảnh hero mobile từ frame 02 qua `picture`, tỷ lệ 39:40, CTA toàn chiều rộng. Mỗi danh mục có ảnh 4:3 và caption riêng. Editorial dùng ảnh 16:10 sát hai cạnh và CTA đến danh mục Nữ khi danh mục đó có trong API. |
| Home · Dữ liệu danh mục | FE lấy vài dòng đầu gồm cả danh mục con và gọi sản phẩm theo từng danh mục để lấy số đếm chưa được render. Backend đã có `parentId`, `sortOrder` và `imageUrl`. | Dựa vào danh mục gốc có thật theo thứ tự API. Dùng ba danh mục đầu cho Home và bỏ request đếm dư thừa. |
| Products Desktop · Search, lọc, sắp xếp, card và phân trang | `PageWrapper`, button, select và card dùng chung gây lệch padding, hierarchy, kích thước chữ và khoảng cách. Danh mục được gán làm tiêu đề. | Header riêng có breadcrumb, tiêu đề frame 03, ô search, thanh chip và sort. Cột lọc 224 px; lưới ba card 3:4, brand và giá đúng cỡ chữ; phân trang số trên Desktop. Giữ mô tả danh mục do API cung cấp khi có. |
| Products Mobile · Flow chính, drawer và phân trang | Cụm filter/sort/chip Desktop bị tái sử dụng trên mobile. Drawer dùng typography và giá xếp dọc của layout cũ; phân trang dùng toàn bộ nút số. | Ô tìm kiếm độc lập, filter và sort hai cột, chip và số kết quả nằm cùng hàng khi đủ chỗ, grid hai cột. Drawer có giá hai cột, CTA theo tổng số hiện tại khi giá đã áp dụng, reset và đóng bằng Escape. Mobile phân trang với Trước / Trang X / Tiếp. |
| Products · Loading, empty, error và retry | Các trạng thái dùng template generic; promise của lookup danh mục hoặc thương hiệu bị giữ sau lỗi nên retry có thể dùng lại lỗi cũ. | Skeleton 3:4 với ba dòng. Empty và Error dùng icon, typography và nút theo mẫu Stitch. Lookup bị lỗi có thể refetch. Giữ thông báo trạng thái và focus trong drawer. |
| Products · Điều hướng và giá | Debounce có thể ghi từ khóa cũ về URL khi đổi link nội bộ. Cập nhật giá từng ký tự gây nhiều request. | Gắn bản nháp keyword với URL hiện thời. Giữ trim nguyên văn, không hạ chữ thường hoặc lọc kết quả API tại client. Cả hai biên giá được gửi một lần khi bấm Áp dụng. Giữ page, sort, category, brand và chip trong URL. |

## Backend và tương thích ba repository

| Hạng mục | Đánh giá |
| --- | --- |
| Hiệu suất | Home gọi `GET /products` 6 → 2 và Products 29 → 1 trên cả Desktop và Mobile với cùng catalog localhost. Cả hai loại request sản phẩm đều trả HTTP 200. Đây là bỏ HTTP fan-out từ FE, tức bỏ các lần thực hiện query/pagination tương ứng. Số đo này chưa phản ánh p95, EXPLAIN hay thời gian SQL trên dữ liệu production. |
| API Contract | Hai trang tiếp tục dùng `GET /categories`, `GET /brands` và `GET /products`. Public DTO và tham số giữ nguyên. URL FE vẫn ghi `q`, request API gửi `keyword`; server quyết định thứ tự kết quả. Thay đổi model `itemCount` nội bộ FE vì không còn consumer sử dụng. |
| Dữ liệu ảnh | DTO category có `imageUrl`; Admin hiện có thể edit/upload ảnh category và chỉnh thứ tự. Seed localhost có URL ảnh trống hoặc cấu hình mẫu. Bổ sung trường hay API mới không sửa được dữ liệu này. Runtime dùng ảnh catalog và giữ khung khi ảnh lỗi. |
| Đếm theo từng lựa chọn | Tổng số kết quả đã có trong response PLP. Số cạnh từng category/brand trong drawer là facet theo ngữ cảnh, API chưa cung cấp. Phải chốt tập giao cắt keyword/giá, loại trừ facet đang đếm hay không, và quan hệ danh mục cha/con. Một endpoint cộng thêm có thể tương thích ngược, nhưng query cần cùng tập published/active, đếm distinct sản phẩm để tránh nhân dòng khi join, hạn chế tập kết quả và đo plan/latency. Thêm lại một lần gọi mỗi option sẽ quay lại fan-out. |
| Nghiệp vụ và bảo mật | Không cần API mới để sửa phần giao diện có trong phạm vi hiện tại. Sản phẩm bán được, giá, tồn kho và biến thể vẫn do luồng công khai hiện hữu quyết định. PLP dùng DTO công khai, không lấy tồn kho hoặc thuộc tính từ endpoint Admin. |
| Ảnh hưởng repository | Customer Web có thay đổi UI và cách dùng API hiện tại. Backend không thêm query, migration, endpoint hay đổi phân quyền. Admin Web không cần sửa code hoặc thao tác với dữ liệu thật. |

## Những điểm còn lệch Stitch

- Home giữ **Sản phẩm mới** theo phạm vi Issue #32. Frame 01 và 02 không có dải này. Desktop dùng gutter và nhịp section gọn theo follow-up #48, đồng thời hero vẫn sát hai cạnh kể cả khi viewport rộng hơn giới hạn 1440 px của bản export.
- Home Mobile frame 02 minh họa triết lý của Maison Aure. Home Desktop chứa mục Lookbook 2025 minh họa. Thiết kế sử dụng nội dung marketing mẫu; môi trường chạy chưa có nội dung hoặc điểm đến đã xuất bản tương ứng.
- Kích thước, danh mục và số card catalog thật phụ thuộc dữ liệu API. Localhost có các danh mục thử, thiếu taxonomy Nữ/Nam/Phụ kiện đồng nhất với slug mẫu. Một số link danh mục dùng chung từ baseline trỏ slug của bộ dữ liệu mẫu. Cần cấu hình taxonomy/ảnh nhất quán để bố cục trong ảnh localhost dùng cùng nội dung với Stitch.
- Footer sử dụng các liên kết Đơn hàng, Sổ địa chỉ và Thông báo hiện có. Stitch sử dụng các link chăm sóc, size guide và liên hệ minh họa. Header giữ điều hướng tài khoản, giỏ hàng và thông báo đã có. Bộ icon Lucide và trạng thái focus khác icon Material Symbols trong export.
- Drawer luôn có nút Đóng để hỗ trợ bàn phím và màn hình hẹp. Reset nằm dưới CTA. Số cạnh từng lựa chọn và trạng thái chọn sẵn trong Stitch phụ thuộc dữ liệu fixture. PLP ẩn phân trang khi server chỉ có một trang. Bảng ghi chú Design Review trong frame 03–04 minh họa các trạng thái đã được triển khai tại chỗ.
- Flow công khai localhost được xác minh bằng đọc catalog và ảnh trình duyệt. Chưa chạy luồng mua hàng/Mock Payment live, thao tác Admin, benchmark production hoặc so sánh pixel tuyệt đối.

## Kiểm tra regression

- Lint, typecheck, typecheck Playwright, build và 57 unit test đều pass.
- Playwright fixture gồm ca Home/Products mới, layout dùng chung, giỏ hàng, giao hàng, huỷ/đổi trả, đơn hàng, tài khoản, auth và thông báo. 55/56 ca pass. Ca Issue #28 về hai dòng trạng thái thanh toán fail trên cả bản sửa và baseline. Lượt cuối của bản sửa thiếu `Payment record: PAID`; khi tái hiện trên baseline, ca này thiếu `Order payment status: PAID`. Các ca fixture không ghi dữ liệu lên Backend.
- Sau lần chỉnh cuối, Playwright xác nhận ô tìm kiếm gửi bằng Enter và mép ảnh sản phẩm lệch 0 px so với khung lọc tại 1280 px. Cả 7 ca Issue #31 và #32 đều pass.
- Desktop/Mobile đều được chụp ở viewport cùng bản Stitch. Playwright test bốn ca Issue #32 bao phủ hero, root category, URL/keyword, contract price + sort, phân trang, drawer focus, loading, empty và retry.

PR ở dạng draft vì các chênh lệch còn nêu ở trên.
