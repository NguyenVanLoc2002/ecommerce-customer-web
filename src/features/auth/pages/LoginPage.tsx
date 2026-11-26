import { ShoppingBag } from 'lucide-react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';

import { routePaths, routes } from '@/constants/routes';
import { AuthHeading } from '@/features/auth/components/AuthHeading';
import { LoginForm } from '@/features/auth/components/LoginForm';
import { resolveAuthRedirect, withRedirectParam } from '@/features/auth/lib/resolveAuthRedirect';
import { PageSEO } from '@/shared/components/seo/PageSEO';
import { useAuthStore } from '@/shared/stores/authStore';

const getLoginContextCopy = (redirect: string | null) => {
  if (!redirect) return null;
  if (redirect.startsWith(routes.cart) || redirect.startsWith(`${routes.products}/`)) {
    return 'Đăng nhập để thêm sản phẩm vào giỏ và tiếp tục mua sắm.';
  }
  if (redirect.startsWith('/checkout')) return 'Đăng nhập để tiếp tục thanh toán. Bạn sẽ được chuyển về trang thanh toán sau khi đăng nhập.';
  if (redirect.startsWith(routes.orders)) return 'Đăng nhập để xem đơn hàng và hoạt động tài khoản.';
  return 'Đăng nhập để tiếp tục.';
};

export const LoginPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const accessToken = useAuthStore((state) => state.accessToken);
  const user = useAuthStore((state) => state.user);
  const redirect = searchParams.get('redirect');
  const loginContextCopy = getLoginContextCopy(redirect);

  if (user && accessToken) {
    return <Navigate replace to={resolveAuthRedirect(redirect)} />;
  }

  return (
    <div className="w-full max-w-4xl">
      <PageSEO description="Đăng nhập để quản lý đơn hàng và địa chỉ tại Fashion Shop." noIndex path={routes.login} title="Đăng nhập" />
      {loginContextCopy && (
        <p className="mx-auto mb-6 flex max-w-md items-center gap-3 rounded-card bg-brand-subtle p-3.5 text-xs leading-relaxed text-brand-primary sm:mb-8">
          <ShoppingBag aria-hidden="true" className="size-4 shrink-0" />
          {loginContextCopy}
        </p>
      )}
      <section className="mx-auto grid max-w-md overflow-hidden rounded-feature bg-surface shadow-card md:max-w-none md:grid-cols-12">
        <div className="relative hidden overflow-hidden bg-surface-muted md:col-span-5 md:block">
          <img alt="" className="absolute inset-0 h-full w-full object-cover" height={318} src="/auth/login.jpg" width={512} />
                    <div className="absolute inset-0 flex flex-col justify-between bg-gradient-to-t from-surface-muted/90 via-transparent p-8">
            <p className="max-w-[200px] text-xs leading-relaxed text-text-primary">Đường nét thanh lịch, phom dáng chuẩn mực và tinh thần tối giản hiện đại.</p>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-primary">Maison Aure</p>
          </div>
        </div>
        <div className="p-6 sm:p-10 md:col-span-7">
          <AuthHeading description="Chào mừng bạn quay trở lại với không gian thời trang tối giản Fashion Shop." eyebrow="Tài khoản thành viên" title="Đăng nhập tài khoản" />
          <LoginForm onSuccess={() => navigate(resolveAuthRedirect(redirect), { replace: true })} />
          <p className="mt-4 text-center text-xs text-text-secondary">
            Chưa có tài khoản?{' '}
            <Link className="inline-flex min-h-11 items-center font-semibold text-text-primary underline-offset-4 hover:underline" to={withRedirectParam(routePaths.registerRedirect(), redirect)}>
              Đăng ký thành viên mới
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
};

export default LoginPage;
