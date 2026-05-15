import type { PropsWithChildren } from 'react';
import { useEffect, useRef } from 'react';

import { authService } from '@/features/auth/services/authService';
import { LoadingOverlay } from '@/shared/components/feedback/LoadingOverlay';
import { clearLegacyCustomerAuthStorage } from '@/shared/lib/authStorage';
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
    clearLegacyCustomerAuthStorage();

    if (accessToken) {
      finishBootstrap();
      return;
    }

    startBootstrap();

    const bootstrap = async () => {
      try {
        const session = await authService.refreshToken();
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
