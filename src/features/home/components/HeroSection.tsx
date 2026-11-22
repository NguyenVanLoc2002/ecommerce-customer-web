import { motion, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';

import { routes } from '@/constants/routes';
import heroImage from '@/features/home/assets/home-hero-approved.jpg';
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
    <section className="mx-auto grid max-w-[1440px] grid-cols-1 border-b border-border bg-canvas lg:min-h-[660px] lg:grid-cols-12">
      <div className="relative order-1 min-h-[420px] overflow-hidden bg-surface-muted sm:min-h-[560px] lg:col-span-8 lg:min-h-[660px]">
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
      <div className="order-2 flex items-center border-t border-border bg-canvas p-8 sm:p-10 lg:col-span-4 lg:border-l lg:border-t-0 lg:p-14">
        <motion.div className="max-w-xl space-y-6" {...motionPresets.fadeUp(Boolean(reducedMotion), 0.05)}>
          <p className="text-[13px] font-medium uppercase tracking-widest text-brand-primary">Tủ đồ mỗi ngày</p>
          <h1 className="text-4xl font-light leading-[1.08] tracking-tight text-text-primary md:text-6xl lg:text-[64px]">
            Ít hơn, nhưng đúng hơn.
          </h1>
          <p className="pt-2 text-base leading-relaxed text-text-secondary">
            Những phom dáng tối giản được cắt may chuẩn xác từ chất liệu tự nhiên, tạo nên tính bền vững qua từng mùa.
          </p>
          <div className="pt-4">
            <Link aria-label="Khám phá sản phẩm" className={heroCtaClassName} to={routes.products}>
              Khám phá sản phẩm
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
