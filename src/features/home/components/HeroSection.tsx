import { motion, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';

import { routes } from '@/constants/routes';
import heroImage from '@/features/home/assets/home-hero-approved.jpg';
import mobileHeroImage from '@/features/home/assets/home-hero-mobile-approved.jpg';
import { motionPresets } from '@/shared/lib/motionPresets';

export const HeroSection = () => {
  const reducedMotion = useReducedMotion();

  return (
    <section className="grid w-full grid-cols-1 border-b border-border bg-canvas lg:min-h-[660px] lg:grid-cols-12">
      <div className="relative order-1 aspect-[39/40] overflow-hidden bg-surface-muted lg:col-span-8 lg:aspect-auto lg:min-h-[660px]">
        <picture>
          <source media="(max-width: 1023px)" srcSet={mobileHeroImage} />
          <img
            alt="Người mẫu diện trang phục tông màu trung tính"
            className="absolute inset-0 h-full w-full object-cover object-top lg:object-center"
            fetchPriority="high"
            height={1200}
            loading="eager"
            src={heroImage}
            width={900}
          />
        </picture>
      </div>
      <div className="order-2 flex items-center bg-canvas px-5 pb-10 pt-8 lg:col-span-4 lg:border-l lg:border-border lg:p-14">
        <motion.div className="w-full max-w-xl space-y-4 lg:space-y-6" {...motionPresets.fadeUp(Boolean(reducedMotion), 0.05)}>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-text-secondary lg:text-[13px] lg:tracking-widest lg:text-brand-primary">Tủ đồ mỗi ngày</p>
          <h1 className="text-[2rem] font-semibold leading-[1.18] tracking-tight text-[rgb(var(--discovery-control))] lg:text-[64px] lg:font-light lg:leading-[1.08] lg:text-text-primary">
            Ít hơn, nhưng đúng hơn.
          </h1>
          <p className="lg:pt-2 text-base leading-relaxed text-text-secondary">
            Những phom dáng tối giản được cắt may chuẩn xác từ chất liệu tự nhiên, tạo nên tính bền vững qua từng mùa.
          </p>
          <div className="pt-2 lg:pt-4">
            <Link className="inline-flex h-12 w-full items-center justify-center gap-1 rounded bg-[rgb(var(--discovery-control))] px-8 text-[15px] font-medium text-white transition-opacity hover:opacity-90 active:opacity-80 lg:w-auto lg:rounded-[2px] lg:bg-text-primary lg:text-sm lg:tracking-wide" to={routes.products}>
              Khám phá sản phẩm <span aria-hidden="true" className="hidden lg:inline">→</span>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
