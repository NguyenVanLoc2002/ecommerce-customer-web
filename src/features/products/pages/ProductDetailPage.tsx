import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

import { routePaths, routes } from '@/constants/routes';
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
import { JsonLd } from '@/shared/components/seo/JsonLd';
import { PageSEO } from '@/shared/components/seo/PageSEO';
import { useUiStore } from '@/shared/stores/uiStore';
import { createCanonicalUrl } from '@/shared/utils/seo';

export const ProductDetailPage = () => {
  const { slug = '' } = useParams();
  const addToast = useUiStore((state) => state.addToast);
  const productQuery = useProductDetail(slug);
  const relatedQuery = useRelatedProducts(slug);
  const product = productQuery.data;
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (!product) {
      return;
    }

    const firstVariant = product.variants[0];
    setSelectedColor(firstVariant.color);
    setSelectedSize(firstVariant.size);
  }, [product]);

  const colors = useMemo(() => Array.from(new Set(product?.variants.map((variant) => variant.color) ?? [])), [product]);
  const sizes = useMemo(
    () =>
      Array.from(
        new Set(
          product?.variants.filter((variant) => variant.color === selectedColor).map((variant) => variant.size) ?? [],
        ),
      ),
    [product, selectedColor],
  );

  useEffect(() => {
    if (!sizes.includes(selectedSize) && sizes[0]) {
      setSelectedSize(sizes[0]);
    }
  }, [selectedSize, sizes]);

  const currentVariant =
    product?.variants.find((variant) => variant.color === selectedColor && variant.size === selectedSize) ??
    product?.variants[0];
  const colorSwatches = useMemo(
    () =>
      Object.fromEntries(
        product?.variants.map((variant) => [variant.color, variant.swatch]) ?? [],
      ) as Record<string, string>,
    [product],
  );

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

  if (!product || !currentVariant) {
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
              description="This item is missing from the current catalog seed."
              title="Product not found"
            />
          </Container>
        </PageWrapper>
      </>
    );
  }

  const addToCart = () => {
    addToast({
      tone: 'success',
      title: 'Add-to-cart simulated',
      description: `${product.name} / ${selectedColor} / ${selectedSize} / Qty ${quantity}. Cart arrives in Phase 5.`,
    });
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
              priceCurrency: 'USD',
              price: currentVariant.price,
              availability: currentVariant.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
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
              <ProductMediaGallery media={product.media} productName={product.name} />
            </div>
            <div className="lg:col-span-4">
              <PurchaseBlock
                colorSwatches={colorSwatches}
                colors={colors}
                compareAtPrice={currentVariant.compareAtPrice}
                currentPrice={currentVariant.price}
                onAddToCart={addToCart}
                onQuantityChange={setQuantity}
                onSelectColor={setSelectedColor}
                onSelectSize={setSelectedSize}
                product={product}
                quantity={quantity}
                selectedColor={selectedColor}
                selectedSize={selectedSize}
                sizes={sizes}
              />
            </div>
          </div>

          <section className="border-y border-border py-16">
            <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
              <div className="space-y-10">
                <h2 className="font-display text-[3rem] leading-[1.05] text-text-primary md:text-[4rem]">The Architecture of Silhouette</h2>
                <div className="max-w-xl space-y-6">
                  <p className="text-lg italic leading-8 text-text-secondary">&quot;{product.story}&quot;</p>
                  <p className="text-sm leading-7 text-text-secondary">
                    Our design notes focus on structure, proportion, and movement. Every seam is placed to balance precision with softness across the silhouette.
                  </p>
                  <button className="border-b border-text-primary pb-1 text-[11px] font-bold uppercase tracking-[0.18em] text-text-primary" type="button">
                    Read the Editorial
                  </button>
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
        <StickyCartBar compareAtPrice={currentVariant.compareAtPrice} onAddToCart={addToCart} price={currentVariant.price} />
      </PageWrapper>
    </>
  );
};

export default ProductDetailPage;
