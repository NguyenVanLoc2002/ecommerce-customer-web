import type { ProductImage } from '@/shared/types/catalog.types';
import type { AddressType, OrderStatus, PaymentMethod } from '@/shared/types/enums';

export interface CustomerAddress {
  id: string;
  receiverName: string;
  phoneNumber: string;
  streetAddress: string;
  ward: string;
  district: string;
  city: string;
  postalCode: string;
  addressType: AddressType;
  label: string;
  isDefault: boolean;
}

export interface CartItem {
  id: string;
  productId: string;
  productSlug: string;
  productName: string;
  brandName: string;
  variantId: string;
  sku: string;
  color: string;
  size: string;
  quantity: number;
  unitPrice: number;
  compareAtPrice?: number;
  subtotal: number;
  stockAvailable: number;
  primaryImage: ProductImage;
  isStale: boolean;
}

export interface CartTotals {
  totalItems: number;
  subTotal: number;
  shippingFee: number;
  discountTotal: number;
  grandTotal: number;
}

export interface CommerceCart extends CartTotals {
  id: string;
  items: CartItem[];
  updatedAt: string;
  staleItemCount: number;
}

export interface VoucherPreview {
  code: string;
  isApplicable: boolean;
  message: string;
  description: string;
  discountAmount: number;
}

export interface OrderItem {
  id: string;
  productId: string;
  productSlug: string;
  productName: string;
  brandName: string;
  variantId: string;
  sku: string;
  color: string;
  size: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  primaryImage: ProductImage;
}

export interface CommerceOrder extends CartTotals {
  id: string;
  code: string;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  paymentMethod: PaymentMethod;
  customerNote: string;
  voucherCode?: string;
  items: OrderItem[];
  shippingAddress: CustomerAddress;
  canCancel: boolean;
}

export interface CheckoutDraft {
  shippingAddressId: string;
  paymentMethod: PaymentMethod;
  customerNote: string;
  voucherCode: string;
  voucherPreview: VoucherPreview | null;
}

export interface PlaceOrderInput {
  shippingAddressId: string;
  paymentMethod: PaymentMethod;
  customerNote: string;
  voucherCode?: string;
}
