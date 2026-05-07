export const csrfCookieName = 'XSRF-TOKEN';
export const csrfHeaderName = 'X-XSRF-TOKEN';

const readCookie = (name: string) => {
  if (typeof document === 'undefined') {
    return null;
  }

  const encodedName = encodeURIComponent(name);
  const cookie = document.cookie
    .split('; ')
    .find((item) => item.startsWith(`${encodedName}=`));

  if (!cookie) {
    return null;
  }

  const value = cookie.slice(encodedName.length + 1);
  return value ? decodeURIComponent(value) : null;
};

export const getCsrfHeaders = () => {
  const csrfToken = readCookie(csrfCookieName);

  return csrfToken
    ? {
        [csrfHeaderName]: csrfToken,
      }
    : undefined;
};
