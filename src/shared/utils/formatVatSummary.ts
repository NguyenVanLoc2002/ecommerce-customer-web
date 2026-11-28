import type { StorefrontVatSummary } from '@/shared/types/commerce.types';

const percentage = new Intl.NumberFormat('vi-VN', { style: 'percent', maximumFractionDigits: 6 });

export const formatVatSummary = (summary?: StorefrontVatSummary) => {
  switch (summary?.kind) {
    case 'INCLUDED_SINGLE_RATE':
      return Number.isFinite(summary.rateFraction) ? `Đã bao gồm ${percentage.format(summary.rateFraction)} VAT` : undefined;
    case 'INCLUDED_MULTIPLE_RATES':
      return 'Đã bao gồm VAT';
    case 'NOT_TAXABLE':
      return 'Không thuộc diện chịu VAT';
    default:
      return undefined;
  }
};
