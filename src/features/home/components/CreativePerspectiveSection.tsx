import { motion, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';

import { routes } from '@/constants/routes';
import editorialImage from '@/features/home/assets/home-editorial-approved.jpg';
import { Container } from '@/shared/components/layout/Container';
import { motionPresets } from '@/shared/lib/motionPresets';

export const CreativePerspectiveSection = () => {
  const reducedMotion = useReducedMotion();

  return (
    <section className="py-16 md:py-24">
      <Container>
        <motion.div
          className="grid items-center gap-8 lg:grid-cols-12 lg:gap-12"
          {...motionPresets.fadeUp(Boolean(reducedMotion))}
        >
          <div className="overflow-hidden border border-border bg-surface-muted lg:col-span-7">
            <img
              alt="Người mẫu phối áo khoác dáng rộng cùng trang phục dệt kim trong ánh sáng buổi sớm"
              className="h-auto max-h-[640px] w-full object-cover"
              height={900}
              loading="lazy"
              src={editorialImage}
              width={1200}
            />
          </div>
          <div className="space-y-6 lg:col-span-5 lg:pl-6">
            <p className="block text-xs font-medium uppercase tracking-widest text-brand-primary">Góc nhìn sáng tạo</p>
            <h2 className="text-3xl font-light leading-tight tracking-tight text-text-primary lg:text-4xl">
              Những lớp mặc nhẹ nhàng.
            </h2>
            <p className="text-base leading-relaxed text-text-secondary">
              Sự kết hợp giữa áo khoác dáng thả lỏng và lớp dệt kim tạo nên một cách phối đồ nhẹ nhàng, dễ mặc mỗi ngày.
            </p>
            <Link
              className="inline-flex min-h-11 items-center text-sm font-medium text-text-primary underline-offset-4 transition-colors hover:text-brand-primary hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
              to={routes.products}
            >
              Khám phá sản phẩm <span aria-hidden="true" className="ml-1">→</span>
            </Link>
          </div>
        </motion.div>
      </Container>
    </section>
  );
};
