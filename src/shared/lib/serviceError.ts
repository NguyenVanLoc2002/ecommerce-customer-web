export type ServiceError = Error & {
  code: string;
  fieldErrors?: Record<string, string>;
  status?: number;
};

export const createServiceError = (
  code: string,
  message: string,
  fieldErrors?: Record<string, string>,
  status?: number,
): ServiceError => {
  const error = new Error(message) as ServiceError;
  error.code = code;
  error.fieldErrors = fieldErrors;
  error.status = status;
  return error;
};
