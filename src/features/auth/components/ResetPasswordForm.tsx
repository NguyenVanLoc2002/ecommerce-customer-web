import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Circle, CircleCheck } from 'lucide-react';

import { AuthError } from './AuthError';
import { AuthField } from './AuthField';
import { AuthSubmit } from './AuthSubmit';
import { useAuthAction } from '@/features/auth/hooks/useAuthAction';
import { useResetPassword } from '@/features/auth/hooks/useResetPassword';
import { applyAuthFormErrors, localizedPasswordMessage } from '@/features/auth/lib/authFormErrors';
import { resetPasswordSchema, type ResetPasswordSchemaInput } from '@/features/auth/services/authSchemas';
import type { ServiceError } from '@/shared/lib/serviceError';

type ResetPasswordFormProps = {
  resetToken: string;
  onSuccess: () => void;
};

export const ResetPasswordForm = ({ onSuccess, resetToken }: ResetPasswordFormProps) => {
  const [formError, setFormError] = useState<string | null>(null);
  const runAction = useAuthAction();
  const { isPending, mutateAsync } = useResetPassword();
  const { control, formState: { errors }, handleSubmit, register, setError } = useForm<ResetPasswordSchemaInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { newPassword: '', confirmPassword: '' },
  });
  const password = useWatch({ control, name: 'newPassword' });
  const rules = [
    { label: 'Từ 8 đến 64 ký tự', met: password.length >= 8 && password.length <= 64 },
    { label: 'Có ít nhất một chữ hoa và một chữ thường', met: /[A-Z]/.test(password) && /[a-z]/.test(password) },
    { label: 'Có ít nhất một chữ số', met: /\d/.test(password) },
  ];

  const onSubmit = handleSubmit((values) => runAction(async () => {
    setFormError(null);
    try {
      await mutateAsync({ resetToken, newPassword: values.newPassword, confirmPassword: values.confirmPassword });
      onSuccess();
    } catch (error) {
      setFormError(applyAuthFormErrors(error as ServiceError, setError, {
        PASSWORD_REUSED: 'newPassword',
        PASSWORD_MISMATCH: 'confirmPassword',
      }));
    }
  }));

  return (
    <form className="space-y-5" noValidate onSubmit={onSubmit}>
      <AuthError message={formError} />
      <AuthField aria-describedby="reset-password-rules" autoComplete="new-password" disabled={isPending} error={localizedPasswordMessage(errors.newPassword?.message)} label="Mật khẩu mới" placeholder="Nhập mật khẩu mới" required type="password" {...register('newPassword')} />
      <div className="space-y-2 rounded-card bg-surface-muted p-4 text-xs text-text-secondary" id="reset-password-rules">
        <p className="font-semibold uppercase tracking-wider text-brand-primary">Yêu cầu mật khẩu</p>
        <ul className="space-y-2">
          {rules.map(({ label, met }) => {
            const Icon = met ? CircleCheck : Circle;
            return <li className="flex items-center gap-2" key={label}><Icon aria-hidden="true" className="size-4 shrink-0 text-brand-primary" /><span>{label}</span><span className="sr-only">{met ? 'Đạt' : 'Chưa đạt'}</span></li>;
          })}
        </ul>
      </div>
      <AuthField autoComplete="new-password" disabled={isPending} error={errors.confirmPassword?.message} label="Xác nhận mật khẩu mới" placeholder="Nhập lại mật khẩu mới" required type="password" {...register('confirmPassword')} />
      <AuthSubmit busy={isPending} label="Cập nhật mật khẩu" pending="Đang cập nhật…" />
    </form>
  );
};
