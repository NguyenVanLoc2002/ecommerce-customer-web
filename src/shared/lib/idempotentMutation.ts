import type { ServiceError } from '@/shared/lib/serviceError';

const REUSE_BLOCKED_ERROR_CODES = new Set([
  'IDEMPOTENCY_KEY_REQUIRED',
  'IDEMPOTENCY_KEY_TOO_LONG',
  'IDEMPOTENCY_KEY_CONFLICT',
  'IDEMPOTENCY_REPLAY_NOT_AVAILABLE',
]);

export const getServiceErrorCode = (error: unknown) => {
  if (!(error instanceof Error) || !('code' in error)) {
    return null;
  }

  const code = (error as ServiceError).code;
  return typeof code === 'string' ? code : null;
};

export const getServiceErrorStatus = (error: unknown) => {
  if (!(error instanceof Error) || !('status' in error)) {
    return null;
  }

  const status = (error as ServiceError).status;
  return typeof status === 'number' ? status : null;
};

export const isUncertainMutationFailure = (error: unknown) => {
  const code = getServiceErrorCode(error);
  const status = getServiceErrorStatus(error);

  return code === 'REQUEST_FAILED' || code === 'INTERNAL_SERVER_ERROR' || (typeof status === 'number' && status >= 500);
};

export const isMutationProcessingError = (error: unknown) => getServiceErrorCode(error) === 'IDEMPOTENCY_REQUEST_IN_PROGRESS';

export const isPaymentAlreadyProcessedError = (error: unknown) => getServiceErrorCode(error) === 'PAYMENT_ALREADY_PROCESSED';

export const shouldReuseIdempotencyKey = (error: unknown) => {
  const code = getServiceErrorCode(error);
  return !code || !REUSE_BLOCKED_ERROR_CODES.has(code);
};
