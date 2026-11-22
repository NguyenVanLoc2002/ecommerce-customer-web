export const isAuthenticationError = (error: unknown) => {
  if (!(error instanceof Error)) {
    return false;
  }

  const code = 'code' in error ? String((error as { code?: string }).code ?? '') : '';
  const status =
    'status' in error && typeof (error as { status?: unknown }).status === 'number'
      ? (error as { status: number }).status
      : undefined;

  return code === 'UNAUTHORIZED' || status === 401 || status === 403;
};
