import { motion, useReducedMotion } from 'framer-motion';

import type { ProductImage } from '@/shared/types/catalog.types';
import { motionPresets } from '@/shared/lib/motionPresets';

type ProductStorySectionProps = {
  story: string;
  description: string;
  images: ProductImage[];
};

export const ProductStorySection = ({ description, images, story }: ProductStorySectionProps) => {
  const reducedMotion = Boolean(useReducedMotion());
  const mainImage = images[images.length - 1];
  const detailImage = images.length > 1 ? images[images.length - 2] : undefined;

  return (
    <motion.section
      aria-labelledby="product-story-title"
      className="hidden bg-surface-muted py-16 md:block md:py-20 lg:py-24"
      {...motionPresets.fadeUp(reducedMotion)}
    >
      <div className="mx-auto grid max-w-layout items-center gap-10 px-page md:grid-cols-2 md:gap-12 lg:gap-16">
        <div className="space-y-6 md:space-y-8">
          <h2 className="max-w-[18ch] text-2xl font-semibold leading-tight tracking-tight text-text-primary md:text-3xl lg:text-4xl" id="product-story-title">
            Câu chuyện sản phẩm
          </h2>
          <div className="max-w-[65ch] space-y-5 text-base leading-7 text-text-secondary md:text-lg md:leading-8">
            <p className="italic">{story}</p>
            {description !== story ? <p>{description}</p> : null}
          </div>
        </div>
        {mainImage ? (
          <div className="relative md:py-3 md:pl-3">
            <div className="group aspect-[3/2] overflow-hidden rounded-md bg-surface-soft">
              <img
                alt={mainImage.alt}
                className="h-full w-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105 motion-reduce:transition-none"
                height={mainImage.height}
                loading="lazy"
                src={mainImage.src}
                width={mainImage.width}
              />
            </div>
            {detailImage ? (
              <div className="absolute -bottom-5 left-0 hidden h-48 w-36 border-4 border-surface bg-surface-soft p-1 md:block lg:-left-6 lg:h-52 lg:w-40">
                <img
                  alt={detailImage.alt}
                  className="h-full w-full object-cover"
                  height={detailImage.height}
                  loading="lazy"
                  src={detailImage.src}
                  width={detailImage.width}
                />
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </motion.section>
  );
};
