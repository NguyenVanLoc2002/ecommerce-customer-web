import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';

import { routePaths, routes } from '@/constants/routes';
import { LoginForm } from '@/features/auth/components/LoginForm';
import { resolveAuthRedirect, withRedirectParam } from '@/features/auth/lib/resolveAuthRedirect';
import { PageSEO } from '@/shared/components/seo/PageSEO';
import { useAuthStore } from '@/shared/stores/authStore';

const getLoginContextCopy = (redirect: string | null) => {
  if (!redirect) {
    return null;
  }

  if (redirect.startsWith(routes.cart) || redirect.startsWith('/products/')) {
    return 'Sign in to add items to your bag and continue shopping.';
  }

  if (redirect.startsWith('/checkout')) {
    return 'Sign in to continue checkout and keep your order moving.';
  }

  if (redirect.startsWith('/orders')) {
    return 'Sign in to view your order details and account activity.';
  }

  return 'Sign in to continue where you left off.';
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
    <>
      <PageSEO description="Sign in to manage orders, addresses, and future checkout flow." noIndex path={routes.login} title="Login" />
      <div className="text-center">
        <Link className="inline-block font-display text-[2rem] uppercase tracking-[0.3em] text-text-primary" to={routes.home}>
          AURA
        </Link>
        <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.22em] text-outline">Member Access</p>
      </div>
      {loginContextCopy ? (
        <div className="mt-8 border border-border bg-surface-muted px-5 py-4 text-left">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-outline">Sign-in required</p>
          <p className="mt-2 text-sm leading-7 text-text-secondary">{loginContextCopy}</p>
        </div>
      ) : null}
      <div className="mt-10">
        <LoginForm onSuccess={() => navigate(resolveAuthRedirect(redirect), { replace: true })} />
      </div>
      <div className="mt-6 text-right">
        <Link
          className="inline-block border-b border-text-primary pb-1 text-[11px] font-bold uppercase tracking-[0.18em] text-text-primary transition-opacity hover:opacity-70"
          to={routes.forgotPassword}
        >
          Forgot password?
        </Link>
      </div>
      <div className="mt-10 border-t border-black/5 pt-8 text-center">
        <p className="text-base text-text-secondary">Don&apos;t have an account?</p>
        <Link
          className="mt-4 inline-block border-b border-text-primary pb-1 text-[11px] font-bold uppercase tracking-[0.18em] text-text-primary transition-opacity hover:opacity-70"
          to={withRedirectParam(routePaths.registerRedirect(), redirect)}
        >
          Create Account
        </Link>
      </div>
    </>
  );
};

export default LoginPage;
