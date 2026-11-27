import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

import type { ProductImage } from '@/shared/types/catalog.types';
import { ProductBadges } from '@/shared/components/catalog/ProductBadges';
import { cn } from '@/shared/utils/cn';

type ProductMediaGalleryProps = {
  media: ProductImage[];
  productName: string;
  selectedVariantId?: string;
  badgeLabels?: string[];
};

export const ProductMediaGallery = ({ badgeLabels = [], media, productName, selectedVariantId }: ProductMediaGalleryProps) => {
  const reducedMotion = useReducedMotion();
  const imageMedia = media.filter((image) => !image.mediaType || image.mediaType.toUpperCase() === 'IMAGE');
  const variantMedia = selectedVariantId ? imageMedia.filter((image) => image.variantId === selectedVariantId) : [];
  const sharedMedia = imageMedia.filter((image) => !image.variantId);
  const visibleMedia = variantMedia.length > 0 ? variantMedia : sharedMedia;
  const [selectedId, setSelectedId] = useState('');
  const selectedImage = visibleMedia.find((image) => image.id === selectedId) ?? visibleMedia[0];

  useEffect(() => {
    setSelectedId('');
  }, [selectedVariantId]);

  if (!selectedImage) {
    return <p className="p-6 text-sm text-text-secondary" role="status">Chưa có hình ảnh cho sản phẩm này.</p>;
  }

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:gap-5">
      <div aria-label={`Hình ảnh ${productName}`} className="order-2 grid grid-cols-4 gap-2.5 px-page lg:order-1 lg:flex lg:w-20 lg:flex-col lg:gap-3 lg:px-0" role="group">
        {visibleMedia.map((image, index) => (
          <button
            aria-label={`Hiển thị ảnh ${index + 1} của ${productName}`}
            aria-pressed={selectedImage?.id === image.id}
            className={cn(
              'aspect-[3/4] min-w-0 overflow-hidden rounded bg-surface-muted transition-opacity duration-300 motion-reduce:transition-none lg:h-28 lg:w-full lg:p-0.5 lg:ring-1',
              selectedImage.id === image.id ? 'shadow-subtle lg:ring-text-primary' : 'opacity-60 hover:opacity-100 lg:opacity-100 lg:ring-border lg:hover:ring-text-secondary',
            )}
            key={image.id}
            onClick={() => setSelectedId(image.id)}
            type="button"
          >
            <img
              alt={image.alt}
              className="h-full w-full object-cover lg:rounded-sm"
              height={image.height}
              loading="lazy"
              src={image.src}
              width={image.width}
            />
          </button>
        ))}
      </div>
      <div className="order-1 min-w-0 flex-1 lg:order-2">
        <div className="group relative aspect-[3/4] overflow-hidden bg-surface-soft lg:rounded-sm">
          <motion.img
            alt={selectedImage.alt}
            animate={{ opacity: 1 }}
            className="h-full w-full object-cover transition-transform duration-500 ease-out motion-reduce:transition-none lg:object-top lg:motion-safe:group-hover:scale-105"
            height={selectedImage.height}
            fetchPriority="high"
            initial={false}
            key={selectedImage.id}
            loading="eager"
            src={selectedImage.src}
            transition={reducedMotion ? { duration: 0 } : { duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            width={selectedImage.width}
          />
          <ProductBadges labels={badgeLabels} limit={2} />
        </div>
      </div>
    </div>
  );
};
