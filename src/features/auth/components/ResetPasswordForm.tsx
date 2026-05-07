import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { useResetPassword } from '@/features/auth/hooks/useResetPassword';
import { resetPasswordSchema, type ResetPasswordSchemaInput } from '@/features/auth/services/authSchemas';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import type { ServiceError } from '@/shared/lib/serviceError';

type ResetPasswordFormProps = {
  resetToken: string;
  onSuccess: () => void;
};

export const ResetPasswordForm = ({ onSuccess, resetToken }: ResetPasswordFormProps) => {
  const [formError, setFormError] = useState<string | null>(null);
  const { isPending, mutateAsync } = useResetPassword();
  const {
    formState: { errors },
    handleSubmit,
    register,
    setError,
  } = useForm<ResetPasswordSchemaInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);

    try {
      await mutateAsync({
        resetToken,
        newPassword: values.newPassword,
        confirmPassword: values.confirmPassword,
      });
      onSuccess();
    } catch (error) {
      const serviceError = error as ServiceError;
      if (serviceError.fieldErrors) {
        Object.entries(serviceError.fieldErrors).forEach(([field, message]) => {
          setError(field as keyof ResetPasswordSchemaInput, { message });
        });
      }
      setFormError(serviceError.message);
    }
  });

  return (
    <form className="space-y-8" onSubmit={onSubmit}>
      <Input
        autoComplete="new-password"
        disabled={isPending}
        error={errors.newPassword?.message}
        label="New password"
        type="password"
        variant="auth"
        {...register('newPassword')}
      />
      <Input
        autoComplete="new-password"
        disabled={isPending}
        error={errors.confirmPassword?.message}
        label="Confirm new password"
        type="password"
        variant="auth"
        {...register('confirmPassword')}
      />
      <p className="text-sm leading-7 text-text-secondary">
        Use 8-64 characters with at least one lowercase letter, one uppercase letter, and one number.
      </p>
      {formError ? <p className="text-sm text-danger">{formError}</p> : null}
      <Button disabled={isPending} fullWidth size="lg" type="submit">
        {isPending ? 'Updating password...' : 'Reset password'}
      </Button>
    </form>
  );
};
