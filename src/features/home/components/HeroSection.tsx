import { motion, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';

import { routes } from '@/constants/routes';
import heroImage from '@/features/home/assets/home-hero-review.jpg';
import { Container } from '@/shared/components/layout/Container';
import { buttonStyles } from '@/shared/components/ui/buttonStyles';
import { motionPresets } from '@/shared/lib/motionPresets';

export const HeroSection = () => {
  const reducedMotion = useReducedMotion();
  const heroCtaClassName = buttonStyles({
    variant: 'ghost',
    className:
      '!border-text-primary !bg-text-primary !text-white shadow-card hover:!border-text-secondary hover:!bg-text-secondary focus-visible:!outline-text-primary focus-visible:outline-offset-4',
    size: 'lg',
  });

  return (
    <section className="grid bg-surface-muted lg:min-h-[620px] lg:grid-cols-2">
      <div className="relative order-1 min-h-[420px] overflow-hidden sm:min-h-[560px] lg:order-1 lg:min-h-[680px]">
        <img
          alt="Người mẫu diện trang phục tông màu trung tính"
          className="absolute inset-0 h-full w-full object-cover object-[center_35%]"
          fetchPriority="high"
          height={1200}
          loading="eager"
          src={heroImage}
          width={900}
        />
      </div>
      <Container className="order-2 flex items-center py-12 lg:order-2 lg:py-20">
        <motion.div className="max-w-xl" {...motionPresets.fadeUp(Boolean(reducedMotion), 0.05)}>
          <p className="mb-5 text-xs font-semibold uppercase tracking-[0.2em] text-text-secondary">Tủ đồ mỗi ngày</p>
          <h1 className="max-w-[13ch] text-4xl font-normal leading-[1.12] text-text-primary md:text-6xl">
            Ít hơn, nhưng đúng hơn.
          </h1>
          <p className="mt-5 max-w-md text-base leading-7 text-text-secondary md:text-lg md:leading-8">
            Những phom dáng giản dị, dễ kết hợp. Tìm một món đồ để bạn luôn muốn mặc lại.
          </p>
          <div className="mt-7">
            <Link aria-label="Khám phá sản phẩm" className={heroCtaClassName} to={routes.products}>
              Khám phá sản phẩm
            </Link>
          </div>
        </motion.div>
      </Container>
    </section>
  );
};
