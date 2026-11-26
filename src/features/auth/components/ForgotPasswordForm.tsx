import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail } from 'lucide-react';

import { AuthError } from './AuthError';
import { AuthField } from './AuthField';
import { AuthSubmit } from './AuthSubmit';
import { useAuthAction } from '@/features/auth/hooks/useAuthAction';
import { useForgotPassword } from '@/features/auth/hooks/useForgotPassword';
import { applyAuthFormErrors } from '@/features/auth/lib/authFormErrors';
import { forgotPasswordSchema, type ForgotPasswordSchemaInput } from '@/features/auth/services/authSchemas';
import type { ServiceError } from '@/shared/lib/serviceError';

type ForgotPasswordFormProps = {
  defaultEmail?: string;
  onSuccess: (email: string) => void;
};

export const ForgotPasswordForm = ({ defaultEmail = '', onSuccess }: ForgotPasswordFormProps) => {
  const [formError, setFormError] = useState<string | null>(null);
  const runAction = useAuthAction();
  const { isPending, mutateAsync } = useForgotPassword();
  const { formState: { errors }, handleSubmit, register, setError } = useForm<ForgotPasswordSchemaInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: defaultEmail },
  });

  const onSubmit = handleSubmit((values) => runAction(async () => {
    setFormError(null);
    try {
      await mutateAsync({ email: values.email.trim() });
      onSuccess(values.email.trim());
    } catch (error) {
      setFormError(applyAuthFormErrors(error as ServiceError, setError));
    }
  }));

  return (
    <form className="space-y-6" noValidate onSubmit={onSubmit}>
      <AuthError message={formError} />
      <AuthField autoComplete="email" disabled={isPending} error={errors.email?.message} icon={<Mail size={17} />} label="Địa chỉ email đã đăng ký" placeholder="mai.tran@example.com" required type="email" {...register('email')} />
      <AuthSubmit busy={isPending} label="Gửi mã xác thực OTP" pending="Đang gửi mã…" />
    </form>
  );
};
