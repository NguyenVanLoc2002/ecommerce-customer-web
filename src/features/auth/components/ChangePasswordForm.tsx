import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { useChangePassword } from '@/features/auth/hooks/useChangePassword';
import { changePasswordSchema, type ChangePasswordSchemaInput } from '@/features/auth/services/authSchemas';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import type { ServiceError } from '@/shared/lib/serviceError';

export const ChangePasswordForm = () => {
  const [formError, setFormError] = useState<string | null>(null);
  const changePassword = useChangePassword();
  const {
    formState: { errors },
    handleSubmit,
    register,
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
    <form className="space-y-8" onSubmit={onSubmit}>
      <Input
        autoComplete="current-password"
        disabled={changePassword.isPending}
        error={errors.currentPassword?.message}
        label="Current password"
        type="password"
        {...register('currentPassword')}
      />
      <Input
        autoComplete="new-password"
        disabled={changePassword.isPending}
        error={errors.newPassword?.message}
        label="New password"
        type="password"
        {...register('newPassword')}
      />
      <Input
        autoComplete="new-password"
        disabled={changePassword.isPending}
        error={errors.confirmPassword?.message}
        label="Confirm new password"
        type="password"
        {...register('confirmPassword')}
      />
      <p className="text-sm leading-7 text-text-secondary">
        Updating your password revokes the current refresh sessions. You&apos;ll be asked to sign in again after the
        change is applied.
      </p>
      {formError ? <p className="text-sm text-danger">{formError}</p> : null}
      <Button disabled={changePassword.isPending} size="lg" type="submit">
        {changePassword.isPending ? 'Updating...' : 'Update password'}
      </Button>
    </form>
  );
};
