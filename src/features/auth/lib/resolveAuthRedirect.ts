import { routes } from '@/constants/routes';

const authRoutes: ReadonlySet<string> = new Set([routes.login, routes.register]);

export const resolveAuthRedirect = (value: string | null) => {
  if (!value || !value.startsWith('/')) {
    return routes.profile;
  }

  const [pathname] = value.split('?');
  return authRoutes.has(pathname) ? routes.profile : value;
};

export const withRedirectParam = (path: string, redirect: string | null) =>
  redirect && redirect.startsWith('/') ? `${path}?redirect=${encodeURIComponent(redirect)}` : path;
