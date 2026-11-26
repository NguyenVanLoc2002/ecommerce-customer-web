import { useEffect, useId, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Clock3 } from 'lucide-react';

import { AuthError } from './AuthError';
import { AuthSubmit } from './AuthSubmit';
import { useAuthAction } from '@/features/auth/hooks/useAuthAction';
import { useForgotPassword } from '@/features/auth/hooks/useForgotPassword';
import { useVerifyForgotPasswordOtp } from '@/features/auth/hooks/useVerifyForgotPasswordOtp';
import { applyAuthFormErrors, authErrorMessage } from '@/features/auth/lib/authFormErrors';
import { verifyForgotPasswordOtpSchema, type VerifyForgotPasswordOtpSchemaInput } from '@/features/auth/services/authSchemas';
import { cn } from '@/shared/utils/cn';
import type { ServiceError } from '@/shared/lib/serviceError';
import { useUiStore } from '@/shared/stores/uiStore';
import type { VerifyForgotPasswordOtpResponse } from '@/shared/types/auth.types';

const resendCooldownSeconds = 60;

type VerifyOtpFormProps = {
  email: string;
  onSuccess: (response: VerifyForgotPasswordOtpResponse) => void;
};

const formatCooldown = (seconds: number) =>
  `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;

export const VerifyOtpForm = ({ email, onSuccess }: VerifyOtpFormProps) => {
  const addToast = useUiStore((state) => state.addToast);
  const inputId = useId();
  const runAction = useAuthAction();
  const [formError, setFormError] = useState<string | null>(null);
  const [cooldownSeconds, setCooldownSeconds] = useState(resendCooldownSeconds);
  const resendOtp = useForgotPassword();
  const verifyOtp = useVerifyForgotPasswordOtp();
  const { control, formState: { errors }, handleSubmit, register, setError } = useForm<VerifyForgotPasswordOtpSchemaInput>({
    resolver: zodResolver(verifyForgotPasswordOtpSchema),
    defaultValues: { otp: '' },
  });
  const otp = useWatch({ control, name: 'otp' });
  const busy = resendOtp.isPending || verifyOtp.isPending;

  useEffect(() => {
    if (cooldownSeconds <= 0) return;
    const timer = window.setTimeout(() => setCooldownSeconds((current) => current - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [cooldownSeconds]);

  const onSubmit = handleSubmit((values) => runAction(async () => {
    setFormError(null);
    try {
      const response = await verifyOtp.mutateAsync({ email, otp: values.otp.trim() });
      onSuccess(response);
    } catch (error) {
      setFormError(applyAuthFormErrors(error as ServiceError, setError));
    }
  }));

  const handleResendOtp = () => runAction(async () => {
    setFormError(null);
    try {
      await resendOtp.mutateAsync({ email });
      setCooldownSeconds(resendCooldownSeconds);
      addToast({
        tone: 'info',
        title: 'Đã yêu cầu mã mới',
        description: 'Nếu email đã đăng ký, mã xác thực mới sẽ được gửi đến địa chỉ này.',
      });
    } catch (error) {
      setFormError(authErrorMessage(error as ServiceError));
    }
  });

  return (
    <form className="space-y-5" noValidate onSubmit={onSubmit}>
      <AuthError message={formError} />
      <div>
        <label className="mb-2 block text-xs font-medium text-text-primary sm:sr-only" htmlFor={inputId}>Mã xác thực 6 chữ số</label>
        <div className="relative">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 hidden grid-cols-6 gap-2 sm:grid">
            {Array.from({ length: 6 }, (_, index) => (
              <span className={cn('grid place-items-center rounded-input border bg-surface-muted text-xl font-semibold', errors.otp && 'border-danger')} key={index}>
                {otp[index]}
              </span>
            ))}
          </div>
          <input
            aria-describedby={errors.otp ? `${inputId}-error` : undefined}
            aria-invalid={errors.otp ? true : undefined}
            autoComplete="one-time-code"
            className={cn(
              'relative block h-12 w-full rounded-input border bg-surface-muted px-3 text-base placeholder:text-text-secondary/70 sm:h-14 sm:border-transparent sm:bg-transparent sm:text-transparent sm:caret-transparent sm:placeholder:text-transparent',
              errors.otp && 'border-danger',
            )}
            disabled={busy}
            id={inputId}
            inputMode="numeric"
            maxLength={6}
            pattern="[0-9]*"
            placeholder="Nhập 6 chữ số"
            required
            {...register('otp')}
          />
        </div>
        {errors.otp && <p className="mt-1.5 text-xs text-danger" id={`${inputId}-error`} role="alert">{errors.otp.message}</p>}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-x-2 text-xs text-text-secondary">
        <span className="inline-flex items-center gap-1.5">
          <Clock3 aria-hidden="true" className="size-4 text-brand-primary" />
          {cooldownSeconds > 0 ? `Gửi lại sau ${formatCooldown(cooldownSeconds)}` : 'Bạn chưa nhận được mã?'}
        </span>
        <button className="min-h-11 font-medium text-brand-primary underline-offset-4 hover:underline disabled:text-text-secondary disabled:no-underline" disabled={cooldownSeconds > 0 || busy} onClick={() => void handleResendOtp()} type="button">
          {resendOtp.isPending ? 'Đang gửi mã…' : 'Gửi lại mã OTP'}
        </button>
      </div>
      <AuthSubmit busy={verifyOtp.isPending} disabled={resendOtp.isPending} label="Xác nhận mã OTP" pending="Đang xác thực…" />
    </form>
  );
};
