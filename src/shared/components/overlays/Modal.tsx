import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';

import { cn } from '@/shared/utils/cn';

type ModalProps = {
  open: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  panelClassName?: string;
  overlayClassName?: string;
};

export const Modal = ({ children, onClose, open, overlayClassName, panelClassName, title }: ModalProps) => {
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panelRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose, open]);

  if (typeof document === 'undefined') {
    return null;
  }

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          animate={{ opacity: 1 }}
          className={cn('fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4', overlayClassName)}
          exit={{ opacity: 0 }}
          initial={{ opacity: 0 }}
        >
          <motion.div
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className={cn('w-full max-w-lg rounded-feature bg-white p-6 shadow-modal', panelClassName)}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            ref={panelRef}
            role="dialog"
            tabIndex={-1}
          >
            <div className="flex items-center justify-between gap-4">
              <h2 className="font-display text-2xl">{title}</h2>
              <button
                aria-label="Close dialog"
                className="rounded-full p-2 transition-colors hover:bg-brand-subtle hover:text-brand-primary"
                onClick={onClose}
                type="button"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-6">{children}</div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
};
