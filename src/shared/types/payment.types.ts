import type { PaymentMethod } from '@/shared/types/enums';

export const PAYMENT_STATUSES = {
  INITIATED: 'INITIATED',
  PENDING: 'PENDING',
  PAID: 'PAID',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED',
  PARTIALLY_REFUNDED: 'PARTIALLY_REFUNDED',
} as const;

export type PaymentStatus = (typeof PAYMENT_STATUSES)[keyof typeof PAYMENT_STATUSES];

export const PAYMENT_RECORD_STATUSES = PAYMENT_STATUSES;

export type PaymentRecordStatus = PaymentStatus;

export type PaymentTransaction = {
  id: string;
  transactionCode: string;
  status: PaymentRecordStatus;
  amount: number;
  method: PaymentMethod;
  provider: string | null;
  providerTxnId: string | null;
  referenceType: string;
  referenceId: string;
  note: string | null;
  createdAt: string;
};

export type Payment = {
  id: string;
  orderId: string;
  orderCode: string;
  paymentCode: string;
  method: PaymentMethod;
  status: PaymentStatus;
  amount: number;
  paidAt: string | null;
  createdAt: string;
  transactions: PaymentTransaction[];
};

export type InitiatePaymentRequest = {
  provider?: string;
  returnUrl?: string;
};

export type PaymentTransactionResponse = PaymentTransaction;

export type PaymentResponse = Payment;
