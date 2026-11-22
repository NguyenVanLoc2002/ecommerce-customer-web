import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { routePaths, routes } from '@/constants/routes';
import { useAddCartItem } from '@/features/cart/hooks/useCart';
import { useProductDetail, useRelatedProducts } from '@/features/products/hooks/useProductDiscovery';
import { getVariantAttributeGroups, resolveVariantSelection } from '@/features/products/utils/variantSelection';
import { ProductMediaGallery } from '@/shared/components/catalog/ProductMediaGallery';
import { PurchaseBlock } from '@/shared/components/catalog/PurchaseBlock';
import { RelatedProducts } from '@/shared/components/catalog/RelatedProducts';
import { ReviewSection } from '@/shared/components/catalog/ReviewSection';
import { StickyCartBar } from '@/shared/components/catalog/StickyCartBar';
import { ProductStorySection } from '@/features/products/components/ProductStorySection';
import { Button } from '@/shared/components/ui/Button';
import { EmptyState } from '@/shared/components/feedback/EmptyState';
import { ErrorCard } from '@/shared/components/feedback/ErrorCard';
import { SkeletonDetail } from '@/shared/components/feedback/SkeletonDetail';
import { BreadcrumbNav } from '@/shared/components/layout/BreadcrumbNav';
import { Container } from '@/shared/components/layout/Container';
import { PageWrapper } from '@/shared/components/layout/PageWrapper';
import { isAuthenticationError } from '@/shared/lib/authErrors';
import { JsonLd } from '@/shared/components/seo/JsonLd';
import { PageSEO } from '@/shared/components/seo/PageSEO';
import { useAuthStore } from '@/shared/stores/authStore';
import { useUiStore } from '@/shared/stores/uiStore';
import { createCanonicalUrl } from '@/shared/utils/seo';

const isStockFailure = (error: unknown) => {
  if (!error || typeof error !== 'object' || !('code' in error)) {
    return false;
  }

  return ['INVENTORY_NOT_ENOUGH', 'VARIANT_OUT_OF_STOCK', 'STOCK_RESERVATION_FAILED'].includes(String(error.code));
};

const productCategoryLabels: Record<string, string> = {
  womenswear: 'Nữ',
  menswear: 'Nam',
  accessories: 'Phụ kiện',
};

const getProductCategoryLabel = (categorySlug?: string) => categorySlug ? productCategoryLabels[categorySlug] ?? 'Sản phẩm' : 'Sản phẩm';

export const ProductDetailPage = () => {
  const { slug = '' } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const addToast = useUiStore((state) => state.addToast);
  const accessToken = useAuthStore((state) => state.accessToken);
  const user = useAuthStore((state) => state.user);
  const addCartItem = useAddCartItem();
  const isSubmittingRef = useRef(false);
  const purchaseActionRef = useRef<HTMLDivElement>(null);
  const productQuery = useProductDetail(slug);
  const relatedQuery = useRelatedProducts(slug);
  const product = productQuery.data;
  const [selectedValues, setSelectedValues] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);
  const [addError, setAddError] = useState('');
  const variantGroups = useMemo(() => getVariantAttributeGroups(product?.variants ?? []), [product?.variants]);
  const selection = resolveVariantSelection(product?.variants ?? [], variantGroups, selectedValues);
  const selectedVariant = selection.variant;
  const activeVariantPrices = (product?.variants ?? [])
    .filter((variant) => variant.status?.toUpperCase() === 'ACTIVE' && Number.isFinite(variant.price) && variant.price > 0)
    .map((variant) => variant.price);
  const currentPrice = selectedVariant?.price ?? (activeVariantPrices.length > 0 ? Math.min(...activeVariantPrices) : undefined);
  const currentCompareAtPrice = selection.status === 'active' ? selection.variant.compareAtPrice : undefined;
  const variantSummary = variantGroups
    .map((group) => group.values.find((value) => value.valueId === selectedValues[group.attributeId])?.label)
    .filter((value): value is string => Boolean(value))
    .join(' · ');
  const requiresLogin = !user || !accessToken;
  const canAddToCart = selection.status === 'active';
  const addToCartDisabled = addCartItem.isPending || !canAddToCart;
  const addToCartLabel = addCartItem.isPending
    ? 'Đang thêm vào giỏ…'
    : canAddToCart
      ? requiresLogin ? 'Đăng nhập để thêm vào giỏ' : 'Thêm vào giỏ hàng'
      : selection.status === 'inactive'
        ? 'Phiên bản tạm ngừng bán'
        : selection.status === 'unavailable'
          ? 'Tổ hợp chưa có'
          : 'Chọn phân loại';

  useEffect(() => {
    setSelectedValues({});
    setAddError('');
  }, [product?.id]);

  if (productQuery.isLoading) {
    return (
      <>
        <PageSEO description="Chi tiết sản phẩm, hình ảnh và các phân loại hiện có." path={routePaths.productDetail(slug || 'product')} title="Đang tải sản phẩm" />
        <PageWrapper>
          <Container>
            <h1 className="sr-only">Đang tải sản phẩm</h1>
            <SkeletonDetail />
          </Container>
        </PageWrapper>
      </>
    );
  }

  if (productQuery.isError) {
    return (
      <>
        <PageSEO description="Chi tiết sản phẩm hiện chưa thể tải." noIndex path={routePaths.productDetail(slug || 'product')} title="Sản phẩm tạm thời không khả dụng" />
        <PageWrapper>
          <Container className="space-y-6">
            <h1 className="sr-only">Sản phẩm tạm thời không khả dụng</h1>
            <BreadcrumbNav items={[{ label: 'Trang chủ', href: routes.home }, { label: 'Sản phẩm', href: routes.products }]} />
            <ErrorCard
              action={<Button onClick={() => void productQuery.refetch()}>Thử tải lại</Button>}
              description="Không thể tải thông tin từ danh mục lúc này. Vui lòng thử lại."
              title="Sản phẩm tạm thời không khả dụng"
            />
          </Container>
        </PageWrapper>
      </>
    );
  }

  if (!product) {
    return (
      <>
        <PageSEO description="Sản phẩm không có trong danh mục hiện tại." noIndex path={routePaths.productDetail(slug || 'product')} title="Không tìm thấy sản phẩm" />
        <PageWrapper>
          <Container className="space-y-6">
            <BreadcrumbNav items={[{ label: 'Trang chủ', href: routes.home }, { label: 'Sản phẩm', href: routes.products }]} />
            <h1 className="text-2xl font-semibold">Không tìm thấy sản phẩm</h1>
            <EmptyState
              action={<Button onClick={() => navigate(routes.products)}>Khám phá sản phẩm</Button>}
              description="Sản phẩm này không có trong danh mục hiện tại."
              title="Không tìm thấy sản phẩm"
            />
          </Container>
        </PageWrapper>
      </>
    );
  }

  const addToCart = () => {
    if (isSubmittingRef.current || selection.status !== 'active') {
      return;
    }

    if (requiresLogin) {
      navigate(routePaths.loginRedirect(location.pathname + location.search));
      return;
    }

    isSubmittingRef.current = true;
    setAddError('');
    addCartItem.mutate(
      { variantId: selection.variant.id, quantity },
      {
        onSuccess: () => {
          isSubmittingRef.current = false;
          addToast({
            tone: 'success',
            title: 'Đã thêm vào giỏ hàng',
            description: `${product.name} · ${selection.variant.sku || 'Phiên bản đã chọn'} · SL ${quantity}`,
          });
        },
        onError: (error) => {
          isSubmittingRef.current = false;
          if (isAuthenticationError(error)) {
            addToast({ tone: 'info', title: 'Vui lòng đăng nhập', description: 'Đăng nhập để tiếp tục thêm sản phẩm vào giỏ.' });
            navigate(routePaths.loginRedirect(location.pathname + location.search));
            return;
          }

          const message = isStockFailure(error)
            ? 'Tồn kho vừa thay đổi. Hãy giảm số lượng hoặc thử lại.'
            : error instanceof Error ? error.message : 'Không thể thêm sản phẩm lúc này. Vui lòng thử lại.';
          setAddError(message);
          addToast({ tone: 'danger', title: 'Không thể thêm vào giỏ', description: message });
        },
      },
    );
  };

  const handleSelectValue = (attributeId: string, valueId: string) => {
    setSelectedValues((current) => ({ ...current, [attributeId]: valueId }));
    setAddError('');
  };

  const handleQuantityChange = (value: number) => {
    setQuantity(value);
    setAddError('');
  };

  return (
    <>
      <PageSEO
        description={product.subtitle || product.description}
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
              price: selection.status === 'active' ? selection.variant.price : activeVariantPrices.length > 0 ? Math.min(...activeVariantPrices) : undefined,
            },
          },
          {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Trang chủ', item: createCanonicalUrl(routes.home) },
              { '@type': 'ListItem', position: 2, name: 'Sản phẩm', item: createCanonicalUrl(routes.products) },
              { '@type': 'ListItem', position: 3, name: product.name, item: createCanonicalUrl(routePaths.productDetail(product.slug)) },
            ],
          },
        ]}
      />
      <PageWrapper className="pt-24 pb-40 md:pt-20 md:pb-24 lg:pb-0">
        <Container className="space-y-5 md:space-y-6">
          <BreadcrumbNav items={[{ label: 'Trang chủ', href: routes.home }, { label: getProductCategoryLabel(product.categorySlugs[0]), href: routes.products }, { label: product.name }]} />

          <div className="grid gap-8 lg:grid-cols-12 lg:gap-12">
            <div className="max-lg:-mx-page max-lg:w-[calc(100%+2*var(--space-page))] lg:col-span-7">
              <ProductMediaGallery media={product.media} productName={product.name} selectedVariantId={selectedVariant?.id} />
            </div>
            <div className="lg:col-span-5">
              <PurchaseBlock
                addError={addError}
                addToCartDisabled={addToCartDisabled}
                addToCartLabel={addToCartLabel}
                addToCartLoading={addCartItem.isPending}
                purchaseActionRef={purchaseActionRef}
                compareAtPrice={currentCompareAtPrice}
                currentPrice={currentPrice}
                groups={variantGroups}
                onAddToCart={addToCart}
                onQuantityChange={handleQuantityChange}
                onSelectValue={handleSelectValue}
                product={product}
                quantity={quantity}
                selectedValues={selectedValues}
                selection={selection}
              />
            </div>
          </div>

        </Container>
        {product.story && product.story !== product.description ? <ProductStorySection description={product.description} images={product.media} story={product.story} /> : null}
        <Container className="space-y-14 md:space-y-20 pt-14 md:pt-20">
          {relatedQuery.data && relatedQuery.data.length > 0 ? <RelatedProducts categorySlug={product.categorySlugs[0]} products={relatedQuery.data} /> : null}
          <ReviewSection productId={product.id} />
        </Container>
        <StickyCartBar
          compareAtPrice={currentCompareAtPrice}
          disabled={addToCartDisabled}
          label={requiresLogin && canAddToCart ? 'Đăng nhập để mua' : addToCartLabel}
          loading={addCartItem.isPending}
          onAddToCart={addToCart}
          price={currentPrice}
          variantSummary={variantSummary}
        />
      </PageWrapper>
    </>
  );
};

export default ProductDetailPage;
