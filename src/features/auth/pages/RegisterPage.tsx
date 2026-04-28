import { Link, useNavigate, useSearchParams } from 'react-router-dom';

import { routes } from '@/constants/routes';
import { RegisterForm } from '@/features/auth/components/RegisterForm';
import { PageSEO } from '@/shared/components/seo/PageSEO';

const resolveRedirect = (value: string | null) => (value && value.startsWith('/') ? value : routes.profile);

export const RegisterPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  return (
    <>
      <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-outline">Refining the Essence of Form</p>
      <h1 className="mt-4 font-display text-[2.5rem] leading-[1.05] text-text-primary md:text-[3rem]">Create Account</h1>
      <p className="mt-4 max-w-md text-base leading-7 text-text-secondary">
        Build your profile for order history, address book access, and future editorial commerce releases.
      </p>
      <div className="mt-10">
        <RegisterForm onSuccess={() => navigate(resolveRedirect(searchParams.get('redirect')), { replace: true })} />
      </div>
      <div className="mt-10 border-t border-black/5 pt-8">
        <Link className="inline-block border-b border-text-primary pb-1 text-[11px] font-bold uppercase tracking-[0.18em] text-text-primary transition-opacity hover:opacity-70" to={routes.login}>
          Login to Profile
        </Link>
      </div>
      <PageSEO description="Create a customer account for faster checkout and order tracking." noIndex path={routes.register} title="Register" />
    </>
  );
};

export default RegisterPage;
