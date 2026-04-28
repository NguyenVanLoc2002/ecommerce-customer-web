import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
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
  const reducedMotion = useReducedMotion();

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
        return;
      }

      if (event.key !== 'Tab' || !panelRef.current) {
        return;
      }

      const focusableElements = panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );

      if (focusableElements.length === 0) {
        event.preventDefault();
        panelRef.current.focus();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      const activeElement = document.activeElement;

      if (event.shiftKey && activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
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
          exit={reducedMotion ? { opacity: 1 } : { opacity: 0 }}
          initial={reducedMotion ? { opacity: 1 } : { opacity: 0 }}
          transition={reducedMotion ? { duration: 0 } : { duration: 0.18 }}
        >
          <motion.div
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className={cn('w-full max-w-lg rounded-feature bg-white p-6 shadow-modal', panelClassName)}
            exit={reducedMotion ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 12, scale: 0.98 }}
            initial={reducedMotion ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 16, scale: 0.98 }}
            ref={panelRef}
            aria-modal="true"
            role="dialog"
            tabIndex={-1}
            transition={reducedMotion ? { duration: 0 } : { duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
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
