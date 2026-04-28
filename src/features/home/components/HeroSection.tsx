import { motion, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';

import { routes } from '@/constants/routes';
import { Container } from '@/shared/components/layout/Container';
import { buttonStyles } from '@/shared/components/ui/buttonStyles';
import { motionPresets } from '@/shared/lib/motionPresets';

export const HeroSection = () => {
  const reducedMotion = useReducedMotion();

  return (
    <section className="relative flex min-h-[750px] items-center overflow-hidden pt-20">
      <div className="absolute inset-0">
        <img
          alt="Editorial high fashion hero"
          className="h-full w-full object-cover object-center"
          fetchPriority="high"
          height={1440}
          loading="eager"
          src="https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1600&q=80"
          width={1440}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/45 via-black/15 to-transparent" />
      </div>
      <Container className="relative z-10 w-full py-20">
        <motion.div className="max-w-2xl" {...motionPresets.fadeUp(Boolean(reducedMotion), 0.05)}>
          <h1 className="font-display text-[3.8rem] leading-[0.95] text-white drop-shadow-sm md:text-[5rem]">
            The Art of
            <br />
            Silent Luxury
          </h1>
          <p className="mt-8 max-w-md text-lg leading-8 text-white/95">
            Discover the harmony between minimalist architecture and high-end tailoring in our latest editorial collection.
          </p>
          <div className="mt-10">
            <Link className={buttonStyles({ className: 'bg-white text-brand-primary hover:bg-white/85', size: 'lg' })} to={routes.products}>
              Explore the Series
            </Link>
          </div>
        </motion.div>
      </Container>
    </section>
  );
};
