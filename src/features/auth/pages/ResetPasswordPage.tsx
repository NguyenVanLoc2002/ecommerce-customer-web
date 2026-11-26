import { ArrowLeft } from 'lucide-react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';

import { routes } from '@/constants/routes';
import { AuthHeading } from '@/features/auth/components/AuthHeading';
import { ResetPasswordForm } from '@/features/auth/components/ResetPasswordForm';
import type { ResetPasswordRouteState } from '@/features/auth/lib/authFlowState';
import { resolveAuthRedirect } from '@/features/auth/lib/resolveAuthRedirect';
import { PageSEO } from '@/shared/components/seo/PageSEO';
import { useAuthStore } from '@/shared/stores/authStore';
import { useUiStore } from '@/shared/stores/uiStore';

export const ResetPasswordPage = () => {
  const accessToken = useAuthStore((state) => state.accessToken);
  const addToast = useUiStore((state) => state.addToast);
  const location = useLocation();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const routeState = location.state as ResetPasswordRouteState | null;

  if (user && accessToken) {
    return <Navigate replace to={resolveAuthRedirect(null)} />;
  }

  if (!routeState?.resetToken) {
    return <Navigate replace to={routes.forgotPassword} />;
  }

  return (
    <div className="grid w-full max-w-[480px] items-start gap-12 lg:max-w-6xl lg:grid-cols-12 lg:px-8">
      <PageSEO description="Tạo mật khẩu mới cho tài khoản Fashion Shop." noIndex path={routes.resetPassword} title="Đặt lại mật khẩu" />
      <div className="hidden rounded-feature bg-surface-muted p-8 shadow-subtle lg:col-span-5 lg:block">
        <p className="mb-6 text-[11px] font-medium uppercase tracking-[0.22em] text-brand-primary">Bảo mật tài khoản</p>
        <div className="relative">
          <img alt="" className="aspect-[4/5] w-full rounded-card object-cover" height={286} src="/auth/reset.jpg" width={512} />
          <p className="absolute inset-x-0 bottom-0 rounded-b-card bg-gradient-to-t from-text-primary/85 to-transparent px-4 pb-4 pt-12 text-xs font-medium uppercase tracking-[0.2em] text-surface">Maison Aure · Fashion Shop</p>
        </div>
      </div>
      <div className="lg:col-span-7 lg:flex lg:justify-center">
        <section className="w-full max-w-[480px] overflow-hidden rounded-feature bg-surface shadow-card">
          <div className="p-6 sm:p-10 [&_h1]:sm:text-[28px]">
            <AuthHeading description="Mã xác thực hợp lệ. Hãy tạo mật khẩu mới cho tài khoản Fashion Shop của bạn." eyebrow="Khôi phục quyền truy cập" title="Đặt lại mật khẩu mới" />
            <ResetPasswordForm
              resetToken={routeState.resetToken}
              onSuccess={() => {
                addToast({
                  tone: 'success',
                  title: 'Đã đặt lại mật khẩu',
                  description: 'Đăng nhập bằng mật khẩu mới để tiếp tục mua sắm.',
                });
                navigate(routes.login, { replace: true });
              }}
            />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-x-3 bg-surface-muted px-6 py-2 text-xs text-text-secondary sm:px-10">
            <Link className="inline-flex min-h-11 items-center gap-1.5 underline-offset-4 hover:underline" to={routes.forgotPassword}>
              <ArrowLeft aria-hidden="true" className="size-4" />
              Yêu cầu mã mới
            </Link>
            <Link className="inline-flex min-h-11 items-center font-medium text-brand-primary underline-offset-4 hover:underline" to={routes.login}>Quay lại đăng nhập</Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
