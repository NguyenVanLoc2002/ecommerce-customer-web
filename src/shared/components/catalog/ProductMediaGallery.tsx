import { useState } from 'react';

import type { ProductImage } from '@/shared/types/catalog.types';
import { cn } from '@/shared/utils/cn';

type ProductMediaGalleryProps = {
  media: ProductImage[];
  productName: string;
};

export const ProductMediaGallery = ({ media, productName }: ProductMediaGalleryProps) => {
  const [selectedId, setSelectedId] = useState(media[0]?.id ?? '');
  const selectedImage = media.find((image) => image.id === selectedId) ?? media[0];

  return (
    <div className="flex flex-col gap-6 md:flex-row">
      <div className="order-2 flex gap-4 md:order-1 md:w-20 md:flex-col">
        {media.map((image) => (
          <button
            aria-label={`Show ${productName} view`}
            className={cn(
              'overflow-hidden bg-surface-soft transition-opacity duration-300',
              selectedId === image.id ? 'opacity-100' : 'opacity-50 hover:opacity-100',
            )}
            key={image.id}
            onClick={() => setSelectedId(image.id)}
            type="button"
          >
            <img
              alt={image.alt}
              className="aspect-[4/5] h-full w-full object-cover transition-transform duration-700 hover:scale-[1.04]"
              height={image.height}
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
            className="aspect-[4/5] h-full w-full object-cover transition-transform duration-700 hover:scale-[1.03]"
            height={selectedImage.height}
            src={selectedImage.src}
            width={selectedImage.width}
          />
        </div>
      </div>
    </div>
  );
};
