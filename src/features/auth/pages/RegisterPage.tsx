import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';

import { routePaths, routes } from '@/constants/routes';
import { AuthHeading } from '@/features/auth/components/AuthHeading';
import { RegisterForm } from '@/features/auth/components/RegisterForm';
import { resolveAuthRedirect, withRedirectParam } from '@/features/auth/lib/resolveAuthRedirect';
import { PageSEO } from '@/shared/components/seo/PageSEO';
import { useAuthStore } from '@/shared/stores/authStore';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const accessToken = useAuthStore((state) => state.accessToken);
  const user = useAuthStore((state) => state.user);
  const redirect = searchParams.get('redirect');

  if (user && accessToken) {
    return <Navigate replace to={resolveAuthRedirect(redirect)} />;
  }

  return (
    <section className="w-full max-w-[560px] rounded-feature bg-surface p-6 shadow-card sm:p-12 md:mt-12 [&_h1]:sm:text-3xl">
      <PageSEO description="Đăng ký tài khoản Fashion Shop để theo dõi đơn hàng và lưu địa chỉ." noIndex path={routes.register} title="Đăng ký tài khoản" />
      <AuthHeading centered description="Tạo tài khoản để lưu địa chỉ và theo dõi đơn hàng của bạn tại Fashion Shop." eyebrow="Thành viên Fashion Shop" title="Đăng ký tài khoản" />
      <RegisterForm onSuccess={() => navigate(resolveAuthRedirect(redirect), { replace: true })} />
      <p className="mt-4 text-center text-xs text-text-secondary">
        Đã có tài khoản?{' '}
        <Link className="inline-flex min-h-11 items-center font-semibold text-text-primary underline-offset-4 hover:underline" to={withRedirectParam(routePaths.loginRedirect(), redirect)}>
          Đăng nhập
        </Link>
      </p>
    </section>
  );
};

export default RegisterPage;
