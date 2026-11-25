import { useCallback } from 'react';

import { Modal } from '@/shared/components/overlays/Modal';
import { Button } from '@/shared/components/ui/Button';
import { useDeleteAddress } from '@/shared/hooks/useAddresses';
import { useUiStore } from '@/shared/stores/uiStore';
import type { Address } from '@/shared/types/address.types';
import { formatAddress } from '@/shared/utils/formatAddress';

type DeleteAddressDialogProps = {
  address: Address;
  onClose: () => void;
  onDeleted?: () => void;
};

export const DeleteAddressDialog = ({ address, onClose, onDeleted }: DeleteAddressDialogProps) => {
  const deletion = useDeleteAddress();
  const addToast = useUiStore((state) => state.addToast);
  const close = useCallback(() => {
    if (!deletion.isPending) onClose();
  }, [deletion.isPending, onClose]);

  return (
    <Modal open onClose={close} panelClassName="max-w-md rounded-card" title="Xóa địa chỉ nhận hàng?">
      <p className="break-words text-sm leading-6 text-text-secondary">
        Địa chỉ của {address.receiverName} tại {formatAddress(address)} sẽ bị xóa khỏi sổ địa chỉ.
      </p>
      {deletion.isError ? <p className="mt-3 text-sm text-danger" role="alert">{deletion.error.message}</p> : null}
      <div className="mt-6 grid gap-3 sm:flex sm:justify-end">
        <Button disabled={deletion.isPending} onClick={close} variant="secondary">Giữ địa chỉ</Button>
        <Button
          loading={deletion.isPending}
          onClick={() => deletion.mutate(address.id, {
            onSuccess: () => {
              addToast({ tone: 'success', title: 'Đã xóa địa chỉ' });
              onClose();
              onDeleted?.();
            },
          })}
          variant="danger"
        >
          {deletion.isPending ? 'Đang xóa…' : 'Xóa địa chỉ'}
        </Button>
      </div>
    </Modal>
  );
};
