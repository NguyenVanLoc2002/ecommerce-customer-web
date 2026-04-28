import type { ReactNode } from 'react';

import { CartSummary } from '@/shared/components/commerce/CartSummary';
import type { CartTotals } from '@/shared/types/commerce.types';

type OrderSummaryPanelProps = {
  totals: CartTotals;
  note?: string;
  footer?: ReactNode;
  supplementary?: ReactNode;
};

export const OrderSummaryPanel = ({ footer, note, supplementary, totals }: OrderSummaryPanelProps) => (
  <CartSummary
    description={note ?? 'Backend parity note: voucher codes are stored but not applied to totals in the current contract.'}
    eyebrow="Order total"
    footer={footer}
    supplementary={supplementary}
    title="Summary"
    totals={totals}
    variant="order"
  />
);
