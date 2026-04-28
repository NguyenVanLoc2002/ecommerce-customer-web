import { create } from 'zustand';

import { config } from '@/constants/config';
import type { AuthBootstrapStatus, AuthResponse, AuthUser } from '@/shared/types/auth.types';

type AuthState = {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  bootstrapStatus: AuthBootstrapStatus;
  setSession: (session: AuthResponse) => void;
  clearSession: () => void;
  startBootstrap: () => void;
  finishBootstrap: () => void;
  updateUser: (user: Partial<AuthUser>) => void;
};

const getStorage = () => (typeof window === 'undefined' ? null : window.localStorage);

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  bootstrapStatus: 'idle',
  setSession: (session) => {
    const storage = getStorage();
    storage?.setItem(config.authHintKey, session.refreshToken);

    set({
      user: session.user,
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
    });
  },
  clearSession: () => {
    const storage = getStorage();
    storage?.removeItem(config.authHintKey);
    storage?.removeItem(config.authSessionKey);

    set({
      user: null,
      accessToken: null,
      refreshToken: null,
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
