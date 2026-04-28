import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { useLogin } from '@/features/auth/hooks/useLogin';
import { loginSchema, type LoginSchemaInput } from '@/features/auth/services/authSchemas';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import type { ServiceError } from '@/shared/lib/serviceError';

type LoginFormProps = {
  onSuccess: () => void;
};

export const LoginForm = ({ onSuccess }: LoginFormProps) => {
  const [formError, setFormError] = useState<string | null>(null);
  const { mutateAsync, isPending } = useLogin();
  const {
    formState: { errors },
    handleSubmit,
    register,
    setError,
  } = useForm<LoginSchemaInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'customer@fashion-shop.com',
      password: 'Customer123!',
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);

    try {
      await mutateAsync(values);
      onSuccess();
    } catch (error) {
      const serviceError = error as ServiceError;
      if (serviceError.fieldErrors) {
        Object.entries(serviceError.fieldErrors).forEach(([field, message]) => {
          setError(field as keyof LoginSchemaInput, { message });
        });
      }
      setFormError(serviceError.message);
    }
  });

  return (
    <form className="space-y-8" onSubmit={onSubmit}>
      <Input autoComplete="email" error={errors.email?.message} label="Email address" variant="auth" {...register('email')} />
      <Input
        autoComplete="current-password"
        error={errors.password?.message}
        label="Password"
        type="password"
        variant="auth"
        {...register('password')}
      />
      {formError ? <p className="text-sm text-danger">{formError}</p> : null}
      <Button disabled={isPending} fullWidth size="lg" type="submit">
        {isPending ? 'Signing in...' : 'Sign in'}
      </Button>
    </form>
  );
};
