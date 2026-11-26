import { CircleAlert } from 'lucide-react';

export const AuthError = ({ message }: { message: string | null }) =>
  message && (
    <p className="flex items-start gap-2 rounded-card bg-danger/10 p-3 text-sm leading-relaxed text-danger" role="alert">
      <CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
      <span>{message}</span>
    </p>
  );
