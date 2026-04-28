import { config } from '@/constants/config';
import { apiClient } from '@/shared/lib/axios';
import { createServiceError } from '@/shared/lib/serviceError';
import type { AuthResponse, AuthUser, LoginInput, RegisterInput } from '@/shared/types/auth.types';
import { USER_ROLES } from '@/shared/types/enums';
import type { Gender } from '@/shared/types/profile.types';

type StoredUser = AuthUser & {
  password: string;
  gender?: Gender;
  birthDate?: string;
  createdAt?: string;
};

type StoredSession = {
  userId: string;
  refreshToken: string;
};

const readUsers = (): StoredUser[] => {
  if (typeof window === 'undefined') {
    return [];
  }

  const raw = window.localStorage.getItem(config.authUsersKey);
  if (!raw) {
    const seedUser: StoredUser = {
      id: 'customer-001',
      email: 'customer@fashion-shop.com',
      firstName: 'Elena',
      lastName: 'Hart',
      phoneNumber: '+12025550120',
      password: 'Customer123!',
      loyaltyPoints: 480,
      role: USER_ROLES.CUSTOMER,
      gender: 'FEMALE',
      birthDate: '1994-03-16',
      createdAt: '2026-01-09T09:30:00Z',
      avatarUrl:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=240&q=80',
    };
    window.localStorage.setItem(config.authUsersKey, JSON.stringify([seedUser]));
    return [seedUser];
  }

  return JSON.parse(raw) as StoredUser[];
};

const writeUsers = (users: StoredUser[]) => {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(config.authUsersKey, JSON.stringify(users));
  }
};

const readSession = (): StoredSession | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  const raw = window.localStorage.getItem(config.authSessionKey);
  return raw ? (JSON.parse(raw) as StoredSession) : null;
};

const writeSession = (session: StoredSession) => {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(config.authSessionKey, JSON.stringify(session));
  }
};

const issueTokens = (user: AuthUser, refreshToken?: string): AuthResponse => {
  const nextRefreshToken = refreshToken ?? `refresh-${crypto.randomUUID()}`;
  writeSession({
    userId: user.id,
    refreshToken: nextRefreshToken,
  });

  return {
    user,
    accessToken: `access-${crypto.randomUUID()}`,
    refreshToken: nextRefreshToken,
    tokenType: 'Bearer',
    expiresIn: 3600,
  };
};

const sanitizeUser = (user: StoredUser): AuthUser => {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    phoneNumber: user.phoneNumber,
    role: user.role,
    loyaltyPoints: user.loyaltyPoints,
    avatarUrl: user.avatarUrl,
  };
};

const loginMock = async ({ email, password }: LoginInput): Promise<AuthResponse> => {
  const user = readUsers().find((item) => item.email.toLowerCase() === email.toLowerCase());

  if (!user || user.password !== password) {
    throw createServiceError('INVALID_CREDENTIALS', 'Email or password is incorrect.');
  }

  if (user.role !== USER_ROLES.CUSTOMER) {
    throw createServiceError('FORBIDDEN', 'Only customer accounts can access this storefront.');
  }

  return issueTokens(sanitizeUser(user));
};

const registerMock = async (payload: RegisterInput): Promise<AuthResponse> => {
  const users = readUsers();

  if (users.some((user) => user.email.toLowerCase() === payload.email.toLowerCase())) {
    throw createServiceError('EMAIL_ALREADY_EXISTS', 'An account already uses this email.', {
      email: 'This email is already registered.',
    });
  }

  if (users.some((user) => user.phoneNumber === payload.phoneNumber)) {
    throw createServiceError('PHONE_ALREADY_EXISTS', 'An account already uses this phone number.', {
      phoneNumber: 'This phone number is already registered.',
    });
  }

  const nextUser: StoredUser = {
    id: `customer-${crypto.randomUUID()}`,
    email: payload.email,
    firstName: payload.firstName,
    lastName: payload.lastName,
    phoneNumber: payload.phoneNumber,
    password: payload.password,
    loyaltyPoints: 120,
    role: USER_ROLES.CUSTOMER,
    createdAt: new Date().toISOString(),
  };

  writeUsers([...users, nextUser]);

  return issueTokens(sanitizeUser(nextUser));
};

const refreshMock = async (refreshToken: string): Promise<AuthResponse> => {
  const session = readSession();
  if (!session || session.refreshToken !== refreshToken) {
    throw createServiceError('REFRESH_TOKEN_INVALID', 'Your session has expired. Please sign in again.');
  }

  const user = readUsers().find((item) => item.id === session.userId);
  if (!user) {
    throw createServiceError('USER_NOT_FOUND', 'Customer account not found.');
  }

  return issueTokens(sanitizeUser(user), refreshToken);
};

export const authService = {
  async login(payload: LoginInput) {
    if (config.useMockData) {
      return loginMock(payload);
    }

    const response = await apiClient.post<AuthResponse>('/auth/login', payload);
    return response.data;
  },
  async register(payload: RegisterInput) {
    if (config.useMockData) {
      return registerMock(payload);
    }

    const response = await apiClient.post<AuthResponse>('/auth/register', payload);
    return response.data;
  },
  async refreshToken(refreshToken: string) {
    if (config.useMockData) {
      return refreshMock(refreshToken);
    }

    const response = await apiClient.post<AuthResponse>('/auth/refresh-token', { refreshToken });
    return response.data;
  },
  async logout() {
    if (config.useMockData) {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(config.authSessionKey);
      }
      return;
    }

    await apiClient.post('/auth/logout');
  },
};
