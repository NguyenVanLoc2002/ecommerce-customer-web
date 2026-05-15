const IDENTITY_KEY_PREFIX_MAX_LENGTH = 60;

export const createIdempotencyKey = (prefix?: string) => {
  const uuid =
    typeof globalThis.crypto !== 'undefined' && typeof globalThis.crypto.randomUUID === 'function'
      ? globalThis.crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  const normalizedPrefix = prefix?.trim().replace(/\s+/g, '-').slice(0, IDENTITY_KEY_PREFIX_MAX_LENGTH);

  return normalizedPrefix ? `${normalizedPrefix}-${uuid}` : uuid;
};
