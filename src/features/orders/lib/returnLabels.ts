import type { ReturnDetail, ReturnReason, ReturnStatus } from '../types/returns.types';

export const returnReasonLabels: Record<ReturnReason, string> = {
  DEFECTIVE: 'Sản phẩm bị lỗi',
  WRONG_ITEM: 'Giao sai sản phẩm',
  MISSING_ITEM: 'Thiếu sản phẩm',
  NOT_AS_DESCRIBED: 'Sản phẩm khác mô tả',
  CHANGED_MIND: 'Thay đổi ý định',
};

export const returnStatusLabels: Record<ReturnStatus, string> = {
  PENDING_DELIVERY_VERIFICATION: 'Đang xác minh giao hàng',
  REQUESTED: 'Đang chờ xét duyệt',
  APPROVED: 'Đã duyệt',
  RECEIVED: 'Đã nhận hàng trả',
  INSPECTED: 'Đã kiểm tra hàng trả',
  COMPLETED: 'Đã hoàn tất đổi/trả',
  REJECTED: 'Đã từ chối',
  CANCELLED: 'Đã hủy yêu cầu',
};

export const refundStatusLabels: Record<NonNullable<ReturnDetail['refund']>['status'], string> = {
  PENDING: 'Chờ xác nhận hoàn tiền',
  PROCESSING: 'Đang xử lý hoàn tiền',
  COMPLETED: 'Đã xác nhận hoàn tiền',
  FAILED: 'Hoàn tiền thất bại',
  CANCELLED: 'Đã hủy hoàn tiền',
};

export const exchangeStatusLabels: Record<ReturnDetail['exchanges'][number]['status'], string> = {
  PRICE_REVIEW_REQUIRED: 'Đang xác minh giá sản phẩm đổi',
  DIFFERENT_PRICE: 'Sản phẩm đổi có giá khác',
  WAITING_CUSTOMER_CHOICE: 'Đang chờ bạn chọn sản phẩm đổi',
  RESERVED: 'Đã giữ sản phẩm đổi',
  HOLD_EXPIRED: 'Đã hết thời hạn giữ sản phẩm đổi',
  REPLACEMENT_CREATED: 'Đã tạo đơn thay thế',
  CANCELLED: 'Đã hủy đổi hàng',
};

export const formatReturnDate = (value: string) => {
  const utcValue = /(?:Z|[+-]\d{2}:\d{2})$/i.test(value) ? value : `${value}Z`;
  return new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(utcValue));
};
