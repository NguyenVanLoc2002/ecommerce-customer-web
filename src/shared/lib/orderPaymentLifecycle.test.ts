import { describe, expect, it } from 'vitest';

import { canStartOrRetryOnlinePayment, getCancelledPaidMessage, getCheckoutHoldMessage, isCancelledOrderWithPaidPayment } from './orderPaymentLifecycle';

describe('order payment lifecycle', () => {
  it('identifies a late paid payment on a cancelled order from either API status', () => {
    expect(
      isCancelledOrderWithPaidPayment({
        orderStatus: 'CANCELLED',
        paymentMethod: 'ONLINE',
        orderPaymentStatus: 'PENDING',
        paymentStatus: 'PAID',
      }),
    ).toBe(true);
    expect(
      isCancelledOrderWithPaidPayment({
        orderStatus: 'CANCELLED',
        paymentMethod: 'ONLINE',
        orderPaymentStatus: 'PAID',
        paymentStatus: 'PAID',
      }),
    ).toBe(true);
    expect(
      isCancelledOrderWithPaidPayment({
        orderStatus: 'CANCELLED',
        paymentMethod: 'ONLINE',
        orderPaymentStatus: 'PAID',
        paymentStatus: 'PENDING',
      }),
    ).toBe(false);
  });

  it('never presents a cancelled paid order as fulfillment ready', () => {
    const message = getCancelledPaidMessage({
      orderStatus: 'CANCELLED',
      paymentMethod: 'ONLINE',
      orderPaymentStatus: 'PAID',
      paymentStatus: 'PAID',
    });

    expect(message).toContain('đối soát và hoàn tiền thủ công');
    expect(message).not.toContain('sẵn sàng giao hàng');
  });

  it('allows payment actions only for an online order still awaiting payment', () => {
    expect(canStartOrRetryOnlinePayment({ orderStatus: 'AWAITING_PAYMENT', paymentMethod: 'ONLINE', orderPaymentStatus: 'PENDING' })).toBe(true);
    expect(canStartOrRetryOnlinePayment({ orderStatus: 'CANCELLED', paymentMethod: 'ONLINE', orderPaymentStatus: 'PENDING' })).toBe(false);
    expect(canStartOrRetryOnlinePayment({ orderStatus: 'AWAITING_PAYMENT', paymentMethod: 'ONLINE', orderPaymentStatus: 'PAID' })).toBe(false);
    expect(canStartOrRetryOnlinePayment({ orderStatus: 'PENDING', paymentMethod: 'COD', orderPaymentStatus: 'PENDING' })).toBe(false);
  });

  it('explains current COD and online holds without deriving a countdown', () => {
    expect(getCheckoutHoldMessage({ orderStatus: 'PENDING', paymentMethod: 'COD' })).toContain('24 giờ');
    expect(getCheckoutHoldMessage({ orderStatus: 'AWAITING_PAYMENT', paymentMethod: 'ONLINE' })).toContain('30 phút');
    expect(getCheckoutHoldMessage({ orderStatus: 'CONFIRMED', paymentMethod: 'COD' })).toBeNull();
  });
});
