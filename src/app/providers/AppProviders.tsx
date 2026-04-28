import type { PropsWithChildren } from 'react';

import { QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';

import { AuthProvider } from '@/features/auth/components/AuthProvider';
import { ToastContainer } from '@/shared/components/feedback/ToastContainer';
import { queryClient } from '@/shared/lib/queryClient';

export const AppProviders = ({ children }: PropsWithChildren) => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {children}
        <ToastContainer />
      </AuthProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

