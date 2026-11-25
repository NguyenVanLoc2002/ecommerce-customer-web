import { describe, expect, it } from 'vitest';

import { PAYMENT_METHODS } from '@/shared/types/enums';
import { getPaymentMethodLabel, getPaymentStatusLabel } from './commerceLabels';

describe('order payment labels', () => {
  it('shows an exchange replacement without describing it as a payment', () => {
    expect(getPaymentMethodLabel(PAYMENT_METHODS.EXCHANGE)).toBe('Exchange replacement');
    expect(getPaymentStatusLabel('NOT_REQUIRED')).toBe('No payment required');
  });

  it('keeps checkout payment labels', () => {
    expect(getPaymentMethodLabel(PAYMENT_METHODS.COD)).toBe('Cash on delivery');
    expect(getPaymentMethodLabel(PAYMENT_METHODS.ONLINE)).toBe('Online payment');
  });
});
