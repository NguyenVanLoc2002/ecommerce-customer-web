import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { useForm } from 'react-hook-form';

import { routes } from '@/constants/routes';
import { useProfile, useUpdateProfile } from '@/features/profile/hooks/useProfile';
import { profileSchema, type ProfileSchemaInput } from '@/features/profile/services/profileSchemas';
import { ErrorCard } from '@/shared/components/feedback/ErrorCard';
import { EmptyState } from '@/shared/components/feedback/EmptyState';
import { LoadingOverlay } from '@/shared/components/feedback/LoadingOverlay';
import { Avatar } from '@/shared/components/ui/Avatar';
import { Badge } from '@/shared/components/ui/Badge';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Select } from '@/shared/components/ui/Select';
import { AccountShell } from '@/shared/components/layout/AccountShell';
import { Container } from '@/shared/components/layout/Container';
import { PageSEO } from '@/shared/components/seo/PageSEO';
import { useUnsavedChangesPrompt } from '@/shared/hooks/useUnsavedChangesPrompt';
import type { ServiceError } from '@/shared/lib/serviceError';
import { useUiStore } from '@/shared/stores/uiStore';
import { GENDERS } from '@/shared/types/profile.types';

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
    formState: { errors, isDirty },
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
        title: 'Profile updated',
        description: 'Your account details were saved successfully.',
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
  const fullName = profile ? `${profile.firstName} ${profile.lastName}` : 'Customer profile';

  return (
    <>
      <PageSEO description="Manage your personal details, contact information, and loyalty status." noIndex path={routes.profile} title="Profile" />
      <Container className="pb-16 pt-28 md:pb-20 md:pt-32">
        <AccountShell
          description="Refine your customer identity, contact details, and profile metadata without leaving the storefront."
          eyebrow="Identity"
          title="Personal Details"
        >
          {profileQuery.isLoading ? <LoadingOverlay className="min-h-[320px] border-border bg-surface" inline label="Loading profile..." /> : null}
          {profileQuery.isError ? (
            <ErrorCard
              action={<Button onClick={() => void profileQuery.refetch()}>Retry</Button>}
              className="border-border bg-surface"
              description="Your current customer profile could not be loaded from the active service."
              title="Profile unavailable"
            />
          ) : null}
          {!profileQuery.isLoading && !profileQuery.isError && !profile ? (
            <EmptyState
              className="border-border bg-surface px-6 py-16"
              description="Sign in again to restore the customer profile for this session."
              title="Profile not found."
            />
          ) : null}
          {profile ? (
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
              <section className="space-y-8">
                <div className="border border-border bg-surface px-5 py-6 md:px-7">
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-outline">Identity</p>
                  <form className="mt-8 space-y-8" onSubmit={onSubmit}>
                    <div className="grid gap-6 md:grid-cols-2">
                      <Input error={errors.firstName?.message} id="firstName" label="First name" {...register('firstName')} />
                      <Input error={errors.lastName?.message} id="lastName" label="Last name" {...register('lastName')} />
                    </div>
                    <Input
                      disabled
                      hint="Email is read-only for this customer storefront."
                      id="email"
                      label="Email address"
                      value={profile.email}
                    />
                    <div className="grid gap-6 md:grid-cols-2">
                      <Input error={errors.phoneNumber?.message} id="phoneNumber" label="Phone number" {...register('phoneNumber')} />
                      <Select error={errors.gender?.message} id="gender" label="Gender" {...register('gender')}>
                        <option value="">Prefer not to say</option>
                        <option value={GENDERS.FEMALE}>Female</option>
                        <option value={GENDERS.MALE}>Male</option>
                        <option value={GENDERS.OTHER}>Other</option>
                      </Select>
                    </div>
                    <Input error={errors.birthDate?.message} id="birthDate" label="Birth date" max={new Date().toISOString().slice(0, 10)} type="date" {...register('birthDate')} />
                    {formError ? <p className="text-sm text-danger">{formError}</p> : null}
                    <div className="flex flex-wrap items-center gap-3 border-t border-border pt-6">
                      <Button disabled={updateProfile.isPending || !isDirty} size="lg" type="submit">
                        <Save className="h-4 w-4" />
                        {updateProfile.isPending ? 'Saving...' : 'Save changes'}
                      </Button>
                      <p className="text-sm leading-7 text-text-secondary">Changes stay in memory until you save them.</p>
                    </div>
                  </form>
                </div>
              </section>

              <aside className="space-y-4">
                <section className="border border-border bg-surface px-5 py-6 md:px-6">
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-outline">Portrait</p>
                  <div className="mt-6 flex items-center gap-4">
                    <Avatar name={fullName} size="xl" src={profile.avatarUrl} />
                    <div className="min-w-0 flex-1">
                      <h2 className="font-display text-[2rem] leading-none text-text-primary">{fullName}</h2>
                      <p className="mt-3 max-w-full text-sm uppercase tracking-[0.08em] text-text-secondary [overflow-wrap:anywhere] break-words">
                        {profile.email}
                      </p>
                    </div>
                  </div>
                  <p className="mt-5 text-sm leading-7 text-text-secondary">
                    Avatar display mirrors the current account session. Profile editing does not upload a new image in this phase.
                  </p>
                </section>

                <section className="border border-border bg-surface px-5 py-6 md:px-6">
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-outline">Loyalty</p>
                  <div className="mt-4 flex items-center gap-3">
                    <Badge>{profile.loyaltyPoints} points</Badge>
                    <p className="text-sm text-text-secondary">Current reward balance</p>
                  </div>
                  <p className="mt-4 text-sm leading-7 text-text-secondary">
                    Points are shown for reference only here and stay aligned with the active customer session.
                  </p>
                </section>
              </aside>
            </div>
          ) : null}
        </AccountShell>
      </Container>
    </>
  );
};

export default ProfilePage;
