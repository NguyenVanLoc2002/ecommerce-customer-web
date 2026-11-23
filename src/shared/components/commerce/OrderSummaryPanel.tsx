import type { ReactNode } from 'react';

import { CartSummary, type CartSummaryValueOverrides } from '@/shared/components/commerce/CartSummary';
import type { CartTotals } from '@/shared/types/commerce.types';

type OrderSummaryPanelProps = {
  totals: CartTotals;
  note?: string;
  footer?: ReactNode;
  supplementary?: ReactNode;
  title?: string;
  isTotalsUpdating?: boolean;
  valueOverrides?: CartSummaryValueOverrides;
};

export const OrderSummaryPanel = ({ footer, isTotalsUpdating = false, note, supplementary, title = 'Order summary', totals, valueOverrides }: OrderSummaryPanelProps) => (
  <CartSummary
    description={note}
    eyebrow=""
    footer={footer}
    isTotalsUpdating={isTotalsUpdating}
    supplementary={supplementary}
    title={title}
    totals={totals}
    valueOverrides={valueOverrides}
    variant="order"
  />
);
