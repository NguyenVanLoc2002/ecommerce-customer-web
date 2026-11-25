import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { routes } from '@/constants/routes';
import { useProfile, useUpdateProfile } from '@/features/profile/hooks/useProfile';
import { profileSchema, type ProfileSchemaInput } from '@/features/profile/services/profileSchemas';
import { ErrorCard } from '@/shared/components/feedback/ErrorCard';
import { EmptyState } from '@/shared/components/feedback/EmptyState';
import { LoadingOverlay } from '@/shared/components/feedback/LoadingOverlay';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { AccountWorkspace } from '@/shared/components/layout/AccountWorkspace';
import { PageSEO } from '@/shared/components/seo/PageSEO';
import { useUnsavedChangesPrompt } from '@/shared/hooks/useUnsavedChangesPrompt';
import type { ServiceError } from '@/shared/lib/serviceError';
import { useUiStore } from '@/shared/stores/uiStore';
import { GENDERS } from '@/shared/types/profile.types';

const genderOptions = [
  { value: GENDERS.FEMALE, label: 'Nữ' },
  { value: GENDERS.MALE, label: 'Nam' },
  { value: GENDERS.OTHER, label: 'Khác' },
  { value: '', label: 'Không chọn' },
];

const profileDefaults: ProfileSchemaInput = {
  firstName: '',
  lastName: '',
  phoneNumber: '',
  gender: '',
  birthDate: '',
};

export const ProfilePage = () => {
  const addToast = useUiStore((state) => state.addToast);
  const profileQuery = useProfile();
  const updateProfile = useUpdateProfile();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    formState: { errors, isDirty, isSubmitting },
    handleSubmit,
    register,
    reset,
    setError,
  } = useForm<ProfileSchemaInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: profileDefaults,
  });

  useUnsavedChangesPrompt(isDirty);

  useEffect(() => {
    if (!profileQuery.data) {
      return;
    }

    reset({
      firstName: profileQuery.data.firstName,
      lastName: profileQuery.data.lastName,
      phoneNumber: profileQuery.data.phoneNumber,
      gender: profileQuery.data.gender ?? '',
      birthDate: profileQuery.data.birthDate ?? '',
    });
  }, [profileQuery.data, reset]);

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);

    try {
      const profile = await updateProfile.mutateAsync({
        firstName: values.firstName,
        lastName: values.lastName,
        phoneNumber: values.phoneNumber,
        gender: values.gender || undefined,
        birthDate: values.birthDate || undefined,
      });

      reset({
        firstName: profile.firstName,
        lastName: profile.lastName,
        phoneNumber: profile.phoneNumber,
        gender: profile.gender ?? '',
        birthDate: profile.birthDate ?? '',
      });

      addToast({
        tone: 'success',
        title: 'Đã cập nhật hồ sơ',
        description: 'Thông tin cá nhân của bạn đã được lưu.',
      });
    } catch (error) {
      const serviceError = error as ServiceError;
      if (serviceError.fieldErrors) {
        Object.entries(serviceError.fieldErrors).forEach(([field, message]) => {
          setError(field as keyof ProfileSchemaInput, { message });
        });
      }

      setFormError(serviceError.message);
    }
  });

  const profile = profileQuery.data;

  return (
    <>
      <PageSEO description="Quản lý thông tin cá nhân và liên hệ tại Fashion Shop." noIndex path={routes.profile} title="Hồ sơ cá nhân" />
      <AccountWorkspace
        description="Quản lý thông tin cá nhân và liên hệ của bạn tại Fashion Shop."
        title="Hồ sơ cá nhân"
      >
        {profileQuery.isLoading ? <LoadingOverlay className="min-h-[320px] border-border bg-surface" inline label="Đang tải hồ sơ…" /> : null}
        {profileQuery.isError ? (
          <ErrorCard
            action={<Button onClick={() => void profileQuery.refetch()}>Thử lại</Button>}
            description="Vui lòng thử tải lại thông tin tài khoản."
            title="Không thể tải hồ sơ"
          />
        ) : null}
        {!profileQuery.isLoading && !profileQuery.isError && !profile ? (
          <EmptyState description="Đăng nhập lại để tải thông tin tài khoản." title="Không tìm thấy hồ sơ" />
        ) : null}
        {profile && !profileQuery.isError ? (
          <form aria-busy={isSubmitting} className="rounded-card border border-border bg-surface p-5 sm:p-8" onSubmit={onSubmit}>
            <fieldset className="grid min-w-0 gap-6 sm:grid-cols-2" disabled={isSubmitting}>
              <Input aria-required="true" autoComplete="family-name" className="bg-surface-muted" error={errors.lastName?.message} label="Họ" {...register('lastName')} />
              <Input aria-required="true" autoComplete="given-name" className="bg-surface-muted" error={errors.firstName?.message} label="Tên" {...register('firstName')} />
              <Input className="bg-surface-muted" hint="Email của tài khoản chỉ dùng để xem tại đây." label="Địa chỉ email" readOnly type="email" value={profile.email} />
              <Input aria-required="true" autoComplete="tel" className="bg-surface-muted" error={errors.phoneNumber?.message} label="Số điện thoại" type="tel" {...register('phoneNumber')} />
              <fieldset className="min-w-0 max-w-md sm:col-span-2">
                <legend className="mb-2 text-sm font-medium">Giới tính</legend>
                <div className="grid grid-cols-2 gap-1 rounded-input bg-surface-muted p-1 sm:grid-cols-4">
                  {genderOptions.map(({ value, label }) => (
                    <label className="cursor-pointer" key={value}>
                      <input className="peer sr-only" type="radio" value={value} {...register('gender')} />
                      <span className="flex min-h-11 items-center justify-center rounded-button px-2 text-sm text-text-secondary peer-checked:bg-surface peer-checked:font-medium peer-checked:text-brand-primary peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand-primary">
                        {label}
                      </span>
                    </label>
                  ))}
                </div>
                {errors.gender ? <p className="mt-2 text-sm text-danger" role="alert">{errors.gender.message}</p> : null}
              </fieldset>
              <div className="max-w-md sm:col-span-2">
                <Input autoComplete="bday" className="min-w-0 bg-surface-muted" error={errors.birthDate?.message} label="Ngày sinh" max={new Date().toISOString().slice(0, 10)} type="date" {...register('birthDate')} />
              </div>
            </fieldset>
            {formError ? <p className="mt-6 text-sm text-danger" role="alert">{formError}</p> : null}
            <div className="mt-8 grid gap-3 sm:flex">
              <Button className="account-primary-action" disabled={!isDirty} loading={isSubmitting} type="submit">Lưu thay đổi</Button>
              <Button
                className="account-secondary-action"
                disabled={!isDirty || isSubmitting}
                onClick={() => {
                  reset();
                  setFormError(null);
                }}
                variant="secondary"
              >
                Hủy thao tác
              </Button>
            </div>
          </form>
        ) : null}
      </AccountWorkspace>
    </>
  );
};

export default ProfilePage;
