import type { AddressResponse } from '@/shared/types/address.types';
import type { ApiAuthResponse, ApiAuthUserResponse, AuthResponse, AuthTokens, AuthUser } from '@/shared/types/auth.types';
import type { Brand, BrandResponse, Category, CategoryResponse, ProductDetail, ProductDetailResponse, ProductImage, ProductListItemResponse, ProductSummary, ProductVariant } from '@/shared/types/catalog.types';
import type { CartItem, CartResponse, CommerceCart, CommerceOrder, OrderItem, OrderItemResponse, OrderListItemResponse, OrderResponse, ValidateVoucherResponse, VoucherPreview } from '@/shared/types/commerce.types';
import type { Invoice, InvoiceItem, InvoiceResponse } from '@/shared/types/invoice.types';
import type { Notification, NotificationResponse } from '@/shared/types/notification.types';
import type { ApiUserProfileResponse, UserProfile } from '@/shared/types/profile.types';
import type { Review, ReviewListItem, ReviewResponse } from '@/shared/types/review.types';
import { mapProductDetailResponse } from '@/shared/lib/productDetailMapper';
import { USER_ROLES, type PaymentMethod } from '@/shared/types/enums';

type ProductEnrichment = {
  brandName?: string;
  productId?: string;
  productSlug?: string;
  primaryImage?: ProductImage;
  variant?: ProductVariant | null;
};

const PLACEHOLDER_IMAGE = `data:image/svg+xml;utf8,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000"><rect width="800" height="1000" fill="#f3efe7"/><rect x="120" y="140" width="560" height="720" fill="#e4dbcf"/><text x="400" y="520" text-anchor="middle" font-family="Arial" font-size="42" fill="#6f6559">Fashion Shop</text></svg>',
)}`;

const FALLBACK_IMAGE_SIZE = {
  width: 800,
  height: 1000,
} as const;

const getPrimaryRole = (roles: string[]) => {
  if (roles.includes(USER_ROLES.CUSTOMER)) {
    return USER_ROLES.CUSTOMER;
  }

  return (roles[0] as AuthUser['role'] | undefined) ?? USER_ROLES.CUSTOMER;
};

const buildFullAddress = (address: {
  streetAddress: string;
  ward: string;
  district: string;
  city: string;
  postalCode?: string | null;
}) =>
  [address.streetAddress, `${address.ward}, ${address.district}`, `${address.city}${address.postalCode ? ` ${address.postalCode}` : ''}`]
    .filter(Boolean)
    .join(', ');

const titleCaseToken = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());

const createProductImage = (src: string | null | undefined, alt: string): ProductImage => ({
  id: src ?? alt,
  src: src && src.length > 0 ? src : PLACEHOLDER_IMAGE,
  alt,
  width: FALLBACK_IMAGE_SIZE.width,
  height: FALLBACK_IMAGE_SIZE.height,
});

export const toAuthUser = (user: ApiAuthUserResponse): AuthUser => {
  const roles = user.roles.length > 0 ? user.roles : [USER_ROLES.CUSTOMER];

  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName ?? '',
    phoneNumber: user.phoneNumber ?? '',
    role: getPrimaryRole(roles),
    roles,
    status: user.status,
    customerId: user.customerId ?? undefined,
    loyaltyPoints: user.loyaltyPoints ?? 0,
    avatarUrl: user.avatarUrl ?? undefined,
  };
};

export const toAuthResponse = (response: ApiAuthResponse, profile?: ApiUserProfileResponse): AuthResponse => {
  const tokens: AuthTokens = response.tokens;

  return {
    accessToken: tokens.accessToken,
    tokenType: tokens.tokenType,
    expiresIn: tokens.expiresIn,
    user: toAuthUser(profile ?? response.user),
  };
};

export const toUserProfile = (profile: ApiUserProfileResponse): UserProfile => ({
  ...toAuthUser(profile),
  gender: profile.gender ?? undefined,
  birthDate: profile.birthDate ?? undefined,
  createdAt: profile.createdAt,
});

export const toAddress = (address: AddressResponse) => ({
  id: address.id,
  receiverName: address.receiverName,
  phoneNumber: address.phoneNumber,
  streetAddress: address.streetAddress,
  ward: address.ward,
  district: address.district,
  city: address.city,
  postalCode: address.postalCode ?? '',
  addressType: address.addressType,
  isDefault: address.isDefault,
  label: address.label ?? '',
  fullAddress: address.fullAddress ?? buildFullAddress(address),
  createdAt: address.createdAt,
});

export const toCategory = (category: CategoryResponse, itemCount = 0): Category => ({
  id: category.id,
  parentId: category.parentId,
  slug: category.slug,
  name: category.name,
  description: category.description ?? '',
  imageUrl: category.imageUrl ?? PLACEHOLDER_IMAGE,
  imageAlt: `${category.name} collection`,
  status: category.status,
  sortOrder: category.sortOrder,
  createdAt: category.createdAt,
  itemCount,
});

export const toBrand = (brand: BrandResponse): Brand => ({
  id: brand.id,
  slug: brand.slug,
  name: brand.name,
  description: brand.description ?? '',
  logoUrl: brand.logoUrl,
  status: brand.status,
  sortOrder: brand.sortOrder,
  createdAt: brand.createdAt,
});

export const toProductSummary = (product: ProductListItemResponse): ProductSummary => {
  const imageAlt = `${product.name} product image`;
  const primaryImage = createProductImage(product.thumbnailUrl, imageAlt);

  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    subtitle: product.shortDescription ?? '',
    brandId: '',
    brandName: product.brandName ?? 'Fashion Shop',
    categoryIds: [],
    categorySlugs: [],
    price: product.minPrice,
    compareAtPrice: product.maxPrice > product.minPrice ? product.maxPrice : undefined,
    badges: [product.featured ? 'Featured' : '', product.createdAt ? 'New' : ''].filter(Boolean),
    rating: 0,
    reviewCount: 0,
    primaryImage,
    secondaryImage: primaryImage,
    featured: product.featured,
    newArrival: true,
    createdAt: product.createdAt,
  };
};

export const toProductDetail = (product: ProductDetailResponse): ProductDetail => mapProductDetailResponse(product);

export const toVoucherPreview = (code: string, response: ValidateVoucherResponse): VoucherPreview => ({
  code: response.voucherCode || code,
  isApplicable: response.discountAmount > 0,
  message:
    response.discountAmount > 0
      ? `${response.promotionName ?? 'Voucher'} preview applied.`
      : `${response.promotionName ?? 'Voucher'} is valid but does not reduce this order preview.`,
  description:
    response.discountAmount > 0
      ? `Preview amount ${response.discountAmount.toFixed(2)} from ${response.discountType ?? 'promotion'}.`
      : 'The backend validates voucher eligibility here, but order totals are still unchanged until backend support is completed.',
  discountAmount: response.discountAmount,
});

const toCartItem = (item: CartResponse['items'][number], enrichment?: ProductEnrichment): CartItem => {
  const variant = enrichment?.variant ?? null;
  const color = variant?.color ?? titleCaseToken(getVariantAttributeFromName(item.variantName, 0));
  const size = variant?.size ?? titleCaseToken(getVariantAttributeFromName(item.variantName, 1));

  return {
    id: item.id,
    productId: enrichment?.productId ?? item.productSlug,
    productSlug: enrichment?.productSlug ?? item.productSlug,
    productName: item.productName,
    brandName: enrichment?.brandName ?? 'Fashion Shop',
    variantId: item.variantId,
    sku: item.sku ?? '',
    color: color || 'Default',
    size: size || 'One Size',
    quantity: item.quantity,
    unitPrice: item.salePrice ?? item.unitPrice,
    compareAtPrice: item.salePrice && item.salePrice < item.unitPrice ? item.unitPrice : undefined,
    subtotal: item.lineTotal,
    stockAvailable: item.availableStock,
    primaryImage: enrichment?.primaryImage ?? createProductImage(null, `${item.productName} product image`),
    isStale: item.availableStock < item.quantity,
  };
};

const getVariantAttributeFromName = (variantName: string | null, index: number) =>
  variantName
    ?.split(/[/-]/)
    .map((part) => part.trim())
    .filter(Boolean)[index] ?? '';

export const toCommerceCart = (
  cart: CartResponse,
  enrichments: Record<string, ProductEnrichment>,
  shippingFee = 0,
  discountTotal = 0,
): CommerceCart => {
  const items = cart.items.map((item) => toCartItem(item, enrichments[item.variantId]));
  const grandTotal = cart.subTotal + shippingFee - discountTotal;

  return {
    id: cart.id,
    items,
    totalItems: cart.totalItems,
    subTotal: cart.subTotal,
    shippingFee,
    discountTotal,
    grandTotal,
    updatedAt: cart.updatedAt,
    staleItemCount: items.filter((item) => item.isStale).length,
  };
};

const toOrderItem = (item: OrderItemResponse, enrichment?: ProductEnrichment): OrderItem => {
  const variant = enrichment?.variant ?? null;
  const color = variant?.color ?? titleCaseToken(getVariantAttributeFromName(item.variantName, 0));
  const size = variant?.size ?? titleCaseToken(getVariantAttributeFromName(item.variantName, 1));
  const effectivePrice = item.effectivePrice ?? item.salePrice ?? item.unitPrice;

  return {
    id: item.id,
    productId: enrichment?.productId ?? item.productId ?? '',
    productSlug: enrichment?.productSlug ?? enrichment?.productId ?? item.productId ?? item.id,
    productName: item.productName,
    brandName: enrichment?.brandName ?? 'Fashion Shop',
    variantId: item.variantId ?? '',
    sku: item.sku ?? '',
    color: color || 'Default',
    size: size || 'One Size',
    quantity: item.quantity,
    unitPrice: effectivePrice,
    subtotal: item.lineTotal,
    primaryImage: enrichment?.primaryImage ?? createProductImage(null, `${item.productName} product image`),
  };
};

const toOrderShippingAddress = (order: OrderResponse) => ({
  id: order.id,
  receiverName: order.shippingReceiverName,
  phoneNumber: order.shippingPhoneNumber,
  streetAddress: order.shippingStreetAddress,
  ward: order.shippingWard,
  district: order.shippingDistrict,
  city: order.shippingCity,
  postalCode: order.shippingPostalCode ?? '',
  addressType: 'HOME' as const,
  isDefault: false,
  label: '',
  fullAddress: buildFullAddress({
    streetAddress: order.shippingStreetAddress,
    ward: order.shippingWard,
    district: order.shippingDistrict,
    city: order.shippingCity,
    postalCode: order.shippingPostalCode,
  }),
});

export const toCommerceOrder = (
  order: OrderResponse,
  enrichments: Record<string, ProductEnrichment>,
): CommerceOrder => {
  const items = order.items.map((item) => toOrderItem(item, enrichments[item.id] ?? enrichments[item.variantId ?? '']));

  return {
    id: order.id,
    code: order.orderCode,
    status: order.status,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt ?? order.createdAt,
    paymentMethod: (order.paymentMethod ?? 'COD') as PaymentMethod,
    paymentStatus: order.paymentStatus ?? undefined,
    customerNote: order.customerNote ?? '',
    voucherCode: order.voucherCode ?? undefined,
    items,
    shippingAddress: toOrderShippingAddress(order),
    canCancel: order.status === 'PENDING' || order.status === 'AWAITING_PAYMENT',
    totalItems: items.reduce((total, item) => total + item.quantity, 0),
    subTotal: order.subTotal,
    shippingFee: order.shippingFee,
    discountTotal: order.discountAmount,
    grandTotal: order.totalAmount,
  };
};

export const toCommerceOrderFromListItem = (order: OrderListItemResponse): CommerceOrder => ({
  id: order.id,
  code: order.orderCode,
  status: order.status,
  createdAt: order.createdAt,
  updatedAt: order.createdAt,
  paymentMethod: (order.paymentMethod ?? 'COD') as PaymentMethod,
  paymentStatus: order.paymentStatus ?? undefined,
  customerNote: '',
  voucherCode: undefined,
  items: [],
  shippingAddress: {
    id: order.id,
    receiverName: '',
    phoneNumber: '',
    streetAddress: '',
    ward: '',
    district: '',
    city: '',
    postalCode: '',
    addressType: 'HOME' as const,
    isDefault: false,
    label: '',
    fullAddress: '',
  },
  canCancel: order.status === 'PENDING' || order.status === 'AWAITING_PAYMENT',
  totalItems: order.totalItems,
  subTotal: order.totalAmount,
  shippingFee: 0,
  discountTotal: 0,
  grandTotal: order.totalAmount,
});

export const toInvoice = (invoice: InvoiceResponse): Invoice => ({
  id: invoice.id,
  invoiceCode: invoice.invoiceCode,
  status: invoice.status,
  orderId: invoice.orderId,
  orderCode: invoice.orderCode,
  issuedAt: invoice.issuedAt,
  dueDate: invoice.dueDate,
  paidAt: invoice.paidAt,
  paymentMethod: invoice.paymentMethod,
  paymentStatus: invoice.paymentStatus,
  customerName: invoice.customerName,
  customerEmail: invoice.customerEmail,
  customerPhone: invoice.customerPhone,
  notes: invoice.notes ?? '',
  voucherCode: invoice.voucherCode ?? undefined,
  shippingAddress: {
    receiverName: invoice.billingReceiverName ?? invoice.customerName,
    phoneNumber: invoice.billingPhoneNumber ?? invoice.customerPhone,
    streetAddress: invoice.billingStreetAddress ?? '',
    ward: invoice.billingWard ?? '',
    district: invoice.billingDistrict ?? '',
    city: invoice.billingCity ?? '',
    postalCode: invoice.billingPostalCode ?? '',
  },
  items: invoice.items.map<InvoiceItem>((item) => ({
    id: `${invoice.id}:${item.variantId}`,
    variantId: item.variantId,
    productName: item.productName,
    variantName: item.variantName,
    sku: item.sku,
    unitPrice: item.unitPrice,
    salePrice: item.salePrice,
    effectivePrice: item.effectivePrice,
    quantity: item.quantity,
    lineTotal: item.lineTotal,
    color: titleCaseToken(getVariantAttributeFromName(item.variantName, 0)) || 'Default',
    size: titleCaseToken(getVariantAttributeFromName(item.variantName, 1)) || 'One Size',
  })),
  subTotal: invoice.subTotal,
  shippingFee: invoice.shippingFee,
  discountTotal: invoice.discountAmount,
  grandTotal: invoice.totalAmount,
  createdAt: invoice.createdAt,
});

export const toReview = (review: ReviewResponse): Review => ({
  id: review.id,
  productId: review.productId,
  rating: review.rating,
  comment: review.comment ?? '',
  createdAt: review.createdAt,
  status: review.status,
  authorName: review.customerName,
  verifiedPurchase: true,
  variantId: review.variantId ?? undefined,
  variantName: review.variantName ?? undefined,
  sku: review.sku ?? undefined,
  orderItemId: review.orderItemId,
});

export const toReviewListItem = (
  review: ReviewResponse,
  enrichment: ProductEnrichment,
  orderId: string,
): ReviewListItem => ({
  ...toReview(review),
  orderId,
  orderItemId: review.orderItemId,
  productSlug: enrichment.productSlug ?? review.productId,
  productName: review.productName,
  brandName: enrichment.brandName ?? 'Fashion Shop',
  productImage: enrichment.primaryImage ?? createProductImage(null, `${review.productName} product image`),
});

export const toNotification = (notification: NotificationResponse): Notification => ({
  id: notification.id,
  type: notification.type,
  title: notification.title,
  body: notification.body,
  referenceId: notification.referenceId,
  referenceType: notification.referenceType,
  read: notification.read,
  status: notification.read ? 'READ' : 'UNREAD',
  readAt: notification.readAt,
  createdAt: notification.createdAt,
});
