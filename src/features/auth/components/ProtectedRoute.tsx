import type { PropsWithChildren } from 'react';

import { Navigate, useLocation } from 'react-router-dom';

import { routes } from '@/constants/routes';
import { LoadingOverlay } from '@/shared/components/feedback/LoadingOverlay';
import { useAuthStore } from '@/shared/stores/authStore';
import { USER_ROLES } from '@/shared/types/enums';

export const ProtectedRoute = ({ children }: PropsWithChildren) => {
  const accessToken = useAuthStore((state) => state.accessToken);
  const bootstrapStatus = useAuthStore((state) => state.bootstrapStatus);
  const clearSession = useAuthStore((state) => state.clearSession);
  const user = useAuthStore((state) => state.user);
  const location = useLocation();

  if (bootstrapStatus !== 'ready') {
    return <LoadingOverlay label="Checking access…" />;
  }

  if (!user || !accessToken) {
    return <Navigate replace to={`${routes.login}?redirect=${encodeURIComponent(location.pathname + location.search)}`} />;
  }

  if (user.role !== USER_ROLES.CUSTOMER) {
    clearSession();
    return <Navigate replace to={routes.login} />;
  }

  return <>{children}</>;
};

