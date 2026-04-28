import type { PropsWithChildren } from 'react';
import { useEffect } from 'react';

import { config } from '@/constants/config';
import { authService } from '@/features/auth/services/authService';
import { LoadingOverlay } from '@/shared/components/feedback/LoadingOverlay';
import { useAuthStore } from '@/shared/stores/authStore';

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const accessToken = useAuthStore((state) => state.accessToken);
  const bootstrapStatus = useAuthStore((state) => state.bootstrapStatus);
  const clearSession = useAuthStore((state) => state.clearSession);
  const finishBootstrap = useAuthStore((state) => state.finishBootstrap);
  const setSession = useAuthStore((state) => state.setSession);
  const startBootstrap = useAuthStore((state) => state.startBootstrap);

  useEffect(() => {
    let active = true;

    const bootstrap = async () => {
      if (bootstrapStatus !== 'idle') {
        return;
      }

      startBootstrap();
      const refreshToken = typeof window !== 'undefined' ? window.localStorage.getItem(config.authHintKey) : null;

      if (!refreshToken || accessToken) {
        finishBootstrap();
        return;
      }

      try {
        const session = await authService.refreshToken(refreshToken);
        if (active) {
          setSession(session);
        }
      } catch {
        if (active) {
          clearSession();
        }
      } finally {
        if (active) {
          finishBootstrap();
        }
      }
    };

    void bootstrap();

    return () => {
      active = false;
    };
  }, [accessToken, bootstrapStatus, clearSession, finishBootstrap, setSession, startBootstrap]);

  if (bootstrapStatus === 'loading') {
    return <LoadingOverlay label="Restoring your customer session…" />;
  }

  return <>{children}</>;
};
