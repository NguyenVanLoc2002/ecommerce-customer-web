import { motion, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';

import { routes } from '@/constants/routes';
import { Container } from '@/shared/components/layout/Container';
import { buttonStyles } from '@/shared/components/ui/buttonStyles';
import { motionPresets } from '@/shared/lib/motionPresets';

export const HeroSection = () => {
  const reducedMotion = useReducedMotion();
  const heroCtaClassName = buttonStyles({
    variant: 'ghost',
    className:
      '!border-white !bg-white !text-text-primary shadow-card hover:!border-text-primary hover:!bg-text-primary hover:!text-white focus-visible:!outline-white focus-visible:outline-offset-4',
    size: 'lg',
  });

  return (
    <section className="relative flex min-h-[750px] items-center overflow-hidden pt-20">
      <div className="absolute inset-y-0 right-0 w-full md:left-[38%] md:w-[62%]">
        <img
          alt="Fashion Shop new collection"
          className="h-full min-h-[540px] w-full object-cover object-[center_35%] md:min-h-[620px]"
          fetchPriority="high"
          height={1440}
          loading="eager"
          src="https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1600&q=80"
          width={1440}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-surface-muted via-surface-muted/65 to-transparent md:from-surface-muted md:via-surface-muted/15" />
      </div>
      <Container className="relative z-10 flex min-h-[620px] items-center py-20 md:py-24">
        <motion.div className="max-w-xl pb-40 md:pb-0" {...motionPresets.fadeUp(Boolean(reducedMotion), 0.05)}>
          <p className="mb-5 text-xs font-semibold uppercase tracking-[0.24em] text-brand-primary">FASHION SHOP · BỘ SƯU TẬP MỚI</p>
          <h1 className="font-display text-[2.75rem] font-semibold leading-[1.12] text-text-primary md:text-[4rem]">
            Phong cách
            <br />
            vượt thời gian
          </h1>
          <p className="mt-6 max-w-md text-base leading-7 text-text-secondary md:text-lg md:leading-8">
            Khám phá những thiết kế tinh giản, dễ kết hợp và được tuyển chọn cho phong cách mỗi ngày.
          </p>
          <div className="mt-8">
            <Link aria-label="Khám phá sản phẩm" className={heroCtaClassName} to={routes.products}>
              Khám phá sản phẩm
            </Link>
          </div>
        </motion.div>
      </Container>
    </section>
  );
};
