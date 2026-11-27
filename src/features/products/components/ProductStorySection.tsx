import type { ProductImage } from '@/shared/types/catalog.types';

type ProductStorySectionProps = {
  story: string;
  images: ProductImage[];
};

export const ProductStorySection = ({ images, story }: ProductStorySectionProps) => {
  const mainImage = [...images].reverse().find((image) => !image.variantId && (!image.mediaType || image.mediaType.toUpperCase() === 'IMAGE'));

  return (
    <section aria-labelledby="product-story-title" className="hidden bg-surface-muted py-16 lg:block">
      <div className="mx-auto grid max-w-layout grid-cols-12 items-center gap-8 px-page">
        <div className="col-span-5 space-y-4">
          <h2 className="text-3xl font-medium tracking-tight text-text-primary" id="product-story-title">Câu chuyện sản phẩm</h2>
          <p className="text-sm leading-relaxed text-text-secondary">{story}</p>
        </div>
        {mainImage ? (
          <img
            alt={mainImage.alt}
            className="col-span-7 h-96 w-full rounded-sm object-cover"
            height={mainImage.height}
            loading="lazy"
            src={mainImage.src}
            width={mainImage.width}
          />
        ) : null}
      </div>
    </section>
  );
};
