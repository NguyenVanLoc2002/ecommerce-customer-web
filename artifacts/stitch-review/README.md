# Fashion Shop · bản duyệt 01

## Mở bản thiết kế

- Stitch: https://stitch.withgoogle.com/projects/15029798778414010901 (tài khoản đã kết nối Stitch). Canvas hiện có 41 khung chính, sắp xếp theo 7 nhóm có tiêu đề: design system, khám phá, giỏ/checkout, thanh toán online, đơn hàng, tài khoản, xác thực/trang lỗi. Desktop đặt cạnh mobile khi có cặp tương ứng; 25 bản nháp/trùng được ẩn. Project riêng, chưa áp dụng vào app.

Lưu ý: canvas từng hiển thị các khung tím "0 screens" ở mức zoom 51% vì cấu hình nhóm không hợp lệ do bản duyệt này tạo ra. Đã bỏ thuộc tính nhóm gây lỗi, giữ tiêu đề phân đoạn dưới dạng text độc lập và đặt 41 screen instance riêng trên canvas. Ảnh chụp Home desktop và checkout desktop/mobile tải trực tiếp từ Stitch có nội dung. Tải lại project để lấy canvas đã sửa; nếu một màn vẫn trắng khi chọn riêng, dùng bản local và báo tên màn để kiểm tra.
- Prototype: mở `index.html` trong thư mục này bằng trình duyệt, hoặc chạy `npx vite artifacts/stitch-review --host 127.0.0.1 --port 4177` từ gốc repo rồi mở `http://127.0.0.1:4177`.
- Các route còn lại: mở `journeys.html` để bấm thử giỏ hàng, năm bước checkout, thanh toán, đơn hàng, tài khoản, thông báo và xác thực; đổi trạng thái trên thanh đầu trang. Đây là bản responsive dùng cùng token với ba màn khám phá. Stitch có khung desktop cho mọi route, với form thêm/sửa địa chỉ dùng chung một khung gồm hai trạng thái. Mobile trên Stitch có Home/PLP/PDP, toàn bộ giỏ/checkout và kết quả thanh toán; các route mobile còn lại xem trong prototype local.
- Đổi kích thước cửa sổ desktop/mobile, hoặc dùng chế độ thiết bị của trình duyệt. Ảnh đã lưu trong `images/`; Be Vietnam Pro cần kết nối mạng để tải từ Google Fonts, có font sans dự phòng.

Trên prototype: bấm **Khám phá sản phẩm** → chọn card Áo blazer → đổi màu, chọn size và số lượng → **Thêm vào giỏ hàng**. Thanh phía trên đổi trạng thái loading, lỗi, trống, lỗi thiếu hàng sau khi thêm; công tắc **Đã đăng nhập (mẫu)** chỉ là trạng thái UI. Trên mobile, bấm **Bộ lọc** để thử drawer. Trang **Design system** thể hiện component, token và trạng thái.

## Phạm vi dữ liệu

Fixtures ở `fixtures.js` theo hình dạng list/detail/variant/media DTO, là dữ liệu minh họa. Prototype dùng hash route để mở được bằng file; ứng dụng thật vẫn dùng `/`, `/products`, `/products/:slug`. Không có API call, thanh toán, đơn hàng, xác thực hoặc dữ liệu khách hàng thật. Ảnh tạo trong Stitch là minh họa và cần ảnh shop được duyệt trước khi triển khai. Xem [DESIGN-BRIEF-v2.md](./DESIGN-BRIEF-v2.md) để biết các phụ thuộc và hợp đồng hiện tại.

## Kiểm tra

`node check-preview.mjs` dùng Playwright sẵn có trong repo để kiểm tra điều hướng, chọn biến thể, thêm giỏ, lỗi thiếu hàng, filter drawer và tràn ngang tại 1440/390px. Đây là smoke check cho prototype, không chứng minh tích hợp API thật.

`node check-journeys.mjs` kiểm tra 28 route preview còn lại ở 390/1440px, gồm lỗi JavaScript và tràn ngang. Xem `ROUTE-COVERAGE.md` để đối chiếu cả 31 route ứng dụng.
