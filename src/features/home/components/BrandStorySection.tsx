import { motion, useReducedMotion } from 'framer-motion';

import { Container } from '@/shared/components/layout/Container';
import { motionPresets } from '@/shared/lib/motionPresets';

export const BrandStorySection = () => {
  const reducedMotion = useReducedMotion();

  return (
    <section className="py-section">
      <Container>
        <motion.div className="grid gap-8 overflow-hidden rounded-feature bg-white shadow-card lg:grid-cols-[0.9fr_1.1fr]" {...motionPresets.fadeUp(Boolean(reducedMotion))}>
          <img
            alt="Craft-focused fashion editorial still life"
            className="h-full w-full object-cover"
            height={1125}
            src="https://images.unsplash.com/photo-1506629905607-d9c297d14d6a?auto=format&fit=crop&w=1200&q=80"
            width={900}
          />
          <div className="p-8 md:p-10">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-primary">Brand Story</p>
            <h2 className="mt-4 font-display text-4xl leading-tight">The interface stays quiet so material, cut, and silhouette can carry the mood.</h2>
            <p className="mt-5 text-base leading-8 text-text-secondary">
              The first five phases favor discovery surfaces that feel magazine-led, then shift to calmer transactional patterns for the protected customer routes.
            </p>
          </div>
        </motion.div>
      </Container>
    </section>
  );
};

