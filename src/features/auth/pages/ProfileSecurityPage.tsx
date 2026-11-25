import { LogOut } from 'lucide-react';

import { routes } from '@/constants/routes';
import { ChangePasswordForm } from '@/features/auth/components/ChangePasswordForm';
import { useLogout } from '@/features/auth/hooks/useLogout';
import { AccountWorkspace } from '@/shared/components/layout/AccountWorkspace';
import { PageSEO } from '@/shared/components/seo/PageSEO';
import { Button } from '@/shared/components/ui/Button';

export const ProfileSecurityPage = () => {
  const logout = useLogout();

  return (
    <>
      <PageSEO description="Đổi mật khẩu tài khoản Fashion Shop." noIndex path={routes.profileSecurity} title="Bảo mật tài khoản" />
      <AccountWorkspace
        description="Đổi mật khẩu để bảo vệ tài khoản của bạn."
        sessionAction={
          <Button className="account-secondary-action w-full lg:justify-start" loading={logout.isPending} onClick={() => logout.mutate({ redirectTo: routes.home })} variant="ghost">
            <LogOut aria-hidden="true" className="h-4 w-4" />
            Đăng xuất
          </Button>
        }
        title="Bảo mật tài khoản"
      >
        <section aria-labelledby="change-password-title" className="max-w-2xl rounded-card border border-border bg-surface p-5 sm:p-8">
          <h2 className="mb-5 text-lg font-semibold" id="change-password-title">Đổi mật khẩu</h2>
          <ChangePasswordForm />
        </section>
      </AccountWorkspace>
    </>
  );
};

export default ProfileSecurityPage;
