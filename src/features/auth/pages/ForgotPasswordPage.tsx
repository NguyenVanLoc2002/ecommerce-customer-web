import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';

import { routes } from '@/constants/routes';
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
    <>
      <PageSEO description="Request a password reset verification code for your customer account." noIndex path={routes.forgotPassword} title="Forgot Password" />
      <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-outline">Password Recovery</p>
      <h1 className="mt-4 font-display text-[2.5rem] leading-[1.05] text-text-primary md:text-[3rem]">Forgot Password</h1>
      <p className="mt-4 max-w-md text-base leading-7 text-text-secondary">
        Restore account access with a one-time verification code delivered to your email address.
      </p>
      <div className="mt-10">
        <ForgotPasswordForm
          defaultEmail={typeof location.state === 'object' && location.state && 'email' in location.state ? String(location.state.email ?? '') : ''}
          onSuccess={(email) => {
            addToast({
              tone: 'info',
              title: 'Verification code sent',
              description: 'If the email exists, a verification code has been sent.',
            });
            navigate(routes.verifyOtp, {
              replace: true,
              state: {
                email,
              },
            });
          }}
        />
      </div>
      <div className="mt-10 border-t border-black/5 pt-8">
        <Link
          className="inline-block border-b border-text-primary pb-1 text-[11px] font-bold uppercase tracking-[0.18em] text-text-primary transition-opacity hover:opacity-70"
          to={routes.login}
        >
          Back to Login
        </Link>
      </div>
    </>
  );
};

export default ForgotPasswordPage;
