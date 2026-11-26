import { motion, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';

import { routes } from '@/constants/routes';
import editorialImage from '@/features/home/assets/home-editorial-approved.jpg';
import { motionPresets } from '@/shared/lib/motionPresets';

export const CreativePerspectiveSection = ({ categorySlug }: { categorySlug?: string }) => {
  const reducedMotion = useReducedMotion();

  return (
    <section className="bg-[rgb(var(--discovery-panel))] lg:bg-canvas">
      <div className="mx-auto max-w-[1440px] lg:px-8 lg:py-12">
        <motion.div
          className="grid items-center lg:grid-cols-12 lg:gap-12"
          {...motionPresets.fadeUp(Boolean(reducedMotion))}
        >
          <div className="aspect-[16/10] overflow-hidden bg-surface-muted lg:col-span-7 lg:aspect-auto lg:border lg:border-border">
            <img
              alt="Người mẫu phối áo khoác dáng rộng cùng trang phục dệt kim trong ánh sáng buổi sớm"
              className="h-full w-full object-cover lg:h-auto lg:max-h-[640px]"
              height={900}
              loading="lazy"
              src={editorialImage}
              width={1200}
            />
          </div>
          <div className="space-y-3.5 px-5 py-8 lg:col-span-5 lg:space-y-6 lg:py-0 lg:pl-6 lg:pr-0">
            <p className="block text-xs font-medium uppercase tracking-widest text-text-secondary lg:text-brand-primary">Góc nhìn sáng tạo</p>
            <h2 className="text-[26px] font-semibold leading-tight text-text-primary lg:text-4xl lg:font-light">
              Những lớp mặc nhẹ nhàng.
            </h2>
            <p className="text-base leading-relaxed text-text-secondary">
              Sự kết hợp tinh tế giữa vải dệt kim mềm mịn và phom áo khoác thả lỏng, mang lại cảm giác dễ chịu trong mọi chuyển động.
            </p>
            <Link
              className="inline-flex min-h-11 items-center text-sm font-medium text-text-primary underline-offset-4 transition-colors hover:text-brand-primary hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
              to={categorySlug ? `${routes.products}?category=${encodeURIComponent(categorySlug)}` : routes.products}
            >
              {categorySlug ? 'Xem bộ sưu tập Nữ' : 'Khám phá sản phẩm'} <span aria-hidden="true" className="ml-1">→</span>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
