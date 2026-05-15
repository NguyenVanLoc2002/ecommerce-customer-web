import type { ProductImage } from '@/shared/types/catalog.types';
import type { Address } from '@/shared/types/address.types';
import type { OrderStatus, PaymentMethod } from '@/shared/types/enums';
import type { PaymentProvider } from '@/shared/types/payment.types';

export type CustomerAddress = Address;

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
  paymentStatus?: string;
  customerNote: string;
  voucherCode?: string;
  items: OrderItem[];
  shippingAddress: CustomerAddress;
  canCancel: boolean;
}

export interface CartItemResponse {
  id: string;
  variantId: string;
  variantName: string | null;
  sku: string | null;
  productSlug: string;
  productName: string;
  unitPrice: number;
  salePrice: number | null;
  quantity: number;
  availableStock: number;
  lineTotal: number;
  createdAt: string;
}

export interface CartResponse {
  id: string;
  items: CartItemResponse[];
  totalItems: number;
  subTotal: number;
  updatedAt: string;
}

export interface ValidateVoucherResponse {
  voucherCode: string;
  promotionName: string | null;
  discountType: string | null;
  discountValue: number | null;
  discountAmount: number;
  orderAmount: number;
  finalAmount: number;
}

export interface OrderItemResponse {
  id: string;
  productId?: string | null;
  productName: string;
  variantId?: string | null;
  variantName: string | null;
  sku: string | null;
  unitPrice: number;
  salePrice?: number | null;
  effectivePrice?: number | null;
  quantity: number;
  lineTotal: number;
}

export interface OrderListItemResponse {
  id: string;
  orderCode: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod | null;
  paymentStatus: string | null;
  totalItems: number;
  totalAmount: number;
  createdAt: string;
}

export interface OrderResponse {
  id: string;
  orderCode: string;
  customerId: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod | null;
  paymentStatus: string | null;
  shippingReceiverName: string;
  shippingPhoneNumber: string;
  shippingStreetAddress: string;
  shippingWard: string;
  shippingDistrict: string;
  shippingCity: string;
  shippingPostalCode: string | null;
  subTotal: number;
  discountAmount: number;
  shippingFee: number;
  totalAmount: number;
  voucherCode: string | null;
  customerNote: string | null;
  items: OrderItemResponse[];
  createdAt: string;
  updatedAt?: string;
}

export interface CheckoutDraft {
  shippingAddressId: string;
  paymentMethod: PaymentMethod;
  paymentProvider: PaymentProvider;
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
