import type { PaymentMethod } from '@/shared/types/enums';

export const PAYMENT_PROVIDERS = {
  MOMO: 'MOMO',
  PAYPAL: 'PAYPAL',
  MOCK: 'MOCK',
} as const;

export type PaymentProvider = (typeof PAYMENT_PROVIDERS)[keyof typeof PAYMENT_PROVIDERS];

export const PAYMENT_STATUSES = {
  INITIATED: 'INITIATED',
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  PAID: 'PAID',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED',
  EXPIRED: 'EXPIRED',
  REFUNDED: 'REFUNDED',
  PARTIALLY_REFUNDED: 'PARTIALLY_REFUNDED',
} as const;

export type PaymentStatus = (typeof PAYMENT_STATUSES)[keyof typeof PAYMENT_STATUSES];

export const PAYMENT_RECORD_STATUSES = PAYMENT_STATUSES;

export type PaymentRecordStatus = PaymentStatus;

export type PaymentTransaction = {
  id: string;
  transactionCode: string;
  status: PaymentRecordStatus | string;
  amount: number;
  method: PaymentMethod;
  provider: PaymentProvider | string | null;
  providerTxnId: string | null;
  referenceType: string;
  referenceId: string;
  note: string | null;
  createdAt: string;
};

export type Payment = {
  id: string;
  paymentId?: string;
  orderId: string;
  orderCode: string;
  paymentCode: string;
  method: PaymentMethod;
  provider?: PaymentProvider | string | null;
  status: PaymentStatus | string;
  amount: number;
  currency?: string | null;
  paidAt: string | null;
  createdAt: string;
  paymentUrl?: string | null;
  approvalUrl?: string | null;
  payUrl?: string | null;
  redirectUrl?: string | null;
  deeplink?: string | null;
  qrCodeUrl?: string | null;
  providerOrderId?: string | null;
  expiredAt?: string | null;
  transactions: PaymentTransaction[];
};

export type InitiatePaymentRequest = {
  provider?: PaymentProvider;
  returnUrl?: string;
  cancelUrl?: string;
};

export type CapturePaymentRequest = {
  provider: PaymentProvider;
  providerToken: string;
};

export type PaymentTransactionResponse = PaymentTransaction;

export type PaymentResponse = Payment;

export const isPaymentProvider = (value: string | null | undefined): value is PaymentProvider =>
  value === PAYMENT_PROVIDERS.MOMO || value === PAYMENT_PROVIDERS.PAYPAL || value === PAYMENT_PROVIDERS.MOCK;

export const normalizePaymentProvider = (value: string | null | undefined): PaymentProvider | null => {
  if (!value) {
    return null;
  }

  const normalizedValue = value.trim().toUpperCase();
  return isPaymentProvider(normalizedValue) ? normalizedValue : null;
};
