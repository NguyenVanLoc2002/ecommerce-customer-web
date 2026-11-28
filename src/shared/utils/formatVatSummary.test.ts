import { describe, expect, it } from 'vitest';
import { formatVatSummary } from './formatVatSummary';

describe('formatVatSummary', () => {
  it('keeps an explicit zero rate distinct from non-taxable, mixed and missing data', () => {
    expect(formatVatSummary({ kind: 'INCLUDED_SINGLE_RATE', rateFraction: 0 })).toBe('Đã bao gồm 0% VAT');
    expect(formatVatSummary({ kind: 'INCLUDED_SINGLE_RATE', rateFraction: 0.08 })).toBe('Đã bao gồm 8% VAT');
    expect(formatVatSummary({ kind: 'INCLUDED_MULTIPLE_RATES' })).toBe('Đã bao gồm VAT');
    expect(formatVatSummary({ kind: 'NOT_TAXABLE' })).toBe('Không thuộc diện chịu VAT');
    expect(formatVatSummary()).toBeUndefined();
  });
});
