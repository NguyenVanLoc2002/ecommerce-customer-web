import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { useRegister } from '@/features/auth/hooks/useRegister';
import { registerSchema, type RegisterSchemaInput } from '@/features/auth/services/authSchemas';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import type { ServiceError } from '@/shared/lib/serviceError';

type RegisterFormProps = {
  onSuccess: () => void;
};

export const RegisterForm = ({ onSuccess }: RegisterFormProps) => {
  const [formError, setFormError] = useState<string | null>(null);
  const { mutateAsync, isPending } = useRegister();
  const {
    formState: { errors },
    handleSubmit,
    register,
    setError,
  } = useForm<RegisterSchemaInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      phoneNumber: '',
      email: '',
      password: '',
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
          setError(field as keyof RegisterSchemaInput, { message });
        });
      }
      setFormError(serviceError.message);
    }
  });

  return (
    <form className="space-y-8" onSubmit={onSubmit}>
      <div className="grid gap-8 md:grid-cols-2">
        <Input error={errors.firstName?.message} label="First name" variant="auth" {...register('firstName')} />
        <Input error={errors.lastName?.message} label="Last name" variant="auth" {...register('lastName')} />
      </div>
      <Input error={errors.phoneNumber?.message} label="Phone number" variant="auth" {...register('phoneNumber')} />
      <Input autoComplete="email" error={errors.email?.message} label="Email address" variant="auth" {...register('email')} />
      <Input
        autoComplete="new-password"
        error={errors.password?.message}
        label="Password"
        type="password"
        variant="auth"
        {...register('password')}
      />
      {formError ? <p className="text-sm text-danger">{formError}</p> : null}
      <Button disabled={isPending} fullWidth size="lg" type="submit">
        {isPending ? 'Creating account...' : 'Create account'}
      </Button>
    </form>
  );
};
