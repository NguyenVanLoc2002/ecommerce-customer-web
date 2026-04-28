import { Helmet } from 'react-helmet-async';

import { createCanonicalUrl, createOgImage, createPageTitle } from '@/shared/utils/seo';

type PageSEOProps = {
  title: string;
  description: string;
  path: string;
  noIndex?: boolean;
  image?: string;
};

export const PageSEO = ({ description, image, noIndex = false, path, title }: PageSEOProps) => {
  const canonical = createCanonicalUrl(path);
  const pageTitle = createPageTitle(title);
  const ogImage = image ?? createOgImage();

  return (
    <Helmet>
      <title>{pageTitle}</title>
      <meta content={description} name="description" />
      <link href={canonical} rel="canonical" />
      <meta content={pageTitle} property="og:title" />
      <meta content={description} property="og:description" />
      <meta content="website" property="og:type" />
      <meta content={canonical} property="og:url" />
      <meta content={ogImage} property="og:image" />
      {noIndex ? <meta content="noindex,nofollow" name="robots" /> : null}
    </Helmet>
  );
};

