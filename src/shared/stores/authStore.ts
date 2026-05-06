import { create } from 'zustand';

import { clearLegacyCustomerAuthStorage } from '@/shared/lib/authStorage';
import type { AuthBootstrapStatus, AuthResponse, AuthUser } from '@/shared/types/auth.types';

type AuthState = {
  user: AuthUser | null;
  accessToken: string | null;
  bootstrapStatus: AuthBootstrapStatus;
  setSession: (session: AuthResponse) => void;
  clearSession: () => void;
  startBootstrap: () => void;
  finishBootstrap: () => void;
  updateUser: (user: Partial<AuthUser>) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  bootstrapStatus: 'idle',
  setSession: (session) => {
    set({
      user: session.user,
      accessToken: session.accessToken,
    });
  },
  clearSession: () => {
    clearLegacyCustomerAuthStorage();

    set({
      user: null,
      accessToken: null,
    });
  },
  startBootstrap: () => set({ bootstrapStatus: 'loading' }),
  finishBootstrap: () => set({ bootstrapStatus: 'ready' }),
  updateUser: (user) =>
    set((state) => ({
      user: state.user
        ? {
            ...state.user,
            ...user,
          }
        : null,
    })),
}));
