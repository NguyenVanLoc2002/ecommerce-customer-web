import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

import { routes } from '@/constants/routes';
import { Container } from '@/shared/components/layout/Container';
import { PageSEO } from '@/shared/components/seo/PageSEO';

type PaymentPageLayoutProps = {
  path: string;
  title: string;
  description?: string;
  orderCode?: string;
  children: ReactNode;
  headingInContent?: boolean;
  compactMobileHeading?: boolean;
  breadcrumbTitle?: string;
};

export const PaymentPageLayout = ({ path, title, description, orderCode, children, headingInContent, compactMobileHeading, breadcrumbTitle }: PaymentPageLayoutProps) => (
  <>
    <PageSEO description={description ?? title} noIndex path={path} title={title} />
    <Container className="pb-20 pt-20 md:pb-24 md:pt-[112px]">
      <nav aria-label="Đường dẫn" className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-5 text-xs font-medium uppercase tracking-wide text-text-secondary md:pb-6">
        <ol className="flex flex-wrap items-center gap-2">
          <li><Link className="hover:underline" to={routes.home}>Trang chủ</Link></li>
          <li aria-hidden="true">/</li>
          <li>Thanh toán</li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="font-semibold text-text-primary">{breadcrumbTitle ?? title}</li>
        </ol>
        {orderCode ? <span className="break-all rounded bg-surface-muted px-3 py-2">Mã đơn <strong>{orderCode}</strong></span> : null}
      </nav>
      {!headingInContent ? (
        <header className={compactMobileHeading ? 'mb-4 mt-5 md:mb-10 md:mt-12' : 'mb-6 mt-8 md:mb-10 md:mt-12'}>
          <h1 className={`${compactMobileHeading ? 'text-base' : 'text-2xl'} font-semibold leading-tight text-text-primary md:text-3xl lg:text-[2rem]`}>{title}</h1>
          {description ? <p className="mt-4 max-w-3xl text-sm leading-relaxed text-text-secondary md:text-base">{description}</p> : null}
        </header>
      ) : null}
      <div className={headingInContent ? 'mt-8 space-y-5 md:mt-14' : 'space-y-5'}>{children}</div>
    </Container>
  </>
);
