import { SORT_OPTIONS, type ProductSort } from '@/shared/types/enums';
import type {
  Brand,
  Category,
  ProductDetail,
  ProductFilters,
  ProductImage,
  ProductListResponse,
  ProductSummary,
  ProductVariant,
} from '@/shared/types/catalog.types';

const createImage = (id: string, src: string, alt: string): ProductImage => ({
  id,
  src,
  alt,
  width: 900,
  height: 1125,
});

export const categories: Category[] = [
  {
    id: 'cat-womenswear',
    slug: 'womenswear',
    name: 'Womenswear',
    description: 'Structured tailoring, fluid layers, and evening textures.',
    imageUrl: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80',
    imageAlt: 'Editorial womenswear rack with structured tailoring',
    itemCount: 18,
  },
  {
    id: 'cat-menswear',
    slug: 'menswear',
    name: 'Menswear',
    description: 'Soft tailoring and sharp essentials for daily uniform dressing.',
    imageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80',
    imageAlt: 'Menswear rail with neutral tailoring',
    itemCount: 14,
  },
  {
    id: 'cat-accessories',
    slug: 'accessories',
    name: 'Accessories',
    description: 'Leather goods, sculptural hardware, and polished finishing pieces.',
    imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80',
    imageAlt: 'Luxury accessories styled on a soft neutral background',
    itemCount: 9,
  },
];

export const brands: Brand[] = [
  {
    id: 'brand-aure',
    slug: 'maison-aure',
    name: 'Maison Aure',
    description: 'Minimalist tailoring and fluid silhouettes with a Parisian editorial point of view.',
  },
  {
    id: 'brand-selene',
    slug: 'atelier-selene',
    name: 'Atelier Selene',
    description: 'Evening-driven textures and sculpted lines made for elevated occasions.',
  },
  {
    id: 'brand-north',
    slug: 'north-meridian',
    name: 'North Meridian',
    description: 'Quiet-luxury essentials built around versatile modern uniform dressing.',
  },
];

const createVariants = (
  baseId: string,
  prices: [number, number?],
  color: string,
  swatch: string,
  image: ProductImage,
): ProductVariant[] => [
  {
    id: `${baseId}-${color}-s`,
    sku: `${baseId.toUpperCase()}-${color.slice(0, 3).toUpperCase()}-S`,
    color,
    size: 'S',
    stock: 6,
    price: prices[0],
    compareAtPrice: prices[1],
    swatch,
    image,
  },
  {
    id: `${baseId}-${color}-m`,
    sku: `${baseId.toUpperCase()}-${color.slice(0, 3).toUpperCase()}-M`,
    color,
    size: 'M',
    stock: 4,
    price: prices[0],
    compareAtPrice: prices[1],
    swatch,
    image,
  },
  {
    id: `${baseId}-${color}-l`,
    sku: `${baseId.toUpperCase()}-${color.slice(0, 3).toUpperCase()}-L`,
    color,
    size: 'L',
    stock: 3,
    price: prices[0],
    compareAtPrice: prices[1],
    swatch,
    image,
  },
];

const productDetails: ProductDetail[] = [
  {
    id: 'prd-silk-coat',
    slug: 'silk-trench-coat',
    name: 'Silk Trench Coat',
    subtitle: 'Liquid drape, sharp shoulders, soft utility.',
    brandId: 'brand-aure',
    brandName: 'Maison Aure',
    categoryIds: ['cat-womenswear'],
    categorySlugs: ['womenswear'],
    price: 540,
    compareAtPrice: 680,
    badges: ['Editor Pick', 'Limited'],
    rating: 4.8,
    reviewCount: 28,
    featured: true,
    newArrival: true,
    primaryImage: createImage(
      'img-silk-coat-primary',
      'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80',
      'Model wearing an ivory silk trench coat',
    ),
    secondaryImage: createImage(
      'img-silk-coat-secondary',
      'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80',
      'Close editorial crop of silk trench coat fabric and belt',
    ),
    description:
      'A fluid trench cut from washed silk twill with a double-breasted front, gentle shoulder line, and self-tie belt.',
    story:
      'Designed for the customer who wants the polish of tailoring with the ease of an after-dark layer. The shape stays composed while the fabric stays luminous.',
    materials: ['100% washed silk twill', 'Horn-effect buttons', 'Lightweight half lining'],
    care: ['Dry clean only', 'Store on a wide hanger', 'Steam lightly between wears'],
    media: [
      createImage(
        'img-silk-coat-primary',
        'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80',
        'Model wearing an ivory silk trench coat',
      ),
      createImage(
        'img-silk-coat-detail-1',
        'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80',
        'Editorial detail of silk trench coat sleeve and belt',
      ),
      createImage(
        'img-silk-coat-detail-2',
        'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80',
        'Full-length fashion portrait wearing the silk trench coat',
      ),
      createImage(
        'img-silk-coat-detail-3',
        'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=80',
        'Back view of silk trench coat in motion',
      ),
    ],
    variants: [
      ...createVariants(
        'silk-trench',
        [540, 680],
        'Ivory',
        '#F2EEE8',
        createImage(
          'img-silk-coat-primary',
          'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80',
          'Model wearing an ivory silk trench coat',
        ),
      ),
      ...createVariants(
        'silk-trench',
        [540, 680],
        'Ink',
        '#1E293B',
        createImage(
          'img-silk-coat-ink',
          'https://images.unsplash.com/photo-1506629905607-d9c297d14d6a?auto=format&fit=crop&w=900&q=80',
          'Model wearing an ink silk trench coat',
        ),
      ),
    ],
    reviews: [
      {
        id: 'rev-001',
        author: 'M. Greene',
        rating: 5,
        title: 'Looks like editorial tailoring, wears like silk pajamas',
        comment: 'The drape is exceptional and the shoulders stay precise. It feels expensive the second it moves.',
        createdAt: '2026-03-21T10:00:00Z',
        verifiedPurchase: true,
      },
      {
        id: 'rev-002',
        author: 'A. Dixon',
        rating: 4,
        title: 'Perfect evening layer',
        comment: 'Beautiful over knitwear and dresses. I sized down for a cleaner line.',
        createdAt: '2026-03-02T10:00:00Z',
        verifiedPurchase: true,
      },
    ],
  },
  {
    id: 'prd-tailored-blazer',
    slug: 'tailored-hourglass-blazer',
    name: 'Tailored Hourglass Blazer',
    subtitle: 'Sharp waist, softened lapel, all-day structure.',
    brandId: 'brand-north',
    brandName: 'North Meridian',
    categoryIds: ['cat-womenswear'],
    categorySlugs: ['womenswear'],
    price: 410,
    badges: ['New In'],
    rating: 4.6,
    reviewCount: 18,
    featured: true,
    newArrival: true,
    primaryImage: createImage(
      'img-blazer-primary',
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80',
      'Structured black hourglass blazer on model',
    ),
    secondaryImage: createImage(
      'img-blazer-secondary',
      'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=900&q=80',
      'Close crop of blazer lapel and waist shaping',
    ),
    description: 'A contour-led blazer with precise seaming and soft internal structure for long wear.',
    story: 'Built for clients who want a single-piece silhouette that moves from day meetings into evening plans.',
    materials: ['Wool blend suiting', 'Viscose lining', 'Covered button closure'],
    care: ['Dry clean only', 'Do not tumble dry'],
    media: [
      createImage(
        'img-blazer-primary',
        'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80',
        'Structured black hourglass blazer on model',
      ),
      createImage(
        'img-blazer-2',
        'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=900&q=80',
        'Close crop of blazer lapel and waist shaping',
      ),
      createImage(
        'img-blazer-3',
        'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80',
        'Full body blazer portrait styled with trousers',
      ),
    ],
    variants: [
      ...createVariants(
        'hourglass-blazer',
        [410],
        'Black',
        '#111827',
        createImage(
          'img-blazer-primary',
          'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80',
          'Structured black hourglass blazer on model',
        ),
      ),
      ...createVariants(
        'hourglass-blazer',
        [410],
        'Stone',
        '#D6D3D1',
        createImage(
          'img-blazer-stone',
          'https://images.unsplash.com/photo-1506629905607-d9c297d14d6a?auto=format&fit=crop&w=900&q=80',
          'Stone tailored blazer in soft light',
        ),
      ),
    ],
    reviews: [],
  },
  {
    id: 'prd-cashmere-knit',
    slug: 'cashmere-column-knit',
    name: 'Cashmere Column Knit',
    subtitle: 'Quiet softness in a longline silhouette.',
    brandId: 'brand-aure',
    brandName: 'Maison Aure',
    categoryIds: ['cat-womenswear'],
    categorySlugs: ['womenswear'],
    price: 290,
    rating: 4.7,
    reviewCount: 34,
    badges: ['Soft Luxe'],
    featured: true,
    newArrival: false,
    primaryImage: createImage(
      'img-knit-primary',
      'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=900&q=80',
      'Longline cashmere knit in neutral beige',
    ),
    secondaryImage: createImage(
      'img-knit-secondary',
      'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80',
      'Cashmere knit detail styled with leather accessories',
    ),
    description: 'A softly elongated cashmere knit with a fluid drape and clean funnel neckline.',
    story: 'A layering piece for low-effort luxury, designed to work with tailored trousers and slim skirts.',
    materials: ['100% cashmere', 'Fully fashioned knit'],
    care: ['Hand wash cold', 'Dry flat'],
    media: [
      createImage(
        'img-knit-primary',
        'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=900&q=80',
        'Longline cashmere knit in neutral beige',
      ),
      createImage(
        'img-knit-2',
        'https://images.unsplash.com/photo-1506629905607-d9c297d14d6a?auto=format&fit=crop&w=900&q=80',
        'Knit layered beneath an oversized coat',
      ),
    ],
    variants: [
      ...createVariants(
        'cashmere-knit',
        [290],
        'Sand',
        '#D6CAB5',
        createImage(
          'img-knit-primary',
          'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=900&q=80',
          'Longline cashmere knit in neutral beige',
        ),
      ),
      ...createVariants(
        'cashmere-knit',
        [290],
        'Charcoal',
        '#364152',
        createImage(
          'img-knit-charcoal',
          'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80',
          'Charcoal cashmere knit on model',
        ),
      ),
    ],
    reviews: [],
  },
  {
    id: 'prd-leather-tote',
    slug: 'structured-leather-tote',
    name: 'Structured Leather Tote',
    subtitle: 'Architectural lines with a supple carry.',
    brandId: 'brand-selene',
    brandName: 'Atelier Selene',
    categoryIds: ['cat-accessories'],
    categorySlugs: ['accessories'],
    price: 620,
    compareAtPrice: 720,
    rating: 4.9,
    reviewCount: 13,
    badges: ['Limited'],
    featured: true,
    newArrival: true,
    primaryImage: createImage(
      'img-tote-primary',
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=900&q=80',
      'Structured leather tote in espresso brown',
    ),
    secondaryImage: createImage(
      'img-tote-secondary',
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=900&q=80',
      'Leather tote with sculptural hardware close-up',
    ),
    description: 'A softly structured tote with magnetic closure, suede lining, and refined hardware.',
    story: 'For customers who want elevated practicality: enough space for the day, sharp enough for evening.',
    materials: ['Smooth calf leather', 'Suede lining', 'Magnetic tab closure'],
    care: ['Store filled to preserve shape', 'Use leather conditioner sparingly'],
    media: [
      createImage(
        'img-tote-primary',
        'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=900&q=80',
        'Structured leather tote in espresso brown',
      ),
      createImage(
        'img-tote-2',
        'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=900&q=80',
        'Leather tote with sculptural hardware close-up',
      ),
    ],
    variants: [
      ...createVariants(
        'leather-tote',
        [620, 720],
        'Espresso',
        '#4B2E2A',
        createImage(
          'img-tote-primary',
          'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=900&q=80',
          'Structured leather tote in espresso brown',
        ),
      ),
      ...createVariants(
        'leather-tote',
        [620, 720],
        'Olive',
        '#667B68',
        createImage(
          'img-tote-olive',
          'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&w=900&q=80',
          'Structured olive leather tote',
        ),
      ),
    ],
    reviews: [],
  },
  {
    id: 'prd-wool-trousers',
    slug: 'pleated-wool-trousers',
    name: 'Pleated Wool Trousers',
    subtitle: 'Relaxed break with sharp front pleats.',
    brandId: 'brand-north',
    brandName: 'North Meridian',
    categoryIds: ['cat-menswear'],
    categorySlugs: ['menswear'],
    price: 260,
    rating: 4.5,
    reviewCount: 19,
    badges: ['Essential'],
    featured: false,
    newArrival: true,
    primaryImage: createImage(
      'img-trousers-primary',
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80',
      'Pleated wool trousers styled with knitwear',
    ),
    secondaryImage: createImage(
      'img-trousers-secondary',
      'https://images.unsplash.com/photo-1506629905607-d9c297d14d6a?auto=format&fit=crop&w=900&q=80',
      'Detail of pleated wool trouser waistline',
    ),
    description: 'A relaxed-leg trouser with a clean rise and generous drape through the leg.',
    story: 'A uniform-building trouser intended for repeated wear with tailoring and fine-gauge knits.',
    materials: ['Italian wool blend', 'Half canvas waistband'],
    care: ['Dry clean only'],
    media: [
      createImage(
        'img-trousers-primary',
        'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80',
        'Pleated wool trousers styled with knitwear',
      ),
      createImage(
        'img-trousers-2',
        'https://images.unsplash.com/photo-1506629905607-d9c297d14d6a?auto=format&fit=crop&w=900&q=80',
        'Detail of pleated wool trouser waistline',
      ),
    ],
    variants: [
      ...createVariants(
        'wool-trousers',
        [260],
        'Graphite',
        '#334155',
        createImage(
          'img-trousers-primary',
          'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80',
          'Pleated wool trousers styled with knitwear',
        ),
      ),
      ...createVariants(
        'wool-trousers',
        [260],
        'Tobacco',
        '#8B5E3C',
        createImage(
          'img-trousers-tobacco',
          'https://images.unsplash.com/photo-1506629905607-d9c297d14d6a?auto=format&fit=crop&w=900&q=80',
          'Tobacco pleated trousers detail',
        ),
      ),
    ],
    reviews: [],
  },
  {
    id: 'prd-city-loafers',
    slug: 'city-leather-loafers',
    name: 'City Leather Loafers',
    subtitle: 'Polished leather, softened profile, low stacked heel.',
    brandId: 'brand-selene',
    brandName: 'Atelier Selene',
    categoryIds: ['cat-accessories'],
    categorySlugs: ['accessories'],
    price: 360,
    rating: 4.4,
    reviewCount: 11,
    badges: ['New In'],
    featured: false,
    newArrival: true,
    primaryImage: createImage(
      'img-loafers-primary',
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80',
      'Gloss leather loafers in deep black',
    ),
    secondaryImage: createImage(
      'img-loafers-secondary',
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=900&q=80',
      'Leather loafer profile with stacked heel',
    ),
    description: 'A sleek loafer finished with tonal stitching and subtle hardware.',
    story: 'Intended to sharpen denim, trousers, and dresses without veering formal.',
    materials: ['Gloss calf leather', 'Leather sole', 'Padded insole'],
    care: ['Use leather cream monthly'],
    media: [
      createImage(
        'img-loafers-primary',
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80',
        'Gloss leather loafers in deep black',
      ),
      createImage(
        'img-loafers-2',
        'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=900&q=80',
        'Leather loafer profile with stacked heel',
      ),
    ],
    variants: [
      ...createVariants(
        'city-loafers',
        [360],
        'Black',
        '#0F172A',
        createImage(
          'img-loafers-primary',
          'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80',
          'Gloss leather loafers in deep black',
        ),
      ),
      ...createVariants(
        'city-loafers',
        [360],
        'Cream',
        '#E7E2D8',
        createImage(
          'img-loafers-cream',
          'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=900&q=80',
          'Cream leather loafers on pedestal',
        ),
      ),
    ],
    reviews: [],
  },
];

type VariantLookup = {
  product: ProductDetail;
  variant: ProductVariant;
};

const sortProducts = (items: ProductSummary[], sort: ProductSort) => {
  const sorted = [...items];

  switch (sort) {
    case SORT_OPTIONS.NEWEST:
      return sorted.sort((a, b) => Number(b.newArrival) - Number(a.newArrival));
    case SORT_OPTIONS.PRICE_ASC:
      return sorted.sort((a, b) => a.price - b.price);
    case SORT_OPTIONS.PRICE_DESC:
      return sorted.sort((a, b) => b.price - a.price);
    case SORT_OPTIONS.RATING:
      return sorted.sort((a, b) => b.rating - a.rating);
    case SORT_OPTIONS.FEATURED:
    default:
      return sorted.sort((a, b) => Number(b.featured) - Number(a.featured));
  }
};

const summaries: ProductSummary[] = productDetails.map((product) => ({
  id: product.id,
  slug: product.slug,
  name: product.name,
  subtitle: product.subtitle,
  brandId: product.brandId,
  brandName: product.brandName,
  categoryIds: product.categoryIds,
  categorySlugs: product.categorySlugs,
  price: product.price,
  compareAtPrice: product.compareAtPrice,
  badges: product.badges,
  rating: product.rating,
  reviewCount: product.reviewCount,
  primaryImage: product.primaryImage,
  secondaryImage: product.secondaryImage,
  featured: product.featured,
  newArrival: product.newArrival,
}));

export const mockCatalog = {
  getCategories: async () => categories,
  getBrands: async () => brands,
  getFeaturedProducts: async () => summaries.filter((product) => product.featured).slice(0, 4),
  getNewArrivals: async () => summaries.filter((product) => product.newArrival).slice(0, 4),
  getRelatedProducts: async (slug: string) => {
    const current = productDetails.find((product) => product.slug === slug);
    if (!current) {
      return [];
    }

    return summaries
      .filter((product) => product.slug !== slug && product.categoryIds.some((id) => current.categoryIds.includes(id)))
      .slice(0, 4);
  },
  getProductBySlug: async (slug: string) => productDetails.find((product) => product.slug === slug) ?? null,
  getProductById: async (id: string) => productDetails.find((product) => product.id === id) ?? null,
  getProducts: async (filters: ProductFilters): Promise<ProductListResponse> => {
    const keyword = filters.keyword.trim().toLowerCase();
    const minPrice = Number(filters.minPrice || 0);
    const maxPrice = Number(filters.maxPrice || Number.POSITIVE_INFINITY);

    const filtered = summaries.filter((product) => {
      const matchesKeyword =
        keyword.length === 0 ||
        product.name.toLowerCase().includes(keyword) ||
        product.subtitle.toLowerCase().includes(keyword) ||
        product.brandName.toLowerCase().includes(keyword);
      const matchesCategory = !filters.category || product.categorySlugs.includes(filters.category);
      const matchesBrand = !filters.brand || brands.find((brand) => brand.id === product.brandId)?.slug === filters.brand;
      const matchesMin = product.price >= minPrice;
      const matchesMax = product.price <= maxPrice;

      return matchesKeyword && matchesCategory && matchesBrand && matchesMin && matchesMax;
    });

    const sorted = sortProducts(filtered, filters.sort);

    return {
      items: sorted,
      page: 1,
      size: sorted.length,
      totalItems: sorted.length,
      totalPages: 1,
      hasNext: false,
      hasPrevious: false,
      appliedFilters: filters,
    };
  },
  findVariantById: (variantId: string): VariantLookup | null => {
    for (const product of productDetails) {
      const variant = product.variants.find((item) => item.id === variantId);
      if (variant) {
        return {
          product,
          variant,
        };
      }
    }

    return null;
  },
  getAllProductDetails: () => productDetails,
};
