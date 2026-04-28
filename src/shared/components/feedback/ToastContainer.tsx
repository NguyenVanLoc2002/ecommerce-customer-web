import { useEffect } from 'react';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

import { Toast } from '@/shared/components/feedback/Toast';
import { useUiStore } from '@/shared/stores/uiStore';

export const ToastContainer = () => {
  const removeToast = useUiStore((state) => state.removeToast);
  const toasts = useUiStore((state) => state.toasts);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const timers = toasts.map((toast) =>
      window.setTimeout(() => {
        removeToast(toast.id);
      }, 3500),
    );

    return () => {
      timers.forEach((timerId) => window.clearTimeout(timerId));
    };
  }, [removeToast, toasts]);

  return (
    <div aria-atomic="true" aria-live="assertive" className="pointer-events-none fixed right-4 top-4 z-[90] flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-3">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="pointer-events-auto"
            exit={reducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: -12 }}
            initial={reducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: -16 }}
            key={toast.id}
            transition={reducedMotion ? { duration: 0 } : { duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          >
            <Toast onDismiss={removeToast} toast={toast} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
