import { ArrowRight, Grid2X2, Home, Search, Truck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

import { routes } from '@/constants/routes';
import { Container } from '@/shared/components/layout/Container';
import { PageSEO } from '@/shared/components/seo/PageSEO';
import { Button } from '@/shared/components/ui/Button';
import { buttonStyles } from '@/shared/components/ui/buttonStyles';
import { trimProductKeyword } from '@/shared/lib/productSearch';

const collections = [
  { label: 'Thời trang Nữ', slug: 'womenswear', image: '/not-found/womenswear.jpg', description: 'Trang phục nữ với những phom dáng dễ kết hợp.' },
  { label: 'Thời trang Nam', slug: 'menswear', image: '/not-found/menswear.jpg', description: 'Khám phá trang phục nam cho nhiều dịp.' },
  { label: 'Phụ kiện', slug: 'accessories', image: '/not-found/accessories.jpg', description: 'Hoàn thiện trang phục với túi và phụ kiện.' },
];

const suggestedKeywords = ['Áo blazer', 'Quần xếp ly', 'Áo len'];
const productSearch = (keyword: string) => `${routes.products}?${new URLSearchParams({ q: keyword })}`;

export const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <>
      <PageSEO description="Đường dẫn không còn khả dụng. Quay lại Fashion Shop hoặc tìm kiếm trong danh mục sản phẩm." noIndex path={routes.notFound} title="Không tìm thấy trang" />
      <Container className="space-y-12 pb-16 pt-24 md:space-y-20 md:pb-24 md:pt-28">
        <div>
          <nav aria-label="Đường dẫn" className="mb-4 flex flex-wrap items-center gap-2 text-xs text-text-secondary">
            <Link className="inline-flex items-center gap-1.5 hover:underline" to={routes.home}>
              <Home aria-hidden="true" className="size-4" />Trang chủ
            </Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page" className="font-medium text-text-primary">404 · Không tìm thấy trang</span>
          </nav>
          <section className="relative isolate overflow-hidden rounded-feature border border-border bg-surface p-6 shadow-sm sm:p-8 md:p-16 lg:px-20 lg:pb-20 lg:pt-28">
            <span aria-hidden="true" className="pointer-events-none absolute -right-8 -top-10 -z-10 select-none text-[200px] font-light leading-none tracking-tighter text-brand-primary/[0.06] md:text-[360px]">
              404
            </span>
            <div className="max-w-3xl">
              <p aria-hidden="true" className="mb-4 text-6xl font-light leading-none tracking-tight text-text-primary md:text-8xl">404</p>
              <h1 className="text-2xl font-medium leading-snug tracking-tight md:text-4xl">
                <span className="md:hidden">Không tìm thấy trang</span>
                <span className="hidden md:inline">Trang bạn tìm kiếm hiện không tồn tại hoặc đã được di chuyển.</span>
              </h1>
              <p className="mt-5 max-w-2xl leading-relaxed text-text-secondary md:text-lg">
                <span className="md:hidden">Đường dẫn có thể đã hết hạn hoặc đã được di chuyển.</span>
                <span className="hidden md:inline">Đường dẫn có thể đã hết hạn, sản phẩm không còn trong danh mục hoặc địa chỉ web chưa chính xác. Bạn có thể quay về trang chủ hoặc tiếp tục khám phá sản phẩm.</span>
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap md:mt-10">
                <Link className={buttonStyles({ className: '!border-text-primary !bg-text-primary !text-sm !tracking-normal hover:!opacity-90' })} to={routes.home}>
                  Quay lại trang chủ<ArrowRight aria-hidden="true" className="size-4" />
                </Link>
                <Link className={buttonStyles({ className: '!border-transparent !bg-surface-soft !text-sm !tracking-normal hover:!bg-surface-muted', variant: 'ghost' })} to={routes.products}>
                  <Grid2X2 aria-hidden="true" className="size-4" />Khám phá sản phẩm
                </Link>
                <Link className={buttonStyles({ className: '!text-sm !tracking-normal', variant: 'ghost' })} to={routes.orders}>
                  <Truck aria-hidden="true" className="size-4" />Tra cứu đơn hàng
                </Link>
              </div>
            </div>
          </section>
        </div>

        <section aria-labelledby="not-found-search" className="rounded-feature bg-surface-muted p-6 text-center md:p-12">
          <span className="mx-auto mb-4 flex size-10 items-center justify-center rounded-full bg-surface-soft text-brand-primary">
            <Search aria-hidden="true" className="size-5" />
          </span>
          <h2 className="text-xl font-semibold tracking-tight md:text-2xl" id="not-found-search">Tìm kiếm sản phẩm</h2>
          <p className="mt-2 text-sm text-text-secondary">Nhập tên trang phục hoặc phụ kiện bạn đang tìm.</p>
          <form
            action={routes.products}
            className="mx-auto mt-6 flex max-w-3xl flex-col gap-3 sm:flex-row"
            method="get"
            onSubmit={(event) => {
              event.preventDefault();
              const query = trimProductKeyword(String(new FormData(event.currentTarget).get('q') ?? ''));
              navigate(query ? productSearch(query) : routes.products);
            }}
            role="search"
          >
            <label className="sr-only" htmlFor="not-found-keyword">Tên sản phẩm</label>
            <input className="min-h-12 min-w-0 flex-1 rounded-input border border-border bg-surface px-4 text-base placeholder:text-text-secondary sm:text-sm" id="not-found-keyword" name="q" placeholder="Ví dụ: áo blazer" type="search" />
            <Button className="!text-sm !tracking-normal" type="submit"><Search aria-hidden="true" className="size-4" />Tìm kiếm</Button>
          </form>
          <ul aria-label="Từ khóa gợi ý" className="mt-4 flex flex-wrap justify-center gap-2">
            {suggestedKeywords.map((keyword) => (
              <li key={keyword}>
                <Link className="inline-flex min-h-11 items-center rounded-button bg-surface px-3 text-xs text-text-secondary hover:bg-surface-soft hover:text-text-primary" to={productSearch(keyword)}>{keyword}</Link>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="not-found-categories">
          <h2 className="mb-6 text-2xl font-semibold tracking-tight md:mb-10 md:text-3xl" id="not-found-categories">Khám phá danh mục</h2>
          <div className="grid gap-6 md:grid-cols-3 md:gap-8">
            {collections.map(({ description, image, label, slug }) => (
              <article className="overflow-hidden rounded-feature border border-border bg-surface shadow-sm" key={slug}>
                <img alt="" className="aspect-[3/4] w-full bg-surface-soft object-cover" height={640} loading="lazy" src={image} width={480} />
                <div className="p-6">
                  <h3 className="text-base font-semibold">{label}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-text-secondary">{description}</p>
                  <Link className="mt-3 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-brand-primary hover:underline" to={`${routes.products}?category=${slug}`}>
                    Xem {label.toLocaleLowerCase('vi-VN')}<ArrowRight aria-hidden="true" className="size-4" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      </Container>
    </>
  );
};

export default NotFoundPage;
