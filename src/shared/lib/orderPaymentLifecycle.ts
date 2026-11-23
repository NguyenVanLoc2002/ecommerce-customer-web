import { ORDER_STATUSES, PAYMENT_METHODS, type OrderStatus, type PaymentMethod } from '@/shared/types/enums';
import { PAYMENT_STATUSES, type PaymentStatus } from '@/shared/types/payment.types';

export type OrderPaymentLifecycle = {
  orderStatus: OrderStatus | string;
  paymentMethod: PaymentMethod | string | null;
  orderPaymentStatus?: PaymentStatus | string | null;
  paymentStatus?: PaymentStatus | string | null;
};

export const isCancelledOrderWithPaidPayment = (lifecycle: OrderPaymentLifecycle) => {
  const paymentIsPaid = lifecycle.paymentStatus !== undefined && lifecycle.paymentStatus !== null
    ? lifecycle.paymentStatus === PAYMENT_STATUSES.PAID
    : lifecycle.orderPaymentStatus === PAYMENT_STATUSES.PAID;

  return lifecycle.orderStatus === ORDER_STATUSES.CANCELLED && paymentIsPaid;
};

export const canStartOrRetryOnlinePayment = (lifecycle: OrderPaymentLifecycle) =>
  lifecycle.orderStatus === ORDER_STATUSES.AWAITING_PAYMENT &&
  lifecycle.paymentMethod === PAYMENT_METHODS.ONLINE &&
  lifecycle.orderPaymentStatus !== PAYMENT_STATUSES.PAID &&
  lifecycle.paymentStatus !== PAYMENT_STATUSES.PAID;

export const getCheckoutHoldMessage = (lifecycle: Pick<OrderPaymentLifecycle, 'orderStatus' | 'paymentMethod'>) => {
  if (lifecycle.orderStatus === ORDER_STATUSES.PENDING && lifecycle.paymentMethod === PAYMENT_METHODS.COD) {
    return 'Đơn COD đang chờ Admin xác nhận, thời gian chờ có thể lên đến 24 giờ. Đơn chưa bắt đầu xử lý giao hàng.';
  }

  if (lifecycle.orderStatus === ORDER_STATUSES.AWAITING_PAYMENT && lifecycle.paymentMethod === PAYMENT_METHODS.ONLINE) {
    return 'Đơn hàng đang chờ thanh toán online. Hàng được giữ tối đa 30 phút; trạng thái giao hàng chỉ cập nhật sau khi Backend xác nhận.';
  }

  return null;
};

export const getCancelledPaidMessage = (lifecycle: OrderPaymentLifecycle) =>
  isCancelledOrderWithPaidPayment(lifecycle)
    ? 'Khoản thanh toán đã được ghi nhận nhưng đơn hàng đã bị hủy. Đơn không được chuyển sang xử lý giao hàng; cần đối soát và hoàn tiền thủ công. Chưa có thời hạn hoặc hoàn tiền tự động được xác nhận.'
    : null;
