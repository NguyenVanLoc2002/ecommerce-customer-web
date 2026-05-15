import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { useForgotPassword } from '@/features/auth/hooks/useForgotPassword';
import { useVerifyForgotPasswordOtp } from '@/features/auth/hooks/useVerifyForgotPasswordOtp';
import { verifyForgotPasswordOtpSchema, type VerifyForgotPasswordOtpSchemaInput } from '@/features/auth/services/authSchemas';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import type { ServiceError } from '@/shared/lib/serviceError';
import { useUiStore } from '@/shared/stores/uiStore';
import type { VerifyForgotPasswordOtpResponse } from '@/shared/types/auth.types';

const resendCooldownSeconds = 60;

type VerifyOtpFormProps = {
  email: string;
  onSuccess: (response: VerifyForgotPasswordOtpResponse) => void;
};

const formatCooldown = (seconds: number) => {
  const minutes = Math.floor(seconds / 60)
    .toString()
    .padStart(2, '0');
  const remainingSeconds = (seconds % 60).toString().padStart(2, '0');

  return `${minutes}:${remainingSeconds}`;
};

export const VerifyOtpForm = ({ email, onSuccess }: VerifyOtpFormProps) => {
  const addToast = useUiStore((state) => state.addToast);
  const [formError, setFormError] = useState<string | null>(null);
  const [cooldownSeconds, setCooldownSeconds] = useState(resendCooldownSeconds);
  const resendOtp = useForgotPassword();
  const verifyOtp = useVerifyForgotPasswordOtp();
  const {
    formState: { errors },
    handleSubmit,
    register,
    setError,
  } = useForm<VerifyForgotPasswordOtpSchemaInput>({
    resolver: zodResolver(verifyForgotPasswordOtpSchema),
    defaultValues: {
      otp: '',
    },
  });

  useEffect(() => {
    if (cooldownSeconds <= 0) {
      return;
    }

    const timer = window.setTimeout(() => {
      setCooldownSeconds((current) => current - 1);
    }, 1000);

    return () => {
      window.clearTimeout(timer);
    };
  }, [cooldownSeconds]);

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);

    try {
      const response = await verifyOtp.mutateAsync({
        email,
        otp: values.otp.trim(),
      });
      onSuccess(response);
    } catch (error) {
      const serviceError = error as ServiceError;
      if (serviceError.fieldErrors) {
        Object.entries(serviceError.fieldErrors).forEach(([field, message]) => {
          setError(field as keyof VerifyForgotPasswordOtpSchemaInput, { message });
        });
      }
      setFormError(serviceError.message);
    }
  });

  const handleResendOtp = async () => {
    setFormError(null);

    try {
      await resendOtp.mutateAsync({ email });
      setCooldownSeconds(resendCooldownSeconds);
      addToast({
        tone: 'info',
        title: 'Verification code sent',
        description: 'If the email exists, a new verification code has been sent.',
      });
    } catch (error) {
      setFormError((error as ServiceError).message);
    }
  };

  const isSubmitting = verifyOtp.isPending;
  const isResending = resendOtp.isPending;

  return (
    <form className="space-y-8" onSubmit={onSubmit}>
      <div className="border border-border bg-surface px-5 py-5">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-outline">Email</p>
        <p className="mt-3 text-sm leading-7 text-text-primary">{email}</p>
        <p className="mt-2 text-sm leading-7 text-text-secondary">
          Enter the 6-digit verification code sent to this inbox to continue the password reset flow.
        </p>
      </div>

      <Input
        autoComplete="one-time-code"
        disabled={isSubmitting}
        error={errors.otp?.message}
        inputMode="numeric"
        label="Verification code"
        maxLength={6}
        pattern="[0-9]*"
        placeholder="123456"
        variant="auth"
        {...register('otp')}
      />

      <div className="flex flex-col gap-3 border-t border-black/5 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-text-secondary">
          {cooldownSeconds > 0 ? `Resend available in ${formatCooldown(cooldownSeconds)}.` : 'Need another code?'}
        </p>
        <Button disabled={cooldownSeconds > 0 || isResending || isSubmitting} type="button" variant="ghost" onClick={() => void handleResendOtp()}>
          {isResending ? 'Sending...' : 'Resend code'}
        </Button>
      </div>

      {formError ? <p className="text-sm text-danger">{formError}</p> : null}

      <Button disabled={isSubmitting || isResending} fullWidth size="lg" type="submit">
        {isSubmitting ? 'Verifying...' : 'Verify code'}
      </Button>
    </form>
  );
};
