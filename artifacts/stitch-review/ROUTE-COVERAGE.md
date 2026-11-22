# Fashion Shop · kiểm kê màn hình thiết kế

Nguồn: `src/constants/routes.ts`, `src/app/router/router.tsx`, các Page trong `src/features/`, `API.md` ở nhánh dev ngày 2026-11-22. Có 31 route khai báo. Bảy khung duyệt đầu bao phủ ba route `/`, `/products`, `/products/:slug` trên desktop/mobile và một sheet design system. Các route còn lại được nhóm dưới đây để bổ sung vào Stitch. Route có tham số `:id`/`:orderId` dùng dữ liệu mẫu, không truy cập dữ liệu thật.

| Nhóm | Route | Hành vi và trạng thái cần thể hiện |
| --- | --- | --- |
| Giỏ | `/cart` | Dòng hàng theo variant, quantity/update/remove, availableStock từ cart, tổng tiền, giỏ trống, lỗi/pending |
| Checkout | `/checkout/address` | Địa chỉ lưu/chọn/thêm, carrier hiện có, quote/tổng theo order preview, lỗi địa chỉ/carrier |
| Checkout | `/checkout/payment` | COD hoặc ONLINE; MoMo/PayPal, ghi chú, không hiện MOCK ngoài E2E |
| Checkout | `/checkout/voucher` | Mã tùy chọn, preview cart-aware, hợp lệ/không áp dụng/lỗi; tổng theo BE |
| Checkout | `/checkout/review` | Kiểm tra lại hàng, địa chỉ, carrier, thanh toán, voucher, tổng BE; pending/error/submit một lần |
| Checkout | `/checkout/confirmation` | Mã đơn, COD hoặc chờ thanh toán online, CTA xem đơn/thanh toán |
| Thanh toán | `/payment/result` | Chưa tạo payment/initiate, đang xử lý, PAID, FAILED/CANCELLED/EXPIRED, retry hợp lệ; không coi redirect là PAID |
| Thanh toán | `/payment/momo/return` | Poll kết quả từ BE, pending/paid/failed/missing order/error |
| Thanh toán | `/payment/paypal/return` | Capture token qua BE, pending/paid/failed/missing token/error |
| Thanh toán | `/payment/paypal/cancel` | Provider cancel return, trạng thái server, tiếp tục/retry phù hợp |
| Đơn hàng | `/orders` | Danh sách và filter trạng thái, rỗng/lỗi/tải |
| Đơn hàng | `/orders/:orderId` | Chi tiết, item, tổng, payment/shipment, cancel chỉ khi BE cho phép, refund không tự suy diễn |
| Đơn hàng | `/orders/:orderId/tracking` | Trạng thái shipment/timeline/tracking; chưa tạo vận đơn/lỗi |
| Đơn hàng | `/orders/:orderId/review` | Chọn item của đơn COMPLETED, rating/comment, pending/success/không đủ điều kiện |
| Đơn hàng | `/orders/:orderId/invoice` | Hóa đơn do BE phát hành, in/copy, chưa phát hành/lỗi |
| Tài khoản | `/profile` | Thông tin cá nhân, edit/validation/pending/success |
| Tài khoản | `/profile/security` | Đổi mật khẩu/xác thực, validation/feedback |
| Tài khoản | `/profile/addresses` | Danh sách, mặc định, edit/delete, rỗng/lỗi |
| Tài khoản | `/profile/addresses/new` | Tạo địa chỉ, trường/validation từ form hiện tại |
| Tài khoản | `/profile/addresses/:id/edit` | Sửa địa chỉ, loading/not found/delete confirm |
| Tài khoản | `/profile/reviews` | Đánh giá của tôi, phân trang/rỗng/lỗi |
| Thông báo | `/notifications` | Nhóm theo loại, đã đọc/chưa đọc, link theo referenceType/referenceId, rỗng/lỗi |
| Auth | `/login` | Email/password, redirect quay về PDP/checkout, lỗi/pending |
| Auth | `/register` | Thông tin đăng ký, email/phone đã tồn tại, validation |
| Auth | `/forgot-password` | Yêu cầu OTP, chống gửi trùng, phản hồi |
| Auth | `/verify-otp` | Xác minh mã OTP, hết hạn/sai mã, resend |
| Auth | `/reset-password` | Mật khẩu mới/xác nhận, validation/thành công |
| Lỗi | `/404` | Không tìm thấy trang, quay về catalog/home |

Tất cả màn review dùng Be Vietnam Pro, palette trong `DESIGN-BRIEF-v2.md`, VND và dữ liệu ẩn danh. Design chỉ bám hành vi route/API hiện có. Khi một API chưa có dữ liệu (ví dụ stock PDP), thiết kế ghi unknown hoặc đợi phản hồi server, không bịa số liệu. Các khung cần cả desktop/mobile hoặc tối thiểu một layout responsive có ví dụ mobile rõ ràng; bộ khung đầu chỉ minh họa ba trang nên chưa tính là phủ toàn bộ hệ thống.

## Trạng thái bản duyệt bổ sung

- Prototype local `index.html` + `journeys.html` có đường dẫn và layout responsive cho cả 31 route khai báo. `check-preview.mjs` kiểm tra ba màn khám phá; `check-journeys.mjs` kiểm tra 28 route còn lại tại 390/1440px.
- Canvas Stitch hiện hiển thị 41 khung chính, chia thành 7 nhóm và ẩn 25 bản nháp/trùng. Tất cả 31 route có khung desktop, với `new` và `edit` địa chỉ cùng dùng một khung form hai trạng thái. Home/PLP/PDP, toàn bộ giỏ/checkout và màn kết quả thanh toán có thêm khung mobile.
- Lượt tạo ba màn `/profile/reviews`, `/notifications`, `/404` từng timeout nhưng Stitch hoàn tất tác vụ ở nền và sau đó các màn xuất hiện trong project. Chúng đã được chọn làm khung chính. Các route mobile khác được review bằng prototype responsive.
- Trong lúc khảo sát, source checkout vẫn còn thông điệp voucher và một số ký hiệu USD cũ; brief/prototype dùng `API.md` đã đối chiếu: order preview và create áp mã theo giỏ, tổng tiền VND. Đây là gap tích hợp/UX cần xử lý sau khi duyệt thiết kế, không được bê nguyên thông điệp cũ sang GD2.
