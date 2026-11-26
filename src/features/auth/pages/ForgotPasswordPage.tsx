import { ArrowLeft, LockKeyhole } from 'lucide-react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';

import { routes } from '@/constants/routes';
import { AuthHeading } from '@/features/auth/components/AuthHeading';
import { ForgotPasswordForm } from '@/features/auth/components/ForgotPasswordForm';
import { resolveAuthRedirect } from '@/features/auth/lib/resolveAuthRedirect';
import { PageSEO } from '@/shared/components/seo/PageSEO';
import { useAuthStore } from '@/shared/stores/authStore';
import { useUiStore } from '@/shared/stores/uiStore';

export const ForgotPasswordPage = () => {
  const accessToken = useAuthStore((state) => state.accessToken);
  const addToast = useUiStore((state) => state.addToast);
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((state) => state.user);

  if (user && accessToken) {
    return <Navigate replace to={resolveAuthRedirect(null)} />;
  }

  return (
    <div className="w-full max-w-[480px]">
      <PageSEO description="Yêu cầu mã xác thực để đặt lại mật khẩu Fashion Shop." noIndex path={routes.forgotPassword} title="Quên mật khẩu" />
      <p className="mb-6 text-xs font-medium uppercase tracking-[0.2em] text-brand-primary sm:mb-8">Bảo mật tài khoản</p>
      <section className="rounded-card bg-surface p-6 shadow-card sm:p-12 [&_h1]:sm:text-[26px]">
        <div aria-hidden="true" className="mb-6 grid size-10 place-items-center rounded-card bg-surface-muted text-brand-primary">
          <LockKeyhole className="size-5" />
        </div>
        <AuthHeading description="Nhập email bạn dùng để đăng ký Fashion Shop. Nếu email đã đăng ký, chúng tôi sẽ gửi mã xác thực gồm 6 chữ số." title="Quên mật khẩu?" />
        <ForgotPasswordForm
          defaultEmail={typeof location.state === 'object' && location.state && 'email' in location.state ? String(location.state.email ?? '') : ''}
          onSuccess={(email) => {
            addToast({
              tone: 'info',
              title: 'Đã tiếp nhận yêu cầu',
              description: 'Nếu email đã đăng ký, mã xác thực sẽ được gửi đến địa chỉ này.',
            });
            navigate(routes.verifyOtp, { replace: true, state: { email } });
          }}
        />
        <div className="mt-6 text-center">
          <Link className="inline-flex min-h-11 items-center gap-2 text-xs font-medium text-brand-primary underline-offset-4 hover:underline" to={routes.login}>
            <ArrowLeft aria-hidden="true" className="size-4" />
            Quay lại trang đăng nhập
          </Link>
        </div>
      </section>
    </div>
  );
};

export default ForgotPasswordPage;
