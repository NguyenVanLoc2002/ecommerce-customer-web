import { useCallback, useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Building2, House, MapPin, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';

import { routePaths, routes } from '@/constants/routes';
import { DeleteAddressDialog } from '@/features/profile/components/DeleteAddressDialog';
import { addressSchema, type AddressSchemaInput } from '@/features/profile/services/addressSchemas';
import { addressTypeLabels } from '@/features/profile/services/addressTypeLabels';
import { EmptyState } from '@/shared/components/feedback/EmptyState';
import { ErrorCard } from '@/shared/components/feedback/ErrorCard';
import { LoadingOverlay } from '@/shared/components/feedback/LoadingOverlay';
import { AccountWorkspace } from '@/shared/components/layout/AccountWorkspace';
import { PageSEO } from '@/shared/components/seo/PageSEO';
import { Button } from '@/shared/components/ui/Button';
import { buttonStyles } from '@/shared/components/ui/buttonStyles';
import { Checkbox } from '@/shared/components/ui/Checkbox';
import { Input } from '@/shared/components/ui/Input';
import { useAddress, useCreateAddress, useUpdateAddress } from '@/shared/hooks/useAddresses';
import { useUnsavedChangesPrompt } from '@/shared/hooks/useUnsavedChangesPrompt';
import type { ServiceError } from '@/shared/lib/serviceError';
import { useUiStore } from '@/shared/stores/uiStore';
import { ADDRESS_TYPES } from '@/shared/types/enums';

const addressDefaults: AddressSchemaInput = {
  receiverName: '',
  phoneNumber: '',
  streetAddress: '',
  ward: '',
  district: '',
  city: '',
  postalCode: '',
  addressType: ADDRESS_TYPES.SHIPPING,
  isDefault: false,
  label: '',
};

const addressTypeOptions = [
  { value: ADDRESS_TYPES.SHIPPING, Icon: House },
  { value: ADDRESS_TYPES.BILLING, Icon: Building2 },
  { value: ADDRESS_TYPES.BOTH, Icon: MapPin },
];

const inputClassName = 'bg-surface-muted';

const AddressEditor = ({ id }: { id: string }) => {
  const isEditMode = Boolean(id);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const addToast = useUiStore((state) => state.addToast);
  const createAddress = useCreateAddress();
  const updateAddress = useUpdateAddress();
  const addressQuery = useAddress(id);
  const [continueTo, setContinueTo] = useState<string | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const closeDelete = useCallback(() => setConfirmDeleteOpen(false), []);
  const returnToCheckout = searchParams.get('returnTo') === 'checkout';
  const backTarget = returnToCheckout ? routePaths.checkoutAddress() : routes.profileAddresses;
  const address = addressQuery.data;
  const addressError = addressQuery.error as ServiceError | null;
  const notFound = isEditMode && (
    addressError?.code === 'ADDRESS_NOT_FOUND' || addressError?.status === 404 || (addressQuery.isSuccess && !address)
  );
  const {
    formState: { errors, isDirty, isSubmitting },
    handleSubmit,
    register,
    reset,
    setError,
  } = useForm<AddressSchemaInput>({
    resolver: zodResolver(addressSchema),
    defaultValues: addressDefaults,
  });

  useUnsavedChangesPrompt(isDirty && !continueTo);

  useEffect(() => {
    if (continueTo) navigate(continueTo);
  }, [continueTo, navigate]);

  useEffect(() => {
    if (address) {
      const { receiverName, phoneNumber, streetAddress, ward, district, city, postalCode, addressType, isDefault, label } = address;
      reset({ receiverName, phoneNumber, streetAddress, ward, district, city, postalCode, addressType, isDefault, label });
    }
  }, [address, reset]);

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);

    try {
      const saved = isEditMode
        ? await updateAddress.mutateAsync({ addressId: id, payload: values })
        : await createAddress.mutateAsync(values);

      reset(values);
      addToast({ tone: 'success', title: isEditMode ? 'Đã cập nhật địa chỉ' : 'Đã thêm địa chỉ mới' });
      setContinueTo(returnToCheckout ? routePaths.checkoutAddress(saved.id) : routes.profileAddresses);
    } catch (error) {
      const serviceError = error as ServiceError;
      Object.entries(serviceError.fieldErrors ?? {}).forEach(([field, message]) => {
        if (Object.prototype.hasOwnProperty.call(addressDefaults, field)) {
          setError(field as keyof AddressSchemaInput, { message });
        }
      });
      setFormError(error instanceof Error ? error.message : 'Không thể lưu địa chỉ. Vui lòng thử lại.');
    }
  });

  const title = isEditMode ? 'Chỉnh sửa địa chỉ nhận hàng' : 'Thêm địa chỉ nhận hàng mới';
  const backLabel = returnToCheckout ? 'Quay lại thanh toán' : 'Quay lại sổ địa chỉ';

  return (
    <>
      <PageSEO description="Thêm hoặc cập nhật địa chỉ nhận hàng tại Fashion Shop." noIndex path={isEditMode ? routePaths.profileAddressEdit(id) : routes.profileAddressNew} title={title} />
      <AccountWorkspace
        breadcrumbParent={{ label: 'Sổ địa chỉ', to: routes.profileAddresses }}
        description={returnToCheckout ? 'Lưu địa chỉ nhận hàng để tiếp tục thanh toán.' : 'Lưu thông tin người nhận và địa chỉ giao hàng.'}
        headingInPanel
        title={title}
      >
        {isEditMode && addressQuery.isLoading ? <LoadingOverlay className="min-h-[320px] border-none" inline label="Đang tải địa chỉ…" /> : null}
        {notFound ? (
          <EmptyState
            action={<Link className={buttonStyles({})} to={backTarget}>{backLabel}</Link>}
            description="Địa chỉ này không còn trong sổ địa chỉ của bạn."
            title="Không tìm thấy địa chỉ"
          />
        ) : null}
        {isEditMode && addressQuery.isError && !notFound ? (
          <ErrorCard
            action={<Button onClick={() => void addressQuery.refetch()}>Thử lại</Button>}
            className="m-5"
            description="Vui lòng thử tải lại địa chỉ đã lưu."
            title="Không thể tải địa chỉ"
          />
        ) : null}
        {(!isEditMode || (address && !addressQuery.isError)) ? (
          <form aria-busy={isSubmitting} onSubmit={onSubmit}>
            <fieldset className="min-w-0 space-y-6 p-5 sm:p-8" disabled={isSubmitting}>
              <div className="grid gap-5 sm:grid-cols-2">
                <Input aria-required="true" autoComplete="section-delivery shipping name" className={inputClassName} error={errors.receiverName?.message} label="Họ và tên người nhận" placeholder="Nhập tên người nhận" {...register('receiverName')} />
                <Input aria-required="true" autoComplete="section-delivery shipping tel" className={inputClassName} error={errors.phoneNumber?.message} label="Số điện thoại liên hệ" placeholder="Nhập số điện thoại" type="tel" {...register('phoneNumber')} />
              </div>
              <div className="grid gap-5 sm:grid-cols-3">
                <Input aria-required="true" autoComplete="section-delivery shipping address-level1" className={inputClassName} error={errors.city?.message} label="Tỉnh / Thành phố" {...register('city')} />
                <Input aria-required="true" autoComplete="section-delivery shipping address-level2" className={inputClassName} error={errors.district?.message} label="Quận / Huyện" {...register('district')} />
                <Input aria-required="true" autoComplete="section-delivery shipping address-level3" className={inputClassName} error={errors.ward?.message} label="Phường / Xã" {...register('ward')} />
              </div>
              <div className="grid gap-5 sm:grid-cols-3">
                <div className="sm:col-span-2">
                  <Input aria-required="true" autoComplete="section-delivery shipping address-line1" className={inputClassName} error={errors.streetAddress?.message} label="Số nhà, tòa nhà, tên đường" placeholder="Nhập địa chỉ cụ thể" {...register('streetAddress')} />
                </div>
                <Input autoComplete="section-delivery shipping postal-code" className={inputClassName} error={errors.postalCode?.message} label="Mã bưu chính (tùy chọn)" {...register('postalCode')} />
              </div>
              <fieldset className="min-w-0">
                <legend className="mb-2 text-sm font-medium">Loại địa chỉ</legend>
                <div className="flex flex-wrap gap-2">
                  {addressTypeOptions.map(({ value, Icon }) => (
                    <label className="cursor-pointer" key={value}>
                      <input
                        aria-describedby={errors.addressType ? 'address-type-error' : undefined}
                        aria-invalid={Boolean(errors.addressType)}
                        className="peer sr-only"
                        type="radio"
                        value={value}
                        {...register('addressType')}
                      />
                      <span className="flex min-h-11 items-center gap-2 rounded-button border border-border bg-surface-muted px-3 text-sm text-text-secondary peer-checked:border-brand-primary peer-checked:bg-brand-subtle peer-checked:text-brand-primary peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand-primary peer-disabled:opacity-70">
                        <Icon aria-hidden="true" className="h-4 w-4" />
                        {addressTypeLabels[value]}
                      </span>
                    </label>
                  ))}
                </div>
                {errors.addressType ? <p className="mt-2 text-sm text-danger" id="address-type-error" role="alert">{errors.addressType.message}</p> : null}
              </fieldset>
              <Input className={inputClassName} error={errors.label?.message} label="Nhãn địa chỉ (tùy chọn)" placeholder="Ví dụ: Nhà riêng, Văn phòng" {...register('label')} />
              <Checkbox
                className="accent-brand-primary"
                description="Địa chỉ này được ưu tiên khi chọn địa chỉ nhận hàng tại bước thanh toán."
                error={errors.isDefault?.message}
                label="Đặt làm địa chỉ mặc định"
                {...register('isDefault')}
              />
              {formError ? <p className="text-sm text-danger" role="alert">{formError}</p> : null}
            </fieldset>
            <div className="flex flex-col-reverse flex-wrap gap-3 border-t border-border bg-surface-muted p-5 sm:flex-row sm:items-center sm:p-8">
              <Button className="!text-sm !tracking-normal" disabled={isSubmitting} onClick={() => navigate(backTarget)} variant="ghost">{backLabel}</Button>
              {isEditMode ? (
                <Button className="sm:ml-auto !text-danger !text-sm !tracking-normal" disabled={isSubmitting} onClick={() => setConfirmDeleteOpen(true)} variant="ghost">
                  <Trash2 aria-hidden="true" className="h-4 w-4" />
                  Xóa địa chỉ
                </Button>
              ) : null}
              <Button className={isEditMode ? 'account-primary-action' : 'account-primary-action sm:ml-auto'} loading={isSubmitting} type="submit">Lưu địa chỉ</Button>
            </div>
          </form>
        ) : null}
      </AccountWorkspace>
      {confirmDeleteOpen && address ? (
        <DeleteAddressDialog address={address} onClose={closeDelete} onDeleted={() => setContinueTo(backTarget)} />
      ) : null}
    </>
  );
};

export const AddressFormPage = () => {
  const { id = '' } = useParams();
  return <AddressEditor id={id} key={id} />;
};

export default AddressFormPage;
