import { PlaceholderPage } from '@/shared/components/layout/PlaceholderPage';

type PlaceholderRoutePageProps = {
  title: string;
  description: string;
  path: string;
};

export const PlaceholderRoutePage = ({ description, path, title }: PlaceholderRoutePageProps) => (
  <PlaceholderPage description={description} path={path} title={title} />
);

export default PlaceholderRoutePage;

