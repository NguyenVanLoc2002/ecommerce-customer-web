import { describe, expect, it } from 'vitest';

import { getCarrierTrackingUrl, getShipmentAttention, getShipmentEventsNewestFirst } from '@/shared/lib/shipmentTracking';
import type { Shipment, ShipmentAttention, ShipmentEvent } from '@/shared/types/shipment.types';

type ShipmentSignals = Pick<Shipment, 'attention' | 'status' | 'providerStatus'>;

describe('shipment tracking', () => {
  it.each<[ShipmentSignals, ShipmentAttention | null]>([
    [{ status: 'FAILED', attention: 'CARRIER_CANCELLED' }, 'CARRIER_CANCELLED'],
    [{ status: 'FAILED', attention: 'DELIVERY_FAILED', providerStatus: 'CANCELLED' }, 'DELIVERY_FAILED'],
    [{ status: 'FAILED', providerStatus: ' cancelled ' }, 'CARRIER_CANCELLED'],
    [{ status: 'FAILED', attention: null }, 'DELIVERY_FAILED'],
    [{ status: 'RETURNED' }, 'RETURNED_HANDLING'],
    [{ status: 'PICKING', providerStatus: 'CANCELLED' }, null],
    [{ status: 'DELIVERED' }, null],
  ])('maps %j to %s', (signals, expected) => {
    expect(getShipmentAttention(signals)).toBe(expected);
  });

  it('orders events by timestamp without mutating cached data', () => {
    const events: ShipmentEvent[] = [
      { id: 'earlier', status: 'PICKING', eventTime: '2026-11-25T12:30:00+07:00', location: null, description: null },
      { id: 'later', status: 'IN_TRANSIT', eventTime: '2026-11-25T06:00:00Z', location: null, description: null },
    ];
    expect(getShipmentEventsNewestFirst(events).map(({ id }) => id)).toEqual(['later', 'earlier']);
    expect(events[0].id).toBe('earlier');
    expect(getShipmentEventsNewestFirst([])).toEqual([]);
  });

  it.each([null, ' ', '/track/123', 'javascript:alert(1)', 'https://user:pass@carrier.example.test/123'])(
    'omits invalid tracking URL %s',
    (url) => expect(getCarrierTrackingUrl(url)).toBeNull(),
  );

  it('keeps a usable carrier URL', () => {
    expect(getCarrierTrackingUrl('https://carrier.example.test/track/123')).toBe('https://carrier.example.test/track/123');
  });
});
