import { z } from 'zod';

export const voucherSchema = z.object({
  voucherCode: z
    .string()
    .trim()
    .min(3, 'Enter a voucher code or leave this step empty.')
    .max(32, 'Voucher codes must be shorter than 32 characters.'),
});

export type VoucherSchemaInput = z.infer<typeof voucherSchema>;

