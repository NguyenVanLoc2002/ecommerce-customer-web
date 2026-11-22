import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

import type { ProductImage } from '@/shared/types/catalog.types';
import { cn } from '@/shared/utils/cn';

type ProductMediaGalleryProps = {
  media: ProductImage[];
  productName: string;
  selectedVariantId?: string;
};

export const ProductMediaGallery = ({ media, productName, selectedVariantId }: ProductMediaGalleryProps) => {
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
    <div className="flex flex-col gap-3 md:flex-row md:gap-5">
      <div aria-label={`Hình ảnh ${productName}`} className="order-2 grid grid-cols-4 gap-2.5 px-page md:order-1 md:flex md:w-20 md:flex-col md:overflow-visible md:px-0" role="group">
        {visibleMedia.map((image, index) => (
          <button
            aria-label={`Hiển thị ảnh ${index + 1} của ${productName}`}
            aria-pressed={selectedImage?.id === image.id}
            className={cn(
              'group/thumb aspect-[3/4] min-w-0 overflow-hidden rounded border bg-surface transition-[border-color,opacity] duration-300 motion-reduce:transition-none md:h-auto md:w-full',
              selectedImage.id === image.id ? 'border-text-primary opacity-100' : 'border-transparent opacity-70 hover:opacity-100',
            )}
            key={image.id}
            onClick={() => setSelectedId(image.id)}
            type="button"
          >
            <img
              alt={image.alt}
              className="aspect-[3/4] h-full w-full object-cover transition-opacity duration-300 group-hover/thumb:opacity-90 motion-reduce:transition-none"
              height={image.height}
              loading="lazy"
              src={image.src}
              width={image.width}
            />
          </button>
        ))}
      </div>
      <div className="order-1 flex-1 md:order-2">
        <div className="group relative aspect-[3/4] overflow-hidden bg-surface-soft">
          <motion.img
            alt={selectedImage.alt}
            animate={{ opacity: 1 }}
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.015] motion-reduce:transition-none"
            height={selectedImage.height}
            initial={reducedMotion ? false : { opacity: 0.65 }}
            key={selectedImage.id}
            loading="eager"
            src={selectedImage.src}
            transition={reducedMotion ? { duration: 0 } : { duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            width={selectedImage.width}
          />
        </div>
      </div>
    </div>
  );
};
