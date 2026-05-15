import { useEffect, useMemo, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';

import { routePaths, routes } from '@/constants/routes';
import { useAddress, useCreateAddress, useDeleteAddress, useUpdateAddress } from '@/shared/hooks/useAddresses';
import { useUnsavedChangesPrompt } from '@/shared/hooks/useUnsavedChangesPrompt';
import { addressSchema, type AddressSchemaInput } from '@/features/profile/services/addressSchemas';
import { EmptyState } from '@/shared/components/feedback/EmptyState';
import { ErrorCard } from '@/shared/components/feedback/ErrorCard';
import { LoadingOverlay } from '@/shared/components/feedback/LoadingOverlay';
import { AccountShell } from '@/shared/components/layout/AccountShell';
import { Container } from '@/shared/components/layout/Container';
import { ConfirmDialog } from '@/shared/components/overlays/ConfirmDialog';
import { PageSEO } from '@/shared/components/seo/PageSEO';
import { Button } from '@/shared/components/ui/Button';
import { Checkbox } from '@/shared/components/ui/Checkbox';
import { Input } from '@/shared/components/ui/Input';
import { Select } from '@/shared/components/ui/Select';
import { useUiStore } from '@/shared/stores/uiStore';
import { ADDRESS_TYPES } from '@/shared/types/enums';
import type { CreateAddressRequest, UpdateAddressRequest } from '@/shared/types/address.types';
import type { ServiceError } from '@/shared/lib/serviceError';

const addressDefaults: AddressSchemaInput = {
  receiverName: '',
  phoneNumber: '',
  streetAddress: '',
  ward: '',
  district: '',
  city: '',
  postalCode: '',
  addressType: ADDRESS_TYPES.HOME,
  isDefault: false,
  label: '',
};

const RETURN_TO_CHECKOUT = 'checkout';

export const AddressFormPage = () => {
  const { id = '' } = useParams();
  const isEditMode = Boolean(id);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const addToast = useUiStore((state) => state.addToast);
  const createAddress = useCreateAddress();
  const updateAddress = useUpdateAddress();
  const deleteAddress = useDeleteAddress();
  const addressQuery = useAddress(id);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const returnTo = searchParams.get('returnTo') === RETURN_TO_CHECKOUT ? RETURN_TO_CHECKOUT : null;
  const backTarget = returnTo === RETURN_TO_CHECKOUT ? routePaths.checkoutAddress() : routes.profileAddresses;
  const {
    formState: { errors, isDirty },
    handleSubmit,
    register,
    reset,
    setError,
    watch,
  } = useForm<AddressSchemaInput>({
    resolver: zodResolver(addressSchema),
    defaultValues: addressDefaults,
  });

  useUnsavedChangesPrompt(isDirty);

  useEffect(() => {
    if (!addressQuery.data) {
      return;
    }

    reset({
      receiverName: addressQuery.data.receiverName,
      phoneNumber: addressQuery.data.phoneNumber,
      streetAddress: addressQuery.data.streetAddress,
      ward: addressQuery.data.ward,
      district: addressQuery.data.district,
      city: addressQuery.data.city,
      postalCode: addressQuery.data.postalCode,
      addressType: addressQuery.data.addressType,
      isDefault: addressQuery.data.isDefault,
      label: addressQuery.data.label,
    });
  }, [addressQuery.data, reset]);

  const currentValues = watch();
  const pageTitle = isEditMode ? 'Edit Address' : 'Add Address';
  const seoPath = isEditMode ? routePaths.profileAddressEdit(id || 'address') : routes.profileAddressNew;

  const submitLabel = useMemo(() => {
    if (createAddress.isPending || updateAddress.isPending) {
      return isEditMode ? 'Saving...' : 'Creating...';
    }

    return isEditMode ? 'Save address' : 'Create address';
  }, [createAddress.isPending, isEditMode, updateAddress.isPending]);

  const handleSuccess = (addressId: string, receiverName: string) => {
    addToast({
      tone: 'success',
      title: isEditMode ? 'Address updated' : 'Address created',
      description: `${receiverName}'s destination is ready to use.`,
    });

    navigate(returnTo === RETURN_TO_CHECKOUT ? routePaths.checkoutAddress(addressId) : routes.profileAddresses);
  };

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);

    const payload: CreateAddressRequest | UpdateAddressRequest = {
      receiverName: values.receiverName,
      phoneNumber: values.phoneNumber,
      streetAddress: values.streetAddress,
      ward: values.ward,
      district: values.district,
      city: values.city,
      postalCode: values.postalCode,
      addressType: values.addressType,
      isDefault: values.isDefault,
      label: values.label,
    };

    try {
      const address = isEditMode
        ? await updateAddress.mutateAsync({
            addressId: id,
            payload,
          })
        : await createAddress.mutateAsync(payload as CreateAddressRequest);

      reset({
        receiverName: address.receiverName,
        phoneNumber: address.phoneNumber,
        streetAddress: address.streetAddress,
        ward: address.ward,
        district: address.district,
        city: address.city,
        postalCode: address.postalCode,
        addressType: address.addressType,
        isDefault: address.isDefault,
        label: address.label,
      });

      handleSuccess(address.id, address.receiverName);
    } catch (error) {
      const serviceError = error as ServiceError;
      if (serviceError.fieldErrors) {
        Object.entries(serviceError.fieldErrors).forEach(([field, message]) => {
          setError(field as keyof AddressSchemaInput, { message });
        });
      }

      setFormError(serviceError.message);
    }
  });

  return (
    <>
      <PageSEO description="Create or edit a saved customer delivery destination." noIndex path={seoPath} title={pageTitle} />
      <Container className="pb-16 pt-28 md:pb-20 md:pt-32">
        <AccountShell
          actions={
            isEditMode ? (
              <Button onClick={() => setConfirmDeleteOpen(true)} variant="danger">
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            ) : undefined
          }
          description={returnTo === RETURN_TO_CHECKOUT ? 'Save a delivery destination and return directly to the active checkout draft.' : 'Create or refine a saved destination for upcoming orders and future checkout handoffs.'}
          eyebrow={returnTo === RETURN_TO_CHECKOUT ? 'Checkout destination' : 'Saved destination'}
          title={pageTitle}
        >
          <Link className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-text-primary" to={backTarget}>
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>

          {isEditMode && addressQuery.isLoading ? <LoadingOverlay className="min-h-[320px] border-border bg-surface" inline label="Loading address..." /> : null}
          {isEditMode && addressQuery.isError ? (
            <ErrorCard
              action={<Button onClick={() => void addressQuery.refetch()}>Retry</Button>}
              className="border-border bg-surface"
              description="The saved destination could not be loaded for editing."
              title="Address unavailable"
            />
          ) : null}
          {isEditMode && !addressQuery.isLoading && !addressQuery.isError && !addressQuery.data ? (
            <EmptyState
              className="border-border bg-surface px-6 py-16"
              description="This destination is no longer available in your address book."
              title="Address not found."
            />
          ) : null}

          {(!isEditMode || addressQuery.data) && !addressQuery.isLoading ? (
            <form className="space-y-8 border border-border bg-surface px-5 py-6 md:px-7" onSubmit={onSubmit}>
              <div className="grid gap-6 md:grid-cols-2">
                <Input error={errors.receiverName?.message} id="receiverName" label="Receiver name" {...register('receiverName')} />
                <Input error={errors.phoneNumber?.message} id="phoneNumber" label="Phone number" {...register('phoneNumber')} />
              </div>

              <Input error={errors.streetAddress?.message} id="streetAddress" label="Street address" {...register('streetAddress')} />

              <div className="grid gap-6 md:grid-cols-3">
                <Input error={errors.ward?.message} id="ward" label="Ward" {...register('ward')} />
                <Input error={errors.district?.message} id="district" label="District" {...register('district')} />
                <Input error={errors.city?.message} id="city" label="City" {...register('city')} />
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <Input error={errors.postalCode?.message} id="postalCode" label="Postal code" {...register('postalCode')} />
                <Select error={errors.addressType?.message} id="addressType" label="Address type" {...register('addressType')}>
                  <option value={ADDRESS_TYPES.HOME}>Home</option>
                  <option value={ADDRESS_TYPES.OFFICE}>Office</option>
                </Select>
              </div>

              <Input
                error={errors.label?.message}
                hint="Optional short label, for example Residence or Studio."
                id="label"
                label="Label"
                {...register('label')}
              />

              <Checkbox
                checked={currentValues.isDefault}
                description="Default addresses appear first and are preselected where possible."
                error={errors.isDefault?.message}
                id="isDefault"
                label="Make this my default delivery address"
                {...register('isDefault')}
              />

              {formError ? <p className="text-sm text-danger">{formError}</p> : null}

              <div className="flex flex-wrap items-center gap-3 border-t border-border pt-6">
                <Button disabled={createAddress.isPending || updateAddress.isPending} size="lg" type="submit">
                  {submitLabel}
                </Button>
                <Button onClick={() => navigate(backTarget)} size="lg" variant="ghost">
                  Cancel
                </Button>
              </div>
            </form>
          ) : null}
        </AccountShell>
      </Container>

      <ConfirmDialog
        cancelLabel="Keep address"
        confirmLabel={deleteAddress.isPending ? 'Deleting...' : 'Delete address'}
        description="This saved destination will be removed from your customer account."
        onClose={() => setConfirmDeleteOpen(false)}
        onConfirm={() =>
          deleteAddress.mutate(id, {
            onSuccess: () => {
              addToast({
                tone: 'success',
                title: 'Address deleted',
                description: 'The saved destination was removed successfully.',
              });
              setConfirmDeleteOpen(false);
              navigate(backTarget);
            },
            onError: (error) => {
              addToast({
                tone: 'danger',
                title: 'Address delete failed',
                description: error instanceof Error ? error.message : 'Try again.',
              });
            },
          })
        }
        open={confirmDeleteOpen}
        title="Delete this address?"
      />
    </>
  );
};

export default AddressFormPage;
