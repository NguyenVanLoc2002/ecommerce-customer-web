import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { routePaths, routes } from '@/constants/routes';
import { useAddCartItem } from '@/features/cart/hooks/useCart';
import { useProductDetail, useRelatedProducts } from '@/features/products/hooks/useProductDiscovery';
import { ProductMediaGallery } from '@/shared/components/catalog/ProductMediaGallery';
import { PurchaseBlock } from '@/shared/components/catalog/PurchaseBlock';
import { RelatedProducts } from '@/shared/components/catalog/RelatedProducts';
import { ReviewSection } from '@/shared/components/catalog/ReviewSection';
import { StickyCartBar } from '@/shared/components/catalog/StickyCartBar';
import { Button } from '@/shared/components/ui/Button';
import { EmptyState } from '@/shared/components/feedback/EmptyState';
import { ErrorCard } from '@/shared/components/feedback/ErrorCard';
import { SkeletonDetail } from '@/shared/components/feedback/SkeletonDetail';
import { Container } from '@/shared/components/layout/Container';
import { PageWrapper } from '@/shared/components/layout/PageWrapper';
import { isAuthenticationError } from '@/shared/lib/authErrors';
import { JsonLd } from '@/shared/components/seo/JsonLd';
import { PageSEO } from '@/shared/components/seo/PageSEO';
import { useAuthStore } from '@/shared/stores/authStore';
import { useUiStore } from '@/shared/stores/uiStore';
import { createCanonicalUrl } from '@/shared/utils/seo';

export const ProductDetailPage = () => {
  const { slug = '' } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const addToast = useUiStore((state) => state.addToast);
  const accessToken = useAuthStore((state) => state.accessToken);
  const addCartItem = useAddCartItem();
  const productQuery = useProductDetail(slug);
  const relatedQuery = useRelatedProducts(slug);
  const user = useAuthStore((state) => state.user);
  const product = productQuery.data;
  const [selectedVariantId, setSelectedVariantId] = useState('');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (!product) {
      return;
    }

    const firstVariant = product.variants.find((variant) => variant.status?.toUpperCase() !== 'INACTIVE') ?? product.variants[0];
    if (!firstVariant) {
      setSelectedVariantId('');
      return;
    }

    setSelectedVariantId(firstVariant.id);
  }, [product]);
  const currentVariant = product?.variants.find((variant) => variant.id === selectedVariantId);
  const requiresLogin = !user || !accessToken;
  const addToCartDisabled = addCartItem.isPending || !currentVariant || currentVariant.status?.toUpperCase() === 'INACTIVE';
  const addToCartLabel = currentVariant
    ? requiresLogin
      ? 'Đăng nhập để thêm vào giỏ'
      : addCartItem.isPending
        ? 'Đang thêm…'
        : 'Thêm vào giỏ hàng'
    : 'Chọn phiên bản';

  if (productQuery.isLoading) {
    return (
      <>
        <PageSEO description="Browse the full product detail with media, pricing, and editorial notes." path={routePaths.productDetail(slug || 'product')} title="Product Detail" />
        <PageWrapper>
          <Container>
            <SkeletonDetail />
          </Container>
        </PageWrapper>
      </>
    );
  }

  if (productQuery.isError) {
    return (
      <>
        <PageSEO description="Browse the full product detail with media, pricing, and editorial notes." noIndex path={routePaths.productDetail(slug || 'product')} title="Product Detail" />
        <PageWrapper>
          <Container>
            <ErrorCard
              action={<Button onClick={() => void productQuery.refetch()}>Retry</Button>}
              description="The product detail did not load from the current catalog source."
              title="This product is temporarily unavailable"
            />
          </Container>
        </PageWrapper>
      </>
    );
  }

  if (!product) {
    return (
      <>
        <PageSEO description="Browse the full product detail with media, pricing, and editorial notes." noIndex path={routePaths.productDetail(slug || 'product')} title="Product not found" />
        <PageWrapper>
          <Container>
            <EmptyState
              action={
                <button
                  className="border-b border-text-primary pb-1 text-[11px] font-bold uppercase tracking-[0.18em] text-text-primary"
                  onClick={() => window.history.back()}
                  type="button"
                >
                  Go Back
                </button>
              }
              description="This item is not available in the current catalog."
              title="Product not found"
            />
          </Container>
        </PageWrapper>
      </>
    );
  }

  const addToCart = () => {
    if (!currentVariant) {
      return;
    }

    if (requiresLogin) {
      navigate(routePaths.loginRedirect(location.pathname + location.search));
      return;
    }

    addCartItem.mutate(
      {
        variantId: currentVariant.id,
        quantity,
      },
      {
        onSuccess: () => {
          addToast({
            tone: 'success',
              title: 'Đã thêm vào giỏ',
                    description: `${product.name} · ${currentVariant.sku} · SL ${quantity} đã được thêm vào giỏ hàng.`,
          });
        },
        onError: (error) => {
          const message = error instanceof Error ? error.message : 'Please try again.';

          if (isAuthenticationError(error)) {
            addToast({
              tone: 'info',
              title: 'Please sign in to continue',
              description: 'Sign in to add this item to your bag.',
            });
            navigate(routePaths.loginRedirect(location.pathname + location.search));
            return;
          }

          addToast({
            tone: 'danger',
            title: 'Không thể thêm vào giỏ',
            description: message,
          });
        },
      },
    );
  };

  return (
    <>
      <PageSEO
        description={product.subtitle}
        image={product.primaryImage.src}
        path={routePaths.productDetail(product.slug)}
        title={product.name}
      />
      <JsonLd
        data={[
          {
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: product.name,
            image: product.media.map((image) => image.src),
            description: product.description,
            brand: product.brandName,
            offers: {
              '@type': 'Offer',
              priceCurrency: 'VND',
              price: currentVariant?.price ?? product.price,
            },
          },
          {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: createCanonicalUrl(routes.home) },
              { '@type': 'ListItem', position: 2, name: 'Products', item: createCanonicalUrl(routes.products) },
              {
                '@type': 'ListItem',
                position: 3,
                name: product.name,
                item: createCanonicalUrl(routePaths.productDetail(product.slug)),
              },
            ],
          },
        ]}
      />
      <PageWrapper className="pb-0">
        <Container className="space-y-20">
          <div className="grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <ProductMediaGallery media={product.media} productName={product.name} selectedVariantId={currentVariant?.id} />
            </div>
            <div className="lg:col-span-4">
              <PurchaseBlock
                addToCartDisabled={addToCartDisabled}
                addToCartLabel={addToCartLabel}
                selectedVariantId={selectedVariantId}
                compareAtPrice={currentVariant?.compareAtPrice ?? product.compareAtPrice}
                currentPrice={currentVariant?.price ?? product.price}
                onAddToCart={addToCart}
                onQuantityChange={setQuantity}
                onSelectVariant={setSelectedVariantId}
                product={product}
                quantity={quantity}
              />
            </div>
          </div>

          <section className="border-y border-border py-16">
            <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
              <div className="space-y-10">
            <h2 className="text-2xl font-semibold leading-tight text-text-primary md:text-3xl">Câu chuyện thiết kế</h2>
                <div className="max-w-xl space-y-6">
                  <p className="text-lg italic leading-8 text-text-secondary">&quot;{product.story}&quot;</p>
                  {product.story !== product.description ? <p className="text-sm leading-7 text-text-secondary">{product.story}</p> : null}
                </div>
              </div>
              <div className="relative">
                <div className="overflow-hidden bg-surface-soft">
                  <img
                    alt={product.media[1]?.alt ?? product.primaryImage.alt}
                    className="aspect-square h-full w-full object-cover"
                    height={product.media[1]?.height ?? product.primaryImage.height}
                    loading="lazy"
                    src={product.media[1]?.src ?? product.primaryImage.src}
                    width={product.media[1]?.width ?? product.primaryImage.width}
                  />
                </div>
                {product.media[2] ? (
                  <div className="absolute -bottom-10 -left-10 hidden h-64 w-48 overflow-hidden border border-border bg-surface md:block">
                    <img
                      alt={product.media[2].alt}
                      className="h-full w-full object-cover"
                      height={product.media[2].height}
                      loading="lazy"
                      src={product.media[2].src}
                      width={product.media[2].width}
                    />
                  </div>
                ) : null}
              </div>
            </div>
          </section>

          {relatedQuery.data && relatedQuery.data.length > 0 ? <RelatedProducts products={relatedQuery.data} /> : null}
          <ReviewSection productId={product.id} />
        </Container>
        <StickyCartBar
          compareAtPrice={currentVariant?.compareAtPrice ?? product.compareAtPrice}
          disabled={addToCartDisabled}
          label={addToCartLabel}
          onAddToCart={addToCart}
          price={currentVariant?.price ?? product.price}
        />
      </PageWrapper>
    </>
  );
};

export default ProductDetailPage;
