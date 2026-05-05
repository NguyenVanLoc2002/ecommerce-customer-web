import type { ServiceError } from './serviceError';

const notFoundCodes = new Set(['NOT_FOUND', 'PRODUCT_NOT_FOUND', 'PRODUCT_INACTIVE']);

export const isProductMissingError = (error: unknown) => {
  const errorCode = error instanceof Error && 'code' in error ? String((error as ServiceError).code) : '';
  return notFoundCodes.has(errorCode);
};
