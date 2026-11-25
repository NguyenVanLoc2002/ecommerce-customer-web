import { useCallback, useState } from 'react';
import { CheckCircle2, MapPin, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

import { routePaths, routes } from '@/constants/routes';
import { DeleteAddressDialog } from '@/features/profile/components/DeleteAddressDialog';
import { addressTypeLabels } from '@/features/profile/services/addressTypeLabels';
import { EmptyState } from '@/shared/components/feedback/EmptyState';
import { ErrorCard } from '@/shared/components/feedback/ErrorCard';
import { LoadingOverlay } from '@/shared/components/feedback/LoadingOverlay';
import { AccountWorkspace } from '@/shared/components/layout/AccountWorkspace';
import { PageSEO } from '@/shared/components/seo/PageSEO';
import { Badge } from '@/shared/components/ui/Badge';
import { Button } from '@/shared/components/ui/Button';
import { buttonStyles } from '@/shared/components/ui/buttonStyles';
import { useAddresses, useUpdateAddress } from '@/shared/hooks/useAddresses';
import { useUiStore } from '@/shared/stores/uiStore';
import type { Address } from '@/shared/types/address.types';
import { cn } from '@/shared/utils/cn';

export const AddressBookPage = () => {
  const addressesQuery = useAddresses();
  const updateAddress = useUpdateAddress();
  const addToast = useUiStore((state) => state.addToast);
  const [addressToDelete, setAddressToDelete] = useState<Address | null>(null);
  const closeDelete = useCallback(() => setAddressToDelete(null), []);
  const addresses = addressesQuery.data ?? [];
  const updatingDefault = updateAddress.isPending || addressesQuery.isFetching;

  return (
    <>
      <PageSEO description="Quản lý địa chỉ nhận hàng đã lưu tại Fashion Shop." noIndex path={routes.profileAddresses} title="Sổ địa chỉ" />
      <AccountWorkspace
        actions={
          <Link className={buttonStyles({ className: 'account-primary-action' })} to={routePaths.profileAddressNew()}>
            <Plus aria-hidden="true" className="h-4 w-4" />
            Thêm địa chỉ mới
          </Link>
        }
        description="Quản lý địa chỉ nhận hàng và chọn địa chỉ mặc định cho lần thanh toán tiếp theo."
        title="Sổ địa chỉ"
      >
        {addressesQuery.isLoading ? <LoadingOverlay className="min-h-[260px] border-border bg-surface" inline label="Đang tải sổ địa chỉ…" /> : null}
        {addressesQuery.isError ? (
          <ErrorCard
            action={<Button onClick={() => void addressesQuery.refetch()}>Thử lại</Button>}
            description="Vui lòng thử tải lại danh sách địa chỉ đã lưu."
            title="Không thể tải sổ địa chỉ"
          />
        ) : null}
        {addressesQuery.isSuccess && addresses.length === 0 ? (
          <EmptyState
            action={<Link className={buttonStyles({ className: 'account-primary-action' })} to={routePaths.profileAddressNew()}>Tạo địa chỉ đầu tiên</Link>}
            description="Lưu địa chỉ nhận hàng để chọn nhanh khi thanh toán."
            title="Bạn chưa lưu địa chỉ nào"
          />
        ) : null}
        {updateAddress.isError ? <p className="mb-4 text-sm text-danger" role="alert">{updateAddress.error.message}</p> : null}
        {addressesQuery.isSuccess && addresses.length > 0 ? (
          <ul className="space-y-5">
            {addresses.map((address) => (
              <li key={address.id}>
                <article className={cn(
                  'overflow-hidden rounded-card border border-border bg-surface',
                  address.isDefault && 'border-t-4 border-t-brand-primary',
                )}>
                  <div className="space-y-3 p-5 [overflow-wrap:anywhere] sm:p-6">
                    <div className="flex flex-wrap gap-2">
                      {address.isDefault ? (
                        <span className="inline-flex min-h-6 items-center gap-1 rounded-chip bg-brand-primary px-2 text-xs font-medium text-white">
                          <CheckCircle2 aria-hidden="true" className="h-3.5 w-3.5" /> Mặc định
                        </span>
                      ) : null}
                      {address.label ? <Badge tone="neutral">{address.label}</Badge> : null}
                      <Badge tone="neutral">{addressTypeLabels[address.addressType]}</Badge>
                    </div>
                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                      <h2 className="min-w-0 text-base font-semibold">{address.receiverName}</h2>
                      <p className="text-sm text-text-secondary">{address.phoneNumber}</p>
                    </div>
                    <div className="space-y-1 text-sm leading-6 text-text-secondary">
                      <p className="font-medium text-text-primary">{address.streetAddress}</p>
                      <p>{[address.ward, address.district, address.city].filter(Boolean).join(', ')}</p>
                      {address.postalCode ? <p className="text-xs">Mã bưu chính {address.postalCode}</p> : null}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-x-3 border-t border-border bg-surface-muted px-3 py-2 sm:px-5">
                    {address.isDefault ? (
                      <p className="flex min-h-11 items-center gap-2 px-2 text-xs text-brand-primary">
                        <MapPin aria-hidden="true" className="h-4 w-4" /> Địa chỉ nhận hàng mặc định
                      </p>
                    ) : (
                      <Button
                        className="!text-sm !tracking-normal"
                        disabled={updatingDefault}
                        loading={updateAddress.isPending && updateAddress.variables?.addressId === address.id}
                        onClick={() => updateAddress.mutate({ addressId: address.id, payload: { isDefault: true } }, {
                          onSuccess: () => addToast({ tone: 'success', title: 'Đã cập nhật địa chỉ mặc định' }),
                        })}
                        variant="ghost"
                      >
                        Đặt làm mặc định
                      </Button>
                    )}
                    <div className="flex items-center">
                      <Link
                        aria-label={`Chỉnh sửa địa chỉ của ${address.receiverName}`}
                        className="inline-flex min-h-11 items-center rounded-button px-3 text-sm font-medium underline underline-offset-4"
                        to={routePaths.profileAddressEdit(address.id)}
                      >
                        Chỉnh sửa
                      </Link>
                      <Button
                        aria-label={`Xóa địa chỉ của ${address.receiverName}`}
                        className="!text-danger !text-sm !tracking-normal"
                        disabled={updateAddress.isPending}
                        onClick={() => setAddressToDelete(address)}
                        variant="ghost"
                      >
                        Xóa
                      </Button>
                    </div>
                  </div>
                </article>
              </li>
            ))}
          </ul>
        ) : null}
      </AccountWorkspace>
      {addressToDelete ? <DeleteAddressDialog address={addressToDelete} onClose={closeDelete} /> : null}
    </>
  );
};

export default AddressBookPage;
