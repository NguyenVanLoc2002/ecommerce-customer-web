import { config } from '@/constants/config';
import { routes } from '@/constants/routes';
import { Button } from '@/shared/components/ui/Button';
import { ErrorCard } from '@/shared/components/feedback/ErrorCard';
import { SkeletonCard } from '@/shared/components/feedback/SkeletonCard';
import { Container } from '@/shared/components/layout/Container';
import { PageWrapper } from '@/shared/components/layout/PageWrapper';
import { JsonLd } from '@/shared/components/seo/JsonLd';
import { PageSEO } from '@/shared/components/seo/PageSEO';
import { CategoryGrid } from '@/features/home/components/CategoryGrid';
import { HeroSection } from '@/features/home/components/HeroSection';
import { NewsletterSection } from '@/features/home/components/NewsletterSection';
import { NewArrivals } from '@/features/home/components/NewArrivals';
import { PromoBanner } from '@/features/home/components/PromoBanner';
import { useFeaturedProducts, useHomeCategories, useNewArrivals } from '@/features/home/hooks/useHomeData';

export const HomePage = () => {
  const categoriesQuery = useHomeCategories();
  const featuredQuery = useFeaturedProducts();
  const arrivalsQuery = useNewArrivals();

  const hasError = categoriesQuery.isError || featuredQuery.isError || arrivalsQuery.isError;

  return (
    <>
      <PageSEO
        description="Discover premium fashion with an editorial homepage, curated product stories, and real product discovery."
        path={routes.home}
        title="Home"
      />
      <JsonLd
        data={[
          {
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: 'Fashion Shop',
            url: config.siteUrl,
          },
          {
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'Fashion Shop',
            url: config.siteUrl,
          },
        ]}
      />
      <PageWrapper className="space-y-0 pt-0 pb-0">
        <HeroSection />
        {hasError ? (
          <Container className="py-section">
            <ErrorCard
              action={
                <Button onClick={() => {
                  void categoriesQuery.refetch();
                  void featuredQuery.refetch();
                  void arrivalsQuery.refetch();
                }}>
                  Try again
                </Button>
              }
              description="The homepage collections could not be assembled from the current catalog source."
              title="The homepage collection is temporarily unavailable"
            />
          </Container>
        ) : (
          <>
            {categoriesQuery.isLoading || featuredQuery.isLoading || arrivalsQuery.isLoading ? (
              <Container className="grid gap-6 py-section md:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <SkeletonCard key={index} />
                ))}
              </Container>
            ) : null}
            {categoriesQuery.data ? <CategoryGrid categories={categoriesQuery.data} /> : null}
            {featuredQuery.data ? <PromoBanner products={featuredQuery.data} /> : null}
            {arrivalsQuery.data ? <NewArrivals products={arrivalsQuery.data} /> : null}
            <NewsletterSection />
          </>
        )}
      </PageWrapper>
    </>
  );
};

export default HomePage;
