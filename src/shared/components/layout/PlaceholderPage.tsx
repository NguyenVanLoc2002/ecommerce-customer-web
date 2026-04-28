import { Link } from 'react-router-dom';

import { routes } from '@/constants/routes';
import { Container } from '@/shared/components/layout/Container';
import { PageWrapper } from '@/shared/components/layout/PageWrapper';
import { PageSEO } from '@/shared/components/seo/PageSEO';
import { Badge } from '@/shared/components/ui/Badge';
import { buttonStyles } from '@/shared/components/ui/buttonStyles';

type PlaceholderPageProps = {
  title: string;
  description: string;
  path: string;
};

export const PlaceholderPage = ({ description, path, title }: PlaceholderPageProps) => (
  <>
    <PageSEO description={description} noIndex path={path} title={title} />
    <PageWrapper>
      <Container>
        <div className="rounded-feature bg-white p-8 shadow-card md:p-12">
          <Badge>Future Phase</Badge>
          <h1 className="mt-4 font-display text-4xl">{title}</h1>
          <p className="mt-4 max-w-2xl text-text-secondary">{description}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link className={buttonStyles({})} to={routes.products}>
              Browse products
            </Link>
            <Link className={buttonStyles({ variant: 'secondary' })} to={routes.home}>
              Back home
            </Link>
          </div>
        </div>
      </Container>
    </PageWrapper>
  </>
);
