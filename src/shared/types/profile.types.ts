import type { AuthUser } from '@/shared/types/auth.types';

export const GENDERS = {
  FEMALE: 'FEMALE',
  MALE: 'MALE',
  OTHER: 'OTHER',
} as const;

export type Gender = (typeof GENDERS)[keyof typeof GENDERS];

export interface UserProfile extends AuthUser {
  gender?: Gender;
  birthDate?: string;
  createdAt?: string;
}

export interface ApiUserProfileResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string | null;
  phoneNumber: string | null;
  status: string;
  roles: AuthUser['roles'];
  customerId: string | null;
  gender: Gender | null;
  birthDate: string | null;
  avatarUrl: string | null;
  loyaltyPoints: number | null;
  createdAt: string;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  gender?: Gender;
  birthDate?: string;
}
