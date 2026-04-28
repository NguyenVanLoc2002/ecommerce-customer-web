import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { voucherSchema, type VoucherSchemaInput } from '@/features/checkout/services/checkoutSchemas';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';

type VoucherFormProps = {
  defaultValue: string;
  onSubmit: (voucherCode: string) => void;
  loading?: boolean;
};

export const VoucherForm = ({ defaultValue, loading = false, onSubmit }: VoucherFormProps) => {
  const {
    formState: { errors },
    handleSubmit,
    register,
  } = useForm<VoucherSchemaInput>({
    resolver: zodResolver(voucherSchema),
    defaultValues: {
      voucherCode: defaultValue,
    },
  });

  return (
    <form
      className="grid gap-3 md:grid-cols-[minmax(0,1fr)_160px]"
      onSubmit={handleSubmit((values) => {
        onSubmit(values.voucherCode);
      })}
    >
      <Input
        autoCapitalize="characters"
        error={errors.voucherCode?.message}
        label="Voucher code"
        placeholder="FIRSTLOOK"
        variant="transaction"
        {...register('voucherCode')}
      />
      <Button className="md:self-end" disabled={loading} type="submit">
        {loading ? 'Applying...' : 'Apply'}
      </Button>
    </form>
  );
};
