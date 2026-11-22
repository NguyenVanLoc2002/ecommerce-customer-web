import type { CartTotals, CheckoutOrderInput, CommerceCart, CommerceOrder, OrderPreview } from '../../../shared/types/commerce.types';
import type { PaymentMethod } from '../../../shared/types/enums';

type CheckoutOrderDraftLike = {
  shippingAddressId: string;
  selectedCarrierId?: string;
  paymentMethod: PaymentMethod;
  customerNote: string;
  voucherCode: string;
};

export const buildCheckoutOrderPayload = ({
  customerNote,
  paymentMethod,
  selectedCarrierId,
  shippingAddressId,
  voucherCode,
}: CheckoutOrderDraftLike) => ({
  shippingAddressId,
  carrierId: selectedCarrierId?.trim() ? selectedCarrierId : undefined,
  paymentMethod,
  customerNote,
  voucherCode,
});

export const buildCheckoutPreviewTotals = (preview: OrderPreview, totalItems: number): CartTotals => ({
  totalItems,
  subTotal: preview.subTotal,
  shippingFee: preview.shippingFee,
  discountTotal: preview.discountAmount,
  grandTotal: preview.totalAmount,
});

export const buildOrderPreviewFromOrder = (order: CommerceOrder): OrderPreview => ({
  carrierId: order.carrierId ?? null,
  carrierCode: order.carrierCode ?? null,
  carrierName: order.carrierName ?? null,
  carrierProviderType: order.carrierProviderType ?? null,
  paymentMethod: order.paymentMethod,
  subTotal: order.subTotal,
  discountAmount: order.discountTotal,
  shippingFee: order.shippingFee,
  totalAmount: order.grandTotal,
  voucherCode: order.voucherCode ?? null,
  customerNote: order.customerNote,
});

export const hasCheckoutPreviewPrerequisites = (shippingAddressId: string) => shippingAddressId.trim().length > 0;

export const buildCheckoutPreviewSignature = (payload: CheckoutOrderInput | null, cart: CommerceCart | null) =>
  JSON.stringify({
    payload,
    cart: cart
      ? {
          id: cart.id,
          updatedAt: cart.updatedAt,
          totalItems: cart.totalItems,
          subTotal: cart.subTotal,
          staleItemCount: cart.staleItemCount,
          items: cart.items.map((item) => ({
            id: item.id,
            variantId: item.variantId,
            quantity: item.quantity,
            subtotal: item.subtotal,
          })),
        }
      : null,
  });
