import { config } from '@/constants/config';

export const createCanonicalUrl = (path: string) =>
  new URL(path, config.siteUrl).toString();

export const createPageTitle = (title?: string) =>
  title ? `${title} | Fashion Shop` : 'Fashion Shop';

export const createOgImage = (path = '/og-image.svg') =>
  new URL(path, config.siteUrl).toString();
