import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { X } from 'lucide-react';

type DrawerProps = {
  open: boolean;
  title: string;
  side?: 'left' | 'right';
  appearance?: 'filters';
  children: React.ReactNode;
  onClose: () => void;
};

export const Drawer = ({ appearance, children, onClose, open, side = 'right', title }: DrawerProps) => {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const titleId = useId();
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
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

      if (event.shiftKey && (activeElement === firstElement || activeElement === panelRef.current)) {
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
      previouslyFocused?.focus();
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose, open]);

  if (typeof document === 'undefined') {
    return null;
  }

  const startX = side === 'right' ? '100%' : '-100%';
  const isFilterDrawer = appearance === 'filters';

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          animate={{ opacity: 1 }}
          className={`fixed inset-0 bg-black/20 ${isFilterDrawer ? 'z-[60]' : 'z-50 backdrop-blur-sm'}`}
          exit={reducedMotion ? { opacity: 1 } : { opacity: 0 }}
          initial={reducedMotion ? { opacity: 1 } : { opacity: 0 }}
          onClick={onClose}
          transition={reducedMotion ? { duration: 0 } : { duration: 0.18 }}
        >
          <motion.div
            animate={{ x: 0 }}
            className={`absolute ${side === 'right' ? 'right-0' : 'left-0'} top-0 h-full w-full max-w-md overflow-y-auto shadow-modal ${isFilterDrawer ? 'bg-surface p-5' : 'bg-canvas px-6 py-8'}`}
            exit={reducedMotion ? { x: 0 } : { x: startX }}
            initial={reducedMotion ? { x: 0 } : { x: startX }}
            onClick={(event) => event.stopPropagation()}
            ref={panelRef}
            aria-modal="true"
            aria-labelledby={titleId}
            role="dialog"
            tabIndex={-1}
            transition={reducedMotion ? { duration: 0 } : { duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className={`flex items-center justify-between ${isFilterDrawer ? 'rounded bg-[rgb(var(--discovery-panel))] pl-3' : 'border-b border-border pb-5'}`}>
              <h2 className={`font-semibold leading-tight ${isFilterDrawer ? 'text-sm' : 'text-xl'}`} id={titleId}>{title}</h2>
              <button
                aria-label={isFilterDrawer ? 'Đóng bộ lọc' : 'Close drawer'}
                className="inline-flex h-11 w-11 items-center justify-center rounded-button transition-colors hover:bg-surface-soft hover:text-brand-primary"
                onClick={onClose}
                type="button"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className={isFilterDrawer ? 'mt-5' : 'mt-8'}>{children}</div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
};
