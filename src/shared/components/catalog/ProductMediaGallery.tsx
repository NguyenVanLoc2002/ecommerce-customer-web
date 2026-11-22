import { useEffect, useState } from 'react';

import type { ProductImage } from '@/shared/types/catalog.types';
import { cn } from '@/shared/utils/cn';

type ProductMediaGalleryProps = {
  media: ProductImage[];
  productName: string;
  selectedVariantId?: string;
};

export const ProductMediaGallery = ({ media, productName, selectedVariantId }: ProductMediaGalleryProps) => {
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
      <div aria-label={`Hình ảnh ${productName}`} className="order-2 flex gap-3 overflow-x-auto md:order-1 md:w-20 md:flex-col md:overflow-visible" role="group">
        {visibleMedia.map((image, index) => (
          <button
            aria-label={`Hiển thị ảnh ${index + 1} của ${productName}`}
            aria-pressed={selectedImage?.id === image.id}
            className={cn(
              'h-20 w-16 shrink-0 overflow-hidden border bg-surface transition-colors motion-reduce:transition-none md:h-auto md:w-full',
              selectedImage.id === image.id ? 'border-text-primary' : 'border-transparent hover:border-border',
            )}
            key={image.id}
            onClick={() => setSelectedId(image.id)}
            type="button"
          >
            <img
              alt={image.alt}
              className="aspect-[4/5] h-full w-full object-cover"
              height={image.height}
              loading="lazy"
              src={image.src}
              width={image.width}
            />
          </button>
        ))}
      </div>
      <div className="order-1 flex-1 md:order-2">
        <div className="relative overflow-hidden bg-surface-soft">
          <img
            alt={selectedImage.alt}
            className="aspect-[4/5] h-full w-full object-cover"
            height={selectedImage.height}
            loading="eager"
            src={selectedImage.src}
            width={selectedImage.width}
          />
        </div>
      </div>
    </div>
  );
};
