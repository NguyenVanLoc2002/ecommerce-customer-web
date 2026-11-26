import { ArrowLeft, LockKeyhole, Pencil } from 'lucide-react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';

import { routes } from '@/constants/routes';
import { AuthHeading } from '@/features/auth/components/AuthHeading';
import { VerifyOtpForm } from '@/features/auth/components/VerifyOtpForm';
import type { ForgotPasswordRouteState } from '@/features/auth/lib/authFlowState';
import { resolveAuthRedirect } from '@/features/auth/lib/resolveAuthRedirect';
import { PageSEO } from '@/shared/components/seo/PageSEO';
import { useAuthStore } from '@/shared/stores/authStore';

export const VerifyOtpPage = () => {
  const accessToken = useAuthStore((state) => state.accessToken);
  const location = useLocation();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const routeState = location.state as ForgotPasswordRouteState | null;

  if (user && accessToken) {
    return <Navigate replace to={resolveAuthRedirect(null)} />;
  }

  if (!routeState?.email) {
    return <Navigate replace to={routes.forgotPassword} />;
  }

  return (
    <div className="w-full max-w-[480px]">
      <PageSEO description="Xác thực mã để tiếp tục đặt lại mật khẩu Fashion Shop." noIndex path={routes.verifyOtp} title="Xác thực mã bảo mật" />
      <p className="mb-6 text-center text-xs uppercase tracking-[0.14em] text-text-secondary sm:mb-8">Khôi phục quyền truy cập / Xác thực OTP</p>
      <section className="rounded-card bg-surface p-6 shadow-card sm:px-10 sm:py-12 [&_h1]:sm:text-[26px]">
        <div aria-hidden="true" className="mx-auto mb-5 grid size-12 place-items-center rounded-full bg-brand-subtle text-brand-primary">
          <LockKeyhole className="size-5" />
        </div>
        <AuthHeading
          centered
          description={<>Nhập mã gồm 6 chữ số gửi đến <strong className="font-medium text-text-primary">{routeState.email}</strong> nếu email đã đăng ký.</>}
          eyebrow="Bảo mật tài khoản"
          title="Xác thực mã bảo mật"
        />
        <VerifyOtpForm
          email={routeState.email}
          onSuccess={(response) => {
            navigate(routes.resetPassword, {
              replace: true,
              state: { email: routeState.email, expiresAt: response.expiresAt, resetToken: response.resetToken },
            });
          }}
        />
        <div className="mt-6 flex flex-wrap justify-between gap-x-3 text-xs text-text-secondary">
          <Link className="inline-flex min-h-11 items-center gap-1.5 underline-offset-4 hover:underline" state={{ email: routeState.email }} to={routes.forgotPassword}>
            <Pencil aria-hidden="true" className="size-4" />
            Đổi địa chỉ email
          </Link>
          <Link className="inline-flex min-h-11 items-center gap-1.5 underline-offset-4 hover:underline" to={routes.login}>
            <ArrowLeft aria-hidden="true" className="size-4" />
            Quay lại đăng nhập
          </Link>
        </div>
      </section>
    </div>
  );
};

export default VerifyOtpPage;
