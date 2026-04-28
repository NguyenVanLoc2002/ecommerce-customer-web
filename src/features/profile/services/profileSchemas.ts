import { z } from 'zod';

import { GENDERS } from '@/shared/types/profile.types';

const optionalDate = z
  .string()
  .max(10, 'Use the date picker to choose a valid birth date.')
  .refine((value) => value.length === 0 || !Number.isNaN(Date.parse(value)), 'Choose a valid birth date.');

export const profileSchema = z.object({
  firstName: z.string().trim().min(2, 'First name must be at least 2 characters.').max(100, 'First name must be at most 100 characters.'),
  lastName: z.string().trim().min(2, 'Last name must be at least 2 characters.').max(100, 'Last name must be at most 100 characters.'),
  phoneNumber: z.string().trim().min(10, 'Phone number must be at least 10 digits.').max(20, 'Phone number must be at most 20 characters.'),
  gender: z.union([z.literal(''), z.enum([GENDERS.FEMALE, GENDERS.MALE, GENDERS.OTHER])]),
  birthDate: optionalDate,
});

export type ProfileSchemaInput = z.infer<typeof profileSchema>;
