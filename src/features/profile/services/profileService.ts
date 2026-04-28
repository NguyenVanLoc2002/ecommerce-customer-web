import { config } from '@/constants/config';
import { apiClient } from '@/shared/lib/axios';
import { normalizeApiError } from '@/shared/lib/normalizeApiError';
import { createServiceError } from '@/shared/lib/serviceError';
import { useAuthStore } from '@/shared/stores/authStore';
import type { AuthUser } from '@/shared/types/auth.types';
import type { Gender, UpdateProfileRequest, UserProfile } from '@/shared/types/profile.types';

type StoredUser = AuthUser & {
  password: string;
  gender?: Gender;
  birthDate?: string;
  createdAt?: string;
};

const readUsers = (): StoredUser[] => {
  if (typeof window === 'undefined') {
    return [];
  }

  const raw = window.localStorage.getItem(config.authUsersKey);
  return raw ? (JSON.parse(raw) as StoredUser[]) : [];
};

const writeUsers = (users: StoredUser[]) => {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(config.authUsersKey, JSON.stringify(users));
  }
};

const getCurrentUserId = () => {
  const userId = useAuthStore.getState().user?.id;
  if (!userId) {
    throw createServiceError('UNAUTHORIZED', 'You must be signed in to manage this profile.');
  }

  return userId;
};

const toUserProfile = (user: StoredUser): UserProfile => ({
  id: user.id,
  email: user.email,
  firstName: user.firstName,
  lastName: user.lastName,
  phoneNumber: user.phoneNumber,
  role: user.role,
  loyaltyPoints: user.loyaltyPoints,
  avatarUrl: user.avatarUrl,
  gender: user.gender,
  birthDate: user.birthDate,
  createdAt: user.createdAt,
});

export const profileService = {
  async getProfile() {
    try {
      if (config.useMockData) {
        const userId = getCurrentUserId();
        const user = readUsers().find((item) => item.id === userId);

        if (!user) {
          throw createServiceError('USER_NOT_FOUND', 'Customer account not found.');
        }

        return toUserProfile(user);
      }

      const response = await apiClient.get<UserProfile>('/me');
      return response.data;
    } catch (error) {
      throw normalizeApiError(error);
    }
  },
  async updateProfile(payload: UpdateProfileRequest) {
    try {
      if (config.useMockData) {
        const userId = getCurrentUserId();
        const users = readUsers();
        const userIndex = users.findIndex((item) => item.id === userId);

        if (userIndex === -1) {
          throw createServiceError('USER_NOT_FOUND', 'Customer account not found.');
        }

        users[userIndex] = {
          ...users[userIndex],
          ...payload,
        };

        writeUsers(users);
        return toUserProfile(users[userIndex]);
      }

      const response = await apiClient.patch<UserProfile>('/me', payload);
      return response.data;
    } catch (error) {
      throw normalizeApiError(error);
    }
  },
};
