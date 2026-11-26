import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { AuthError } from './AuthError';
import { AuthField } from './AuthField';
import { AuthSubmit } from './AuthSubmit';
import { useAuthAction } from '@/features/auth/hooks/useAuthAction';
import { useRegister } from '@/features/auth/hooks/useRegister';
import { applyAuthFormErrors, localizedPasswordMessage } from '@/features/auth/lib/authFormErrors';
import { registerSchema, type RegisterSchemaInput } from '@/features/auth/services/authSchemas';
import type { ServiceError } from '@/shared/lib/serviceError';

export const RegisterForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const [formError, setFormError] = useState<string | null>(null);
  const runAction = useAuthAction();
  const { mutateAsync, isPending } = useRegister();
  const { formState: { errors }, handleSubmit, register, setError } = useForm<RegisterSchemaInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { firstName: '', lastName: '', phoneNumber: '', email: '', password: '' },
  });

  const onSubmit = handleSubmit((values) => runAction(async () => {
    setFormError(null);
    try {
      await mutateAsync(values);
      onSuccess();
    } catch (error) {
      setFormError(applyAuthFormErrors(error as ServiceError, setError, {
        EMAIL_ALREADY_EXISTS: 'email',
        PHONE_ALREADY_EXISTS: 'phoneNumber',
      }));
    }
  }));

  return (
    <form className="space-y-5" noValidate onSubmit={onSubmit}>
      <AuthError message={formError} />
      <div className="grid gap-5 sm:grid-cols-2 sm:gap-4">
        <AuthField autoComplete="family-name" error={errors.lastName?.message} label="Họ và tên đệm (không bắt buộc)" placeholder="Trần" {...register('lastName')} />
        <AuthField autoComplete="given-name" error={errors.firstName?.message} label="Tên" placeholder="Mai" required {...register('firstName')} />
      </div>
      <AuthField autoComplete="email" error={errors.email?.message} label="Địa chỉ email" placeholder="mai.tran@example.com" required type="email" {...register('email')} />
      <AuthField autoComplete="tel" error={errors.phoneNumber?.message} label="Số điện thoại (không bắt buộc)" placeholder="0901234567" type="tel" {...register('phoneNumber')} />
      <div>
        <AuthField aria-describedby="register-password-rules" autoComplete="new-password" error={localizedPasswordMessage(errors.password?.message)} label="Mật khẩu" placeholder="Tạo mật khẩu" required type="password" {...register('password')} />
        <p className="mt-2 text-xs leading-relaxed text-text-secondary" id="register-password-rules">Dùng 8–64 ký tự, gồm chữ hoa, chữ thường và chữ số.</p>
      </div>
      <AuthSubmit busy={isPending} label="Đăng ký tài khoản" pending="Đang tạo tài khoản…" />
    </form>
  );
};
