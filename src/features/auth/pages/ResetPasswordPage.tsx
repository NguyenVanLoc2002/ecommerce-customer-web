import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';

import { routes } from '@/constants/routes';
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
    <>
      <PageSEO description="Set a new password for your customer account." noIndex path={routes.resetPassword} title="Reset Password" />
      <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-outline">Final Step</p>
      <h1 className="mt-4 font-display text-[2.5rem] leading-[1.05] text-text-primary md:text-[3rem]">Reset Password</h1>
      <p className="mt-4 max-w-md text-base leading-7 text-text-secondary">
        Create a new password for {routeState.email}. Reset tokens stay in memory only and expire automatically.
      </p>
      <div className="mt-10">
        <ResetPasswordForm
          resetToken={routeState.resetToken}
          onSuccess={() => {
            addToast({
              tone: 'success',
              title: 'Password reset complete',
              description: 'Sign in with your new password to continue shopping.',
            });
            navigate(routes.login, { replace: true });
          }}
        />
      </div>
      <div className="mt-10 border-t border-black/5 pt-8">
        <Link
          className="inline-block border-b border-text-primary pb-1 text-[11px] font-bold uppercase tracking-[0.18em] text-text-primary transition-opacity hover:opacity-70"
          to={routes.forgotPassword}
        >
          Restart reset flow
        </Link>
      </div>
    </>
  );
};

export default ResetPasswordPage;
