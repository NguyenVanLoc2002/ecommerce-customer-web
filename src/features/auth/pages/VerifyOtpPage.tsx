import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';

import { routes } from '@/constants/routes';
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
    <>
      <PageSEO description="Verify the reset code for your customer password recovery flow." noIndex path={routes.verifyOtp} title="Verify Code" />
      <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-outline">Identity Check</p>
      <h1 className="mt-4 font-display text-[2.5rem] leading-[1.05] text-text-primary md:text-[3rem]">Verify OTP</h1>
      <p className="mt-4 max-w-md text-base leading-7 text-text-secondary">
        Confirm the 6-digit code from your inbox to unlock the password reset step.
      </p>
      <div className="mt-10">
        <VerifyOtpForm
          email={routeState.email}
          onSuccess={(response) => {
            navigate(routes.resetPassword, {
              replace: true,
              state: {
                email: routeState.email,
                expiresAt: response.expiresAt,
                resetToken: response.resetToken,
              },
            });
          }}
        />
      </div>
      <div className="mt-10 border-t border-black/5 pt-8">
        <Link
          className="inline-block border-b border-text-primary pb-1 text-[11px] font-bold uppercase tracking-[0.18em] text-text-primary transition-opacity hover:opacity-70"
          to={routes.forgotPassword}
          state={{ email: routeState.email }}
        >
          Use another email
        </Link>
      </div>
    </>
  );
};

export default VerifyOtpPage;
