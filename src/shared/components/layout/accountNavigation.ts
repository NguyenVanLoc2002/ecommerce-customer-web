import { matchPath } from 'react-router-dom';

import { routes } from '@/constants/routes';

export type AccountNavKey = 'profile' | 'security' | 'orders' | 'addresses' | 'reviews' | 'notifications';

export type AccountNavItem = {
  key: AccountNavKey;
  label: string;
  to: string;
  matchers: Array<{
    path: string;
    end?: boolean;
  }>;
};

const accountNavItems: AccountNavItem[] = [
  {
    key: 'profile',
    label: 'Profile',
    to: routes.profile,
    matchers: [{ path: routes.profile }],
  },
  {
    key: 'security',
    label: 'Security',
    to: routes.profileSecurity,
    matchers: [{ path: routes.profileSecurity }],
  },
  {
    key: 'orders',
    label: 'Order History',
    to: routes.orders,
    matchers: [{ path: routes.orders, end: false }],
  },
  {
    key: 'addresses',
    label: 'Address Book',
    to: routes.profileAddresses,
    matchers: [{ path: routes.profileAddresses, end: false }],
  },
  {
    key: 'reviews',
    label: 'My Reviews',
    to: routes.profileReviews,
    matchers: [{ path: routes.profileReviews }],
  },
  {
    key: 'notifications',
    label: 'Notifications',
    to: routes.notifications,
    matchers: [{ path: routes.notifications }],
  },
];

export const getAccountNavItems = ({ includeNotifications = true }: { includeNotifications?: boolean } = {}) =>
  includeNotifications ? accountNavItems : accountNavItems.filter((item) => item.key !== 'notifications');

export const isAccountNavItemActive = (pathname: string, item: AccountNavItem) =>
  item.matchers.some(({ end = true, path }) => Boolean(matchPath({ path, end }, pathname)));
