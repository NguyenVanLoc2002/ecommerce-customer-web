import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useId, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Select } from '@/shared/components/ui/Select';
import { Textarea } from '@/shared/components/ui/Textarea';
import { getServiceErrorCode } from '@/shared/lib/idempotentMutation';
import type { CommerceOrder } from '@/shared/types/commerce.types';
import { createIdempotencyKey } from '@/shared/utils/createIdempotencyKey';

import { useCreateReturn } from '../hooks/useOrderReturns';
import { returnReasonLabels } from '../lib/returnLabels';
import { returnReasons, type CreateReturnRequest, type EligibleReturnItem } from '../types/returns.types';

const formSchema = z.object({
  reason: z.enum(returnReasons),
  note: z.string().trim().min(1, 'Hãy mô tả vấn đề.').max(1000, 'Mô tả tối đa 1.000 ký tự.'),
  quantities: z.record(z.number().int('Nhập số nguyên.').min(0, 'Số lượng phải từ 0 trở lên.')),
  originalCondition: z.boolean(),
  unopened: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

type Props = {
  order: CommerceOrder;
  eligibleItems: EligibleReturnItem[];
  onCreated: () => void;
  onEligibilityChanged: () => void;
};

export const ReturnRequestForm = ({ order, eligibleItems, onCreated, onEligibilityChanged }: Props) => {
  const formErrorId = useId();
  const mutation = useCreateReturn(order.id);
  const inFlight = useRef(false);
  const attempt = useRef<{ key: string; signature: string }>();
  const { register, watch, handleSubmit, setError, clearErrors, setFocus, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { reason: 'DEFECTIVE', note: '', quantities: {}, originalCondition: false, unopened: false },
  });
  useEffect(() => { setFocus('reason'); }, [setFocus]);

  const reason = watch('reason');
  const quantities = watch('quantities');
  const items = eligibleItems.filter((item) => item.allowedReasons.includes(reason));
  const changedMind = reason === 'CHANGED_MIND';
  const needsUnopened = changedMind && items.some(
    (item) => item.unopenedRequiredForChangedMind && quantities[item.orderItemId] > 0,
  );

  const submit = async (values: FormValues) => {
    if (inFlight.current) return;
    const selected = items.filter((item) => values.quantities[item.orderItemId] > 0);
    if (selected.length === 0 || selected.length > 100) {
      setError('root', { message: 'Hãy chọn từ 1 đến 100 sản phẩm bằng cách nhập số lượng.' });
      return;
    }
    for (const item of selected) {
      if (values.quantities[item.orderItemId] > item.availableQuantity) {
        setError(`quantities.${item.orderItemId}`, { message: `Chỉ còn ${item.availableQuantity} sản phẩm có thể yêu cầu.` }, { shouldFocus: true });
        return;
      }
    }
    const requiresUnopened = changedMind && selected.some((item) => item.unopenedRequiredForChangedMind);
    if (changedMind && !values.originalCondition) {
      setError('originalCondition', { message: 'Hãy xác nhận sản phẩm còn nguyên trạng.' }, { shouldFocus: true });
      return;
    }
    if (requiresUnopened && !values.unopened) {
      setError('unopened', { message: 'Hãy xác nhận sản phẩm yêu cầu còn nguyên niêm phong.' }, { shouldFocus: true });
      return;
    }

    const payload: CreateReturnRequest = {
      reason: values.reason,
      note: values.note,
      items: selected.map((item) => ({ orderItemId: item.orderItemId, quantity: values.quantities[item.orderItemId] }))
        .sort((first, second) => first.orderItemId.localeCompare(second.orderItemId)),
      originalCondition: changedMind && values.originalCondition,
      unopened: requiresUnopened && values.unopened,
    };
    const signature = JSON.stringify(payload);
    if (attempt.current?.signature !== signature) {
      attempt.current = { signature, key: createIdempotencyKey('return') };
    }

    inFlight.current = true;
    try {
      await mutation.mutateAsync({ payload, key: attempt.current.key });
      onCreated();
    } catch (error) {
      const code = getServiceErrorCode(error);
      if (code === 'RETURN_QUANTITY_UNAVAILABLE' || code === 'RETURN_NOT_ELIGIBLE') {
        setError('root', { message: 'Điều kiện đổi/trả đã thay đổi. Hãy kiểm tra lại sản phẩm và số lượng.' });
        onEligibilityChanged();
      } else if (code === 'IDEMPOTENCY_KEY_CONFLICT') {
        setError('root', { message: 'Có yêu cầu trùng mã. Hãy kiểm tra lịch sử trước khi gửi lại.' });
        onEligibilityChanged();
      } else {
        setError('root', { message: 'Chưa xác nhận được yêu cầu. Bạn có thể thử gửi lại.' });
      }
    } finally {
      inFlight.current = false;
    }
  };

  return (
    <form aria-describedby={errors.root ? formErrorId : undefined} aria-label="Yêu cầu đổi/trả" noValidate onSubmit={handleSubmit(submit)}>
      <fieldset className="space-y-5" disabled={mutation.isPending}>
        <legend className="mb-3 font-semibold">Tạo yêu cầu đổi/trả</legend>
        <Select
          className="scroll-mt-24"
          label="Lý do đổi/trả"
          {...register('reason', {
            onChange: () => {
              items.forEach((item) => setValue(`quantities.${item.orderItemId}`, 0));
              setValue('originalCondition', false);
              setValue('unopened', false);
              clearErrors();
            },
          })}
        >
          {returnReasons.map((value) => <option key={value} value={value}>{returnReasonLabels[value]}</option>)}
        </Select>

        {items.length === 0 ? <p className="text-sm text-text-secondary">Không có sản phẩm phù hợp với lý do này.</p> : (
          <ul className="divide-y divide-border border-y border-border">
            {items.map((item) => {
              const name = order.items.find((line) => line.id === item.orderItemId);
              const label = name ? `${name.productName} · ${name.variantName || name.sku}` : item.orderItemId;
              return (
                <li className="py-3" key={item.orderItemId}>
                  <Input
                    defaultValue={0}
                    error={errors.quantities?.[item.orderItemId]?.message}
                    hint={`Tối đa ${item.availableQuantity}. Nhập 0 để bỏ qua.`}
                    label={`Số lượng · ${label}`}
                    max={item.availableQuantity}
                    min={0}
                    step={1}
                    type="number"
                    {...register(`quantities.${item.orderItemId}`, { setValueAs: (value: string) => value === '' ? 0 : Number(value) })}
                  />
                </li>
              );
            })}
          </ul>
        )}

        {changedMind ? (
          <label className="flex min-h-11 items-center gap-3 text-sm">
            <input aria-describedby={errors.originalCondition ? `${formErrorId}-condition` : undefined} aria-invalid={Boolean(errors.originalCondition)} type="checkbox" {...register('originalCondition')} />
            Sản phẩm còn nguyên trạng
          </label>
        ) : null}
        {errors.originalCondition ? <p className="text-sm text-danger" id={`${formErrorId}-condition`} role="alert">{errors.originalCondition.message}</p> : null}
        {needsUnopened ? (
          <label className="flex min-h-11 items-center gap-3 text-sm">
            <input aria-describedby={errors.unopened ? `${formErrorId}-seal` : undefined} aria-invalid={Boolean(errors.unopened)} type="checkbox" {...register('unopened')} />
            Sản phẩm yêu cầu còn nguyên niêm phong
          </label>
        ) : null}
        {needsUnopened && errors.unopened ? <p className="text-sm text-danger" id={`${formErrorId}-seal`} role="alert">{errors.unopened.message}</p> : null}

        <Textarea error={errors.note?.message} label="Mô tả" maxLength={1000} required {...register('note')} />
        {errors.root ? <p className="text-sm text-danger" id={formErrorId} role="alert">{errors.root.message}</p> : null}
        <Button disabled={items.length === 0} loading={mutation.isPending} type="submit">
          {mutation.isPending ? 'Đang gửi yêu cầu…' : 'Gửi yêu cầu'}
        </Button>
      </fieldset>
    </form>
  );
};
