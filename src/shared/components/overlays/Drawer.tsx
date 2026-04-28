import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { X } from 'lucide-react';

type DrawerProps = {
  open: boolean;
  title: string;
  side?: 'left' | 'right';
  children: React.ReactNode;
  onClose: () => void;
};

export const Drawer = ({ children, onClose, open, side = 'right', title }: DrawerProps) => {
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

  const startX = side === 'right' ? '100%' : '-100%';

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm"
          exit={reducedMotion ? { opacity: 1 } : { opacity: 0 }}
          initial={reducedMotion ? { opacity: 1 } : { opacity: 0 }}
          onClick={onClose}
          transition={reducedMotion ? { duration: 0 } : { duration: 0.18 }}
        >
          <motion.div
            animate={{ x: 0 }}
            className={`absolute ${side === 'right' ? 'right-0' : 'left-0'} top-0 h-full w-full max-w-md overflow-y-auto bg-canvas px-6 py-8 shadow-modal`}
            exit={reducedMotion ? { x: 0 } : { x: startX }}
            initial={reducedMotion ? { x: 0 } : { x: startX }}
            onClick={(event) => event.stopPropagation()}
            ref={panelRef}
            aria-modal="true"
            role="dialog"
            tabIndex={-1}
            transition={reducedMotion ? { duration: 0 } : { duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-center justify-between border-b border-border pb-5">
              <h2 className="font-display text-[1.75rem] leading-none">{title}</h2>
              <button
                aria-label="Close drawer"
                className="rounded-full p-2 transition-colors hover:bg-surface-soft hover:text-brand-primary"
                onClick={onClose}
                type="button"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-8">{children}</div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
};
