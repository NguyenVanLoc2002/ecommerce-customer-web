import type { ReactNode } from 'react';

import { CartSummary, type CartSummaryValueOverrides } from '@/shared/components/commerce/CartSummary';
import type { CartTotals } from '@/shared/types/commerce.types';

type OrderSummaryPanelProps = {
  totals: CartTotals;
  note?: string;
  footer?: ReactNode;
  supplementary?: ReactNode;
  isTotalsUpdating?: boolean;
  valueOverrides?: CartSummaryValueOverrides;
};

export const OrderSummaryPanel = ({ footer, isTotalsUpdating = false, note, supplementary, totals, valueOverrides }: OrderSummaryPanelProps) => (
  <CartSummary
    description={note ?? 'Backend parity note: voucher codes are stored but not applied to totals in the current contract.'}
    eyebrow="Order total"
    footer={footer}
    isTotalsUpdating={isTotalsUpdating}
    supplementary={supplementary}
    title="Summary"
    totals={totals}
    valueOverrides={valueOverrides}
    variant="order"
  />
);
