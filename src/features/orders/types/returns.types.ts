export const returnReasons = ['DEFECTIVE', 'WRONG_ITEM', 'MISSING_ITEM', 'NOT_AS_DESCRIBED', 'CHANGED_MIND'] as const;
export type ReturnReason = (typeof returnReasons)[number];

export type ReturnStatus =
  | 'PENDING_DELIVERY_VERIFICATION' | 'REQUESTED' | 'APPROVED' | 'RECEIVED'
  | 'INSPECTED' | 'COMPLETED' | 'REJECTED' | 'CANCELLED';

export type ReturnItem = { orderItemId: string; quantity: number };

export type CreateReturnRequest = {
  reason: ReturnReason;
  note: string;
  items: ReturnItem[];
  originalCondition: boolean;
  unopened: boolean;
};

export type ReturnSummary = {
  id: string;
  orderId: string;
  status: ReturnStatus;
  reason: ReturnReason;
  note: string;
  createdAt: string;
  items: ReturnItem[];
};

export type EligibleReturnItem = {
  orderItemId: string;
  availableQuantity: number;
  allowedReasons: ReturnReason[];
  unopenedRequiredForChangedMind: boolean;
};

export type OrderReturns = {
  eligibleItems: EligibleReturnItem[];
  requests: ReturnSummary[];
};

export type ReturnDetail = {
  request: ReturnSummary;
  timeline: { status: ReturnStatus; occurredAt: string }[];
  tracking: { carrier: string | null; trackingNumber: string | null; trackingAt: string | null } | null;
  inspection: (ReturnItem & { restock: number; damaged: number })[];
  refund: {
    amount: number;
    status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
    createdAt: string;
    refundedAt: string | null;
  } | null;
  exchanges: {
    id: string;
    orderItemId: string;
    quantity: number;
    status: 'PRICE_REVIEW_REQUIRED' | 'DIFFERENT_PRICE' | 'WAITING_CUSTOMER_CHOICE'
      | 'RESERVED' | 'HOLD_EXPIRED' | 'REPLACEMENT_CREATED' | 'CANCELLED';
    replacementOrderId: string | null;
  }[];
};
