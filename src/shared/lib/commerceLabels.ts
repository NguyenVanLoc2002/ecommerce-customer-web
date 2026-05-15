import { PAYMENT_METHODS, type PaymentMethod } from '@/shared/types/enums';
import { PAYMENT_PROVIDERS, PAYMENT_STATUSES } from '@/shared/types/payment.types';

export const getPaymentMethodLabel = (paymentMethod: PaymentMethod) =>
  paymentMethod === PAYMENT_METHODS.COD ? 'Cash on delivery' : 'Online payment';

export const getPaymentMethodNote = (paymentMethod: PaymentMethod) =>
  paymentMethod === PAYMENT_METHODS.ONLINE
    ? 'Your order is created in Awaiting Payment status until the payment result flow is completed.'
    : 'Your order is created in Pending status and remains cancelable from the order archive.';

export const getPaymentProviderLabel = (provider?: string | null) => {
  if (provider === PAYMENT_PROVIDERS.MOMO) {
    return 'MoMo';
  }

  if (provider === PAYMENT_PROVIDERS.PAYPAL) {
    return 'PayPal';
  }

  if (provider === PAYMENT_PROVIDERS.MOCK) {
    return 'Mock gateway';
  }

  return provider ?? 'Online payment';
};

export const getPaymentStatusLabel = (status?: string | null) => {
  switch (status) {
    case PAYMENT_STATUSES.PAID:
      return 'Paid';
    case PAYMENT_STATUSES.FAILED:
      return 'Failed';
    case PAYMENT_STATUSES.PENDING:
      return 'Pending';
    case PAYMENT_STATUSES.PROCESSING:
      return 'Processing';
    case PAYMENT_STATUSES.INITIATED:
      return 'Initiated';
    case PAYMENT_STATUSES.CANCELLED:
      return 'Cancelled';
    case PAYMENT_STATUSES.EXPIRED:
      return 'Expired';
    case PAYMENT_STATUSES.REFUNDED:
      return 'Refunded';
    case PAYMENT_STATUSES.PARTIALLY_REFUNDED:
      return 'Partially refunded';
    default:
      return status ? status.replace(/_/g, ' ') : 'Unknown';
  }
};
