import { PAYMENT_PROVIDERS, type PaymentProvider } from '@/shared/types/payment.types';

const PENDING_PAYPAL_STORAGE_KEY = 'locen.pendingPayPalPayment';

export type PendingPaypalPayment = {
  orderId: string;
  orderCode: string;
  paymentId: string;
  provider: Extract<PaymentProvider, 'PAYPAL'>;
  createdAt: string;
};

const isPendingPaypalPayment = (value: unknown): value is PendingPaypalPayment => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.orderId === 'string' &&
    typeof candidate.orderCode === 'string' &&
    typeof candidate.paymentId === 'string' &&
    candidate.provider === PAYMENT_PROVIDERS.PAYPAL &&
    typeof candidate.createdAt === 'string'
  );
};

export const readPendingPaypalPayment = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const rawValue = window.sessionStorage.getItem(PENDING_PAYPAL_STORAGE_KEY);
    if (!rawValue) {
      return null;
    }

    const parsedValue: unknown = JSON.parse(rawValue);
    return isPendingPaypalPayment(parsedValue) ? parsedValue : null;
  } catch {
    return null;
  }
};

export const writePendingPaypalPayment = (value: PendingPaypalPayment) => {
  if (typeof window === 'undefined') {
    return;
  }

  window.sessionStorage.setItem(PENDING_PAYPAL_STORAGE_KEY, JSON.stringify(value));
};

export const clearPendingPaypalPayment = (orderId?: string) => {
  if (typeof window === 'undefined') {
    return;
  }

  const pendingPayment = readPendingPaypalPayment();
  if (orderId && pendingPayment?.orderId !== orderId) {
    return;
  }

  window.sessionStorage.removeItem(PENDING_PAYPAL_STORAGE_KEY);
};
