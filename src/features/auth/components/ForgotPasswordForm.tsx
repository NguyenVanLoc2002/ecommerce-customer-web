import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { useForgotPassword } from '@/features/auth/hooks/useForgotPassword';
import { forgotPasswordSchema, type ForgotPasswordSchemaInput } from '@/features/auth/services/authSchemas';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import type { ServiceError } from '@/shared/lib/serviceError';

type ForgotPasswordFormProps = {
  defaultEmail?: string;
  onSuccess: (email: string) => void;
};

export const ForgotPasswordForm = ({ defaultEmail = '', onSuccess }: ForgotPasswordFormProps) => {
  const [formError, setFormError] = useState<string | null>(null);
  const { isPending, mutateAsync } = useForgotPassword();
  const {
    formState: { errors },
    handleSubmit,
    register,
    setError,
  } = useForm<ForgotPasswordSchemaInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: defaultEmail,
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);

    try {
      await mutateAsync({
        email: values.email.trim(),
      });
      onSuccess(values.email.trim());
    } catch (error) {
      const serviceError = error as ServiceError;
      if (serviceError.fieldErrors) {
        Object.entries(serviceError.fieldErrors).forEach(([field, message]) => {
          setError(field as keyof ForgotPasswordSchemaInput, { message });
        });
      }
      setFormError(serviceError.message);
    }
  });

  return (
    <form className="space-y-8" onSubmit={onSubmit}>
      <Input
        autoComplete="email"
        disabled={isPending}
        error={errors.email?.message}
        label="Email address"
        variant="auth"
        {...register('email')}
      />
      <p className="text-sm leading-7 text-text-secondary">
        Enter the email used for your customer account. If the address exists, we&apos;ll send a 6-digit verification
        code.
      </p>
      {formError ? <p className="text-sm text-danger">{formError}</p> : null}
      <Button disabled={isPending} fullWidth size="lg" type="submit">
        {isPending ? 'Sending code...' : 'Send verification code'}
      </Button>
    </form>
  );
};
