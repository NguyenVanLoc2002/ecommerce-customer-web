import type { PropsWithChildren } from 'react';
import { useEffect, useRef } from 'react';

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
  const bootstrapStartedRef = useRef(false);

  useEffect(() => {
    if (bootstrapStartedRef.current || bootstrapStatus !== 'idle') {
      return;
    }

    bootstrapStartedRef.current = true;
    const refreshToken = typeof window !== 'undefined' ? window.localStorage.getItem(config.authHintKey) : null;

    if (!refreshToken || accessToken) {
      finishBootstrap();
      return;
    }

    startBootstrap();

    const bootstrap = async () => {
      try {
        const session = await authService.refreshToken(refreshToken);
        setSession(session);
      } catch {
        clearSession();
      } finally {
        finishBootstrap();
      }
    };

    void bootstrap();
  }, [accessToken, bootstrapStatus, clearSession, finishBootstrap, setSession, startBootstrap]);

  if (bootstrapStatus === 'loading') {
    return <LoadingOverlay label="Restoring your customer session…" />;
  }

  return <>{children}</>;
};
