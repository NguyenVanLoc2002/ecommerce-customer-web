import type { Role } from '@/shared/types/enums';

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  role: Role;
  roles: Role[];
  status?: string;
  customerId?: string;
  loyaltyPoints: number;
  avatarUrl?: string;
}

export interface AuthTokens {
  accessToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
}

export interface AuthResponse extends AuthTokens {
  user: AuthUser;
}

export type TokenResponse = AuthTokens;

export type ApiTokenResponse = TokenResponse;

export interface ApiAuthUserResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string | null;
  phoneNumber: string | null;
  status: string;
  roles: Role[];
  customerId: string | null;
  gender: string | null;
  birthDate: string | null;
  avatarUrl: string | null;
  loyaltyPoints: number | null;
  createdAt: string;
}

export type ApiAuthResponse =
  {
    user: ApiAuthUserResponse;
    tokens: ApiTokenResponse;
  };

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput extends LoginInput {
  firstName: string;
  lastName?: string;
  phoneNumber?: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface VerifyForgotPasswordOtpRequest {
  email: string;
  otp: string;
}

export interface VerifyForgotPasswordOtpResponse {
  resetToken: string;
  expiresAt: string;
}

export interface ResetPasswordRequest {
  resetToken: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export type AuthBootstrapStatus = 'idle' | 'loading' | 'ready';
