import { config } from '@/constants/config';
import { routes } from '@/constants/routes';
import { CategoryGrid } from '@/features/home/components/CategoryGrid';
import { FeaturedProducts } from '@/features/home/components/FeaturedProducts';
import { HeroSection } from '@/features/home/components/HeroSection';
import { NewArrivals } from '@/features/home/components/NewArrivals';
import { useFeaturedProducts, useHomeCategories, useNewArrivals } from '@/features/home/hooks/useHomeData';
import { ErrorCard } from '@/shared/components/feedback/ErrorCard';
import { EmptyState } from '@/shared/components/feedback/EmptyState';
import { SkeletonCard } from '@/shared/components/feedback/SkeletonCard';
import { Container } from '@/shared/components/layout/Container';
import { PageWrapper } from '@/shared/components/layout/PageWrapper';
import { JsonLd } from '@/shared/components/seo/JsonLd';
import { PageSEO } from '@/shared/components/seo/PageSEO';

export const HomePage = () => {
  const categoriesQuery = useHomeCategories();
  const featuredQuery = useFeaturedProducts();
  const arrivalsQuery = useNewArrivals();

  return (
    <>
      <PageSEO
        description="Khám phá thời trang và phụ kiện được tuyển chọn tại Fashion Shop."
        path={routes.home}
        title="Khám phá"
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
      <PageWrapper className="space-y-0 pb-0 pt-0">
        <HeroSection />
        {categoriesQuery.isLoading ? (
          <Container className="grid grid-cols-1 gap-5 py-12 sm:grid-cols-3 md:py-section">
            {Array.from({ length: 3 }).map((_, index) => <SkeletonCard key={index} />)}
          </Container>
        ) : categoriesQuery.isError ? (
          <Container className="py-12 md:py-section">
            <ErrorCard
              action={<button className="underline underline-offset-4" onClick={() => void categoriesQuery.refetch()} type="button">Thử lại</button>}
              description="Danh mục chưa tải được. Vui lòng thử lại."
              title="Không thể tải danh mục"
            />
          </Container>
        ) : (
          <CategoryGrid categories={categoriesQuery.data ?? []} />
        )}

        {featuredQuery.isLoading ? (
          <Container className="grid grid-cols-2 gap-4 py-12 md:grid-cols-4 md:py-section">
            {Array.from({ length: 4 }).map((_, index) => <SkeletonCard key={index} />)}
          </Container>
        ) : featuredQuery.isError ? (
          <Container className="py-12 md:py-section">
            <ErrorCard
              action={<button className="underline underline-offset-4" onClick={() => void featuredQuery.refetch()} type="button">Thử lại</button>}
              description="Các sản phẩm nổi bật chưa tải được. Vui lòng thử lại."
              title="Không thể tải sản phẩm"
            />
          </Container>
        ) : featuredQuery.data?.length ? (
          <FeaturedProducts products={featuredQuery.data} />
        ) : (
          <Container className="py-12 md:py-section">
            <EmptyState description="Sản phẩm nổi bật sẽ xuất hiện tại đây khi catalog có dữ liệu." title="Chưa có sản phẩm nổi bật" />
          </Container>
        )}

        {arrivalsQuery.isLoading ? (
          <Container className="grid grid-cols-2 gap-4 py-12 md:grid-cols-4 md:py-section">
            {Array.from({ length: 4 }).map((_, index) => <SkeletonCard key={index} />)}
          </Container>
        ) : arrivalsQuery.isError ? (
          <Container className="py-12 md:py-section">
            <ErrorCard
              action={<button className="underline underline-offset-4" onClick={() => void arrivalsQuery.refetch()} type="button">Thử lại</button>}
              description="Sản phẩm mới chưa tải được. Vui lòng thử lại."
              title="Không thể tải sản phẩm mới"
            />
          </Container>
        ) : arrivalsQuery.data?.length ? (
          <NewArrivals products={arrivalsQuery.data} />
        ) : (
          <Container className="py-12 md:py-section">
            <EmptyState description="Sản phẩm mới sẽ xuất hiện tại đây khi catalog có dữ liệu." title="Chưa có sản phẩm mới" />
          </Container>
        )}
      </PageWrapper>
    </>
  );
};

export default HomePage;
