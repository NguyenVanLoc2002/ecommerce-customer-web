import { ShieldCheck } from 'lucide-react';

import { routes } from '@/constants/routes';
import { useLogout } from '@/features/auth/hooks/useLogout';
import { ChangePasswordForm } from '@/features/auth/components/ChangePasswordForm';
import { AccountShell } from '@/shared/components/layout/AccountShell';
import { Container } from '@/shared/components/layout/Container';
import { PageSEO } from '@/shared/components/seo/PageSEO';
import { Button } from '@/shared/components/ui/Button';

export const ProfileSecurityPage = () => {
  const logout = useLogout();

  return (
    <>
      <PageSEO description="Update your password and manage customer session security." noIndex path={routes.profileSecurity} title="Security" />
      <Container className="pb-16 pt-28 md:pb-20 md:pt-32">
        <AccountShell
          actions={
            <Button disabled={logout.isPending} variant="ghost" onClick={() => logout.mutate({ redirectTo: routes.home })}>
              {logout.isPending ? 'Signing out...' : 'Sign out'}
            </Button>
          }
          description="Cập nhật mật khẩu và quản lý phiên đăng nhập của bạn."
          eyebrow="Tài khoản / Bảo mật"
          title="Bảo mật"
        >
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
            <section className="border border-border bg-surface px-5 py-6 md:px-7">
              <p className="text-sm font-semibold text-text-primary">Đổi mật khẩu</p>
              <div className="mt-8">
                <ChangePasswordForm />
              </div>
            </section>

            <aside className="border border-border bg-surface px-5 py-6 md:px-6">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-surface-soft text-text-primary">
                <ShieldCheck className="h-5 w-5" strokeWidth={1.7} />
              </div>
              <h2 className="mt-5 text-lg font-semibold leading-snug text-text-primary">Bảo vệ phiên đăng nhập</h2>
              <p className="mt-4 text-sm leading-7 text-text-secondary">
                Password changes revoke the active refresh sessions on the backend. The storefront clears your in-memory
                access token, account caches, and checkout draft before returning you to sign-in.
              </p>
              <p className="mt-4 text-sm leading-7 text-text-secondary">
                The customer frontend never stores the refresh token, reset token, OTP, or password data in local or
                session storage.
              </p>
            </aside>
          </div>
        </AccountShell>
      </Container>
    </>
  );
};

export default ProfileSecurityPage;
