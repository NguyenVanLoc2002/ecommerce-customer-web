import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/constants/queryKeys';
import { customerSessionService } from '@/features/auth/services/customerSessionService';
import type { ServiceError } from '@/shared/lib/serviceError';

export const useCustomerSessions = () => useQuery({
  queryKey: queryKeys.auth.sessions,
  queryFn: customerSessionService.list,
  retry: (count, error) => (error as ServiceError).status !== 404 && count < 1,
});

export const useRevokeCustomerSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: customerSessionService.revoke,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.auth.sessions }),
  });
};
