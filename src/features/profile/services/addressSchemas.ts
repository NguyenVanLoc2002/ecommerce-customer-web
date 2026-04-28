import { z } from 'zod';

import { ADDRESS_TYPES } from '@/shared/types/enums';

export const addressSchema = z.object({
  receiverName: z.string().trim().min(2, 'Receiver name must be at least 2 characters.').max(100, 'Receiver name must be at most 100 characters.'),
  phoneNumber: z.string().trim().min(10, 'Phone number must be at least 10 digits.').max(20, 'Phone number must be at most 20 characters.'),
  streetAddress: z.string().trim().min(4, 'Street address must be at least 4 characters.').max(255, 'Street address must be at most 255 characters.'),
  ward: z.string().trim().min(2, 'Ward must be at least 2 characters.').max(100, 'Ward must be at most 100 characters.'),
  district: z.string().trim().min(2, 'District must be at least 2 characters.').max(100, 'District must be at most 100 characters.'),
  city: z.string().trim().min(2, 'City must be at least 2 characters.').max(100, 'City must be at most 100 characters.'),
  postalCode: z.string().trim().max(20, 'Postal code must be at most 20 characters.'),
  addressType: z.enum([ADDRESS_TYPES.HOME, ADDRESS_TYPES.OFFICE]),
  isDefault: z.boolean(),
  label: z.string().trim().max(50, 'Label must be at most 50 characters.'),
});

export type AddressSchemaInput = z.infer<typeof addressSchema>;
