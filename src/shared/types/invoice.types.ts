import type { PaymentMethod } from '@/shared/types/enums';
import type { PaymentStatus } from '@/shared/types/payment.types';

export interface InvoiceAddressSnapshot {
  id?: string;
  receiverName: string;
  phoneNumber: string;
  streetAddress: string;
  ward: string;
  district: string;
  city: string;
  postalCode: string;
  addressType?: 'HOME' | 'OFFICE';
  isDefault?: boolean;
  label?: string;
  fullAddress?: string;
}

export interface InvoiceItem {
  id: string;
  variantId: string;
  productName: string;
  variantName?: string;
  sku: string;
  unitPrice: number;
  salePrice?: number | null;
  effectivePrice?: number;
  quantity: number;
  lineTotal?: number;
  color?: string;
  size?: string;
}

export interface Invoice {
  id: string;
  invoiceCode: string;
  status?: string;
  orderId: string;
  orderCode: string;
  issuedAt: string;
  dueDate: string | null;
  paidAt: string | null;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus | 'NOT_INITIATED';
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  notes: string;
  paymentCode?: string | null;
  customerNote?: string;
  voucherCode?: string;
  shippingAddress: InvoiceAddressSnapshot;
  items: InvoiceItem[];
  subTotal: number;
  shippingFee: number;
  discountTotal: number;
  grandTotal: number;
  createdAt?: string;
}

export interface InvoiceItemResponse {
  variantId: string;
  productName: string;
  variantName: string;
  sku: string;
  unitPrice: number;
  salePrice: number | null;
  effectivePrice: number;
  quantity: number;
  lineTotal: number;
}

export interface InvoiceResponse {
  id: string;
  invoiceCode: string;
  status: string;
  issuedAt: string;
  dueDate: string | null;
  notes: string | null;
  orderId: string;
  orderCode: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paidAt: string | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  billingReceiverName?: string | null;
  billingPhoneNumber?: string | null;
  billingStreetAddress?: string | null;
  billingWard?: string | null;
  billingDistrict?: string | null;
  billingCity?: string | null;
  billingPostalCode?: string | null;
  items: InvoiceItemResponse[];
  subTotal: number;
  discountAmount: number;
  shippingFee: number;
  totalAmount: number;
  voucherCode: string | null;
  createdAt: string;
}
