import { Button } from '@/shared/components/ui/Button';
import { Modal } from '@/shared/components/overlays/Modal';

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onClose: () => void;
};

export const ConfirmDialog = ({
  cancelLabel = 'Cancel',
  confirmLabel = 'Confirm',
  description,
  onClose,
  onConfirm,
  open,
  title,
}: ConfirmDialogProps) => (
  <Modal
    onClose={onClose}
    open={open}
    panelClassName="max-w-xl rounded-card border border-border bg-canvas px-6 py-6 shadow-card"
    title={title}
  >
    <p className="max-w-lg text-sm leading-7 text-text-secondary">{description}</p>
    <div className="mt-8 flex flex-wrap justify-end gap-3">
      <Button className="min-w-[152px]" onClick={onClose} variant="ghost">
        {cancelLabel}
      </Button>
      <Button className="min-w-[152px]" onClick={onConfirm}>
        {confirmLabel}
      </Button>
    </div>
  </Modal>
);
