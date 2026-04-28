import { Link, useNavigate, useSearchParams } from 'react-router-dom';

import { routes } from '@/constants/routes';
import { LoginForm } from '@/features/auth/components/LoginForm';
import { PageSEO } from '@/shared/components/seo/PageSEO';

const resolveRedirect = (value: string | null) => (value && value.startsWith('/') ? value : routes.profile);

export const LoginPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  return (
    <>
      <PageSEO description="Sign in to manage orders, addresses, and future checkout flow." noIndex path={routes.login} title="Login" />
      <div className="text-center">
        <Link className="inline-block font-display text-[2rem] uppercase tracking-[0.3em] text-text-primary" to={routes.home}>
          AURA
        </Link>
        <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.22em] text-outline">Member Access</p>
      </div>
      <div className="mt-10">
        <LoginForm onSuccess={() => navigate(resolveRedirect(searchParams.get('redirect')), { replace: true })} />
      </div>
      <div className="mt-10 border-t border-black/5 pt-8 text-center">
        <p className="text-base text-text-secondary">Don&apos;t have an account?</p>
        <Link className="mt-4 inline-block border-b border-text-primary pb-1 text-[11px] font-bold uppercase tracking-[0.18em] text-text-primary transition-opacity hover:opacity-70" to={routes.register}>
          Create Account
        </Link>
      </div>
    </>
  );
};

export default LoginPage;
