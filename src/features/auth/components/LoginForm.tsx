import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AtSign } from 'lucide-react';
import { Link } from 'react-router-dom';

import { routes } from '@/constants/routes';
import { AuthError } from './AuthError';
import { AuthField } from './AuthField';
import { AuthSubmit } from './AuthSubmit';
import { useAuthAction } from '@/features/auth/hooks/useAuthAction';
import { useLogin } from '@/features/auth/hooks/useLogin';
import { applyAuthFormErrors } from '@/features/auth/lib/authFormErrors';
import { loginSchema, type LoginSchemaInput } from '@/features/auth/services/authSchemas';
import type { ServiceError } from '@/shared/lib/serviceError';

export const LoginForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const [formError, setFormError] = useState<string | null>(null);
  const runAction = useAuthAction();
  const { mutateAsync, isPending } = useLogin();
  const { formState: { errors }, handleSubmit, register, setError } = useForm<LoginSchemaInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = handleSubmit((values) => runAction(async () => {
    setFormError(null);
    try {
      await mutateAsync(values);
      onSuccess();
    } catch (error) {
      setFormError(applyAuthFormErrors(error as ServiceError, setError));
    }
  }));

  return (
    <form className="space-y-5" noValidate onSubmit={onSubmit}>
      <AuthError message={formError} />
      <AuthField autoComplete="username" error={errors.email?.message} icon={<AtSign size={17} />} label="Địa chỉ email" placeholder="mai.tran@example.com" required type="email" {...register('email')} />
      <AuthField
        autoComplete="current-password"
        error={errors.password?.message}
        label="Mật khẩu"
        labelAction={<Link className="relative text-xs font-medium text-brand-primary underline-offset-4 after:absolute after:inset-x-0 after:-bottom-2 after:-top-5 hover:underline" to={routes.forgotPassword}>Quên mật khẩu?</Link>}
        placeholder="Nhập mật khẩu"
        required
        type="password"
        {...register('password')}
      />
      <AuthSubmit busy={isPending} label="Đăng nhập" pending="Đang đăng nhập…" />
    </form>
  );
};
