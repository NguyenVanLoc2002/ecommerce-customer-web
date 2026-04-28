import { Link } from 'react-router-dom';

import { routes } from '@/constants/routes';
import { PageSEO } from '@/shared/components/seo/PageSEO';
import { buttonStyles } from '@/shared/components/ui/buttonStyles';

export const NotFoundPage = () => (
  <>
    <PageSEO description="The requested page could not be found." noIndex path={routes.notFound} title="Page not found" />
    <main className="auth-shell-bg relative flex min-h-screen items-center justify-center overflow-hidden px-page py-16">
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <span className="auth-hero-wordmark font-display text-[20vw] leading-none">404</span>
      </div>
      <div className="relative z-10 w-full max-w-2xl border border-border bg-surface px-8 py-10 text-center md:px-12 md:py-14">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-outline">404</p>
        <h1 className="mt-4 font-display text-[3rem] leading-none text-text-primary md:text-[4rem]">Out of Frame.</h1>
        <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-text-secondary">
          The page you requested is not part of the current editorial storefront path.
        </p>
        <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Link className={buttonStyles({ size: 'lg' })} to={routes.home}>
            Return Home
          </Link>
          <Link className={buttonStyles({ size: 'lg', variant: 'secondary' })} to={routes.products}>
            Browse Collection
          </Link>
        </div>
      </div>
    </main>
  </>
);

export default NotFoundPage;
