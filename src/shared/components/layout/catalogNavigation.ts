import { routes } from '@/constants/routes';

const categories = [
  { label: 'Nữ', slug: 'womenswear' },
  { label: 'Nam', slug: 'menswear' },
  { label: 'Phụ kiện', slug: 'accessories' },
];

export const catalogNavigation = categories.map((category) => ({
  ...category,
  to: `${routes.products}?category=${category.slug}`,
}));
