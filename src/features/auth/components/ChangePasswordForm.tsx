import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { useChangePassword } from '@/features/auth/hooks/useChangePassword';
import { changePasswordSchema, type ChangePasswordSchemaInput } from '@/features/auth/services/authSchemas';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import type { ServiceError } from '@/shared/lib/serviceError';

const fields = [
  { name: 'currentPassword', label: 'Mật khẩu hiện tại', autoComplete: 'current-password' },
  { name: 'newPassword', label: 'Mật khẩu mới', autoComplete: 'new-password' },
  { name: 'confirmPassword', label: 'Xác nhận mật khẩu mới', autoComplete: 'new-password' },
] as const;

export const ChangePasswordForm = () => {
  const [formError, setFormError] = useState<string | null>(null);
  const [visibleField, setVisibleField] = useState<keyof ChangePasswordSchemaInput | null>(null);
  const changePassword = useChangePassword();
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
    setError,
  } = useForm<ChangePasswordSchemaInput>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);

    try {
      await changePassword.mutateAsync(values);
    } catch (error) {
      const serviceError = error as ServiceError;
      if (serviceError.fieldErrors) {
        Object.entries(serviceError.fieldErrors).forEach(([field, message]) => {
          setError(field as keyof ChangePasswordSchemaInput, { message });
        });
      }
      setFormError(serviceError.message);
    }
  });

  return (
    <form aria-busy={isSubmitting} className="space-y-6" onSubmit={onSubmit}>
      <fieldset className="min-w-0 space-y-6" disabled={isSubmitting}>
        {fields.map(({ name, label, autoComplete }) => {
          const visible = visibleField === name;

          return (
            <div className="relative" key={name}>
              <Input
                aria-required="true"
                autoComplete={autoComplete}
                className="pr-12"
                error={errors[name]?.message}
                label={label}
                type={visible ? 'text' : 'password'}
                {...register(name)}
              />
              <button
                aria-label={visible ? 'Ẩn ' + label.toLowerCase() : 'Hiện ' + label.toLowerCase()}
                className="absolute right-0 top-7 flex h-11 w-11 items-center justify-center rounded-button text-text-secondary hover:text-brand-primary"
                onClick={() => setVisibleField(visible ? null : name)}
                type="button"
              >
                {visible ? <EyeOff aria-hidden="true" className="h-5 w-5" /> : <Eye aria-hidden="true" className="h-5 w-5" />}
              </button>
              {name === 'newPassword' ? (
                <div className="mt-5 rounded-input bg-surface-muted p-4 text-sm text-text-secondary">
                  <p className="font-semibold text-text-primary">Yêu cầu mật khẩu</p>
                  <ul className="mt-2 list-disc space-y-1 pl-5">
                    <li>Từ 8 đến 64 ký tự</li>
                    <li>Có chữ hoa, chữ thường và ít nhất một chữ số</li>
                    <li>Khác mật khẩu hiện tại</li>
                  </ul>
                </div>
              ) : null}
            </div>
          );
        })}
      </fieldset>
      <p className="text-sm leading-6 text-text-secondary">Bạn sẽ cần đăng nhập lại sau khi đổi mật khẩu.</p>
      {formError ? <p className="text-sm text-danger" role="alert">{formError}</p> : null}
      <div className="grid gap-3 sm:flex">
        <Button className="account-primary-action" loading={isSubmitting} type="submit">Cập nhật mật khẩu</Button>
        <Button
          className="account-secondary-action"
          disabled={isSubmitting}
          onClick={() => {
            reset();
            setFormError(null);
            setVisibleField(null);
          }}
          variant="secondary"
        >
          Hủy
        </Button>
      </div>
    </form>
  );
};
