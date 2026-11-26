import { ArrowRight } from 'lucide-react';

import { Button } from '@/shared/components/ui/Button';

export const AuthSubmit = ({ label, pending, busy, disabled }: {
  label: string;
  pending: string;
  busy: boolean;
  disabled?: boolean;
}) => (
  <Button
    className="border-text-primary bg-text-primary text-xs uppercase hover:bg-text-secondary active:bg-text-secondary"
    disabled={disabled}
    fullWidth
    loading={busy}
    type="submit"
  >
    {busy ? pending : label}
    {!busy && <ArrowRight aria-hidden="true" className="size-4" />}
  </Button>
);
