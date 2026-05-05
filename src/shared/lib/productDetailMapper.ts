import type {
  ProductDetail,
  ProductDetailResponse,
  ProductImage,
  ProductMediaResponse,
  ProductVariant,
  ProductVariantResponse,
} from '../types/catalog.types';

const PLACEHOLDER_IMAGE = `data:image/svg+xml;utf8,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000"><rect width="800" height="1000" fill="#f3efe7"/><rect x="120" y="140" width="560" height="720" fill="#e4dbcf"/><text x="400" y="520" text-anchor="middle" font-family="Arial" font-size="42" fill="#6f6559">Fashion Shop</text></svg>',
)}`;

const FALLBACK_IMAGE_SIZE = {
  width: 800,
  height: 1000,
} as const;

const titleCaseToken = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());

const getFiniteNumber = (value: number | null | undefined) =>
  typeof value === 'number' && Number.isFinite(value) ? value : null;

const createProductImage = (src: string | null | undefined, alt: string): ProductImage => ({
  id: src ?? alt,
  src: src && src.length > 0 ? src : PLACEHOLDER_IMAGE,
  alt,
  width: FALLBACK_IMAGE_SIZE.width,
  height: FALLBACK_IMAGE_SIZE.height,
});

const getVariantAttributeValue = (variant: ProductVariantResponse, attributeCode: string) => {
  const attributes = variant.attributes ?? [];
  const normalizedCode = attributeCode.toUpperCase();

  for (const attribute of attributes) {
    const code = attribute.attributeCode?.trim().toUpperCase();
    const name = attribute.name?.trim().toUpperCase();

    if (code === normalizedCode || name === normalizedCode) {
      return attribute.displayValue?.trim() || attribute.value?.trim() || null;
    }
  }

  return null;
};

const deriveVariantToken = (variantName: string, index: number) =>
  variantName
    .split(/[/-]/)
    .map((part) => part.trim())
    .filter(Boolean)[index] ?? '';

const sortMedia = (left: ProductMediaResponse, right: ProductMediaResponse) => {
  const primaryDelta = Number(Boolean(right.primary)) - Number(Boolean(left.primary));
  if (primaryDelta !== 0) {
    return primaryDelta;
  }

  const leftSortOrder = typeof left.sortOrder === 'number' ? left.sortOrder : Number.MAX_SAFE_INTEGER;
  const rightSortOrder = typeof right.sortOrder === 'number' ? right.sortOrder : Number.MAX_SAFE_INTEGER;
  return leftSortOrder - rightSortOrder;
};

const getVariantMediaImage = (product: ProductDetailResponse, variantId: string | null, alt: string) => {
  const matchingMedia = (product.media ?? [])
    .filter((media) => media.variantId === variantId && Boolean(media.mediaUrl))
    .sort(sortMedia)[0];

  if (matchingMedia) {
    return createProductImage(matchingMedia.mediaUrl, alt);
  }

  return null;
};

const getPrimaryMediaImage = (product: ProductDetailResponse, alt: string) => {
  const media = [...(product.media ?? [])].filter((item) => Boolean(item.mediaUrl)).sort(sortMedia);
  const primaryMedia = media[0];

  return createProductImage(primaryMedia?.mediaUrl, alt);
};

const toProductVariant = (product: ProductDetailResponse, variant: ProductVariantResponse): ProductVariant => {
  const color = getVariantAttributeValue(variant, 'COLOR') ?? deriveVariantToken(variant.variantName ?? '', 0) ?? 'Default';
  const size = getVariantAttributeValue(variant, 'SIZE') ?? deriveVariantToken(variant.variantName ?? '', 1) ?? 'One Size';
  const imageAlt = `${product.name} ${color} ${size}`;
  const image = getVariantMediaImage(product, variant.id, imageAlt) ?? getPrimaryMediaImage(product, imageAlt);
  const basePrice = getFiniteNumber(variant.basePrice) ?? 0;
  const salePrice = getFiniteNumber(variant.salePrice);
  const price = salePrice ?? basePrice;
  const compareAtPrice = getFiniteNumber(variant.compareAtPrice);

  return {
    id: variant.id,
    sku: variant.sku ?? '',
    color: titleCaseToken(color || 'Default'),
    size: titleCaseToken(size || 'One Size'),
    stock: 0,
    price,
    compareAtPrice: compareAtPrice !== null && compareAtPrice > price ? compareAtPrice : undefined,
    swatch: image.src,
    image,
  };
};

export const mapProductDetailResponse = (product: ProductDetailResponse): ProductDetail => {
  const media = [...(product.media ?? [])]
    .filter((item) => Boolean(item.mediaUrl))
    .sort(sortMedia)
    .map((item, index) => createProductImage(item.mediaUrl, `${product.name} image ${index + 1}`));
  const primaryImage = media[0] ?? createProductImage(null, `${product.name} product image`);
  const variants = (product.variants ?? []).map((variant) => toProductVariant(product, variant));
  const firstVariant = variants[0];
  const categories = product.categories ?? [];

  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    subtitle: product.shortDescription ?? '',
    brandId: product.brand?.id ?? '',
    brandName: product.brand?.name ?? 'Fashion Shop',
    categoryIds: categories.map((category) => category.id),
    categorySlugs: categories.map((category) => category.slug ?? ''),
    price: firstVariant?.price ?? 0,
    compareAtPrice: firstVariant?.compareAtPrice,
    badges: [product.featured ? 'Featured' : '', product.createdAt ? 'New' : ''].filter(Boolean),
    rating: 0,
    reviewCount: 0,
    primaryImage,
    secondaryImage: media[1] ?? primaryImage,
    featured: product.featured,
    newArrival: true,
    createdAt: product.createdAt,
    description: product.description ?? product.shortDescription ?? '',
    story: product.shortDescription ?? product.description ?? '',
    materials: [],
    care: [],
    media: media.length > 0 ? media : [primaryImage],
    variants,
    reviews: [],
  };
};
