import { useState } from 'react';
import { Mail } from 'lucide-react';

import { useEmailVerification } from '@/features/profile/hooks/useEmailVerification';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';

export const EmailVerification = ({ email }: { email: string }) => {
  const [otp, setOtp] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const { request, confirm } = useEmailVerification();
  const pending = request.isPending || confirm.isPending;

  return (
    <section aria-labelledby="verify-email-title" className="rounded-card border border-border bg-surface p-5 sm:p-8">
      <h2 className="flex items-center gap-2 font-semibold" id="verify-email-title">
        <Mail aria-hidden="true" className="h-5 w-5 text-brand-primary" /> Xác thực email
      </h2>
      <p className="mt-2 break-words text-sm text-text-secondary">Mã xác thực sẽ được gửi đến {email}.</p>
      <div className="mt-4">
        <Button
          className="account-secondary-action"
          disabled={confirm.isPending}
          loading={request.isPending}
          onClick={() => request.mutate(undefined, { onSuccess: () => { setOtp(''); confirm.reset(); setCodeSent(true); } })}
          variant="secondary"
        >
          {codeSent ? 'Gửi lại mã' : 'Gửi mã xác thực'}
        </Button>
      </div>
      {request.isError ? <p className="mt-3 text-sm text-danger" role="alert">{request.error.message}</p> : null}
      {codeSent ? (
        <form className="mt-4 max-w-sm space-y-3" onSubmit={(event) => {
          event.preventDefault();
          if (!pending && /^[0-9]{6}$/.test(otp)) confirm.mutate(otp);
        }}>
          <p className="text-sm text-text-secondary" role="status">Đã gửi mã xác thực.</p>
          <Input
            autoComplete="one-time-code"
            disabled={pending}
            error={confirm.error?.message}
            inputMode="numeric"
            label="Mã xác thực"
            maxLength={6}
            onChange={(event) => {
              setOtp(event.target.value.replace(/[^0-9]/g, ''));
              if (confirm.isError) confirm.reset();
            }}
            required
            value={otp}
          />
          <Button className="account-primary-action" disabled={request.isPending || otp.length !== 6} loading={confirm.isPending} type="submit">
            Xác nhận email
          </Button>
        </form>
      ) : null}
    </section>
  );
};
