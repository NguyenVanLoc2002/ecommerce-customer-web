import { PAYMENT_METHODS, type PaymentMethod } from '@/shared/types/enums';

export const getPaymentMethodLabel = (paymentMethod: PaymentMethod) =>
  paymentMethod === PAYMENT_METHODS.COD ? 'Cash on delivery' : 'Online payment';

export const getPaymentMethodNote = (paymentMethod: PaymentMethod) =>
  paymentMethod === PAYMENT_METHODS.ONLINE
    ? 'Your order is created in Awaiting Payment status until the payment result flow is completed.'
    : 'Your order is created in Pending status and remains cancelable from the order archive.';
