import { create } from 'zustand';

export type ToastTone = 'success' | 'danger' | 'info';

export type ToastItem = {
  id: string;
  title: string;
  description?: string;
  tone: ToastTone;
};

type UiState = {
  toasts: ToastItem[];
  isMobileNavOpen: boolean;
  addToast: (toast: Omit<ToastItem, 'id'>) => void;
  removeToast: (id: string) => void;
  openMobileNav: () => void;
  closeMobileNav: () => void;
};

export const useUiStore = create<UiState>((set) => ({
  toasts: [],
  isMobileNavOpen: false,
  addToast: (toast) =>
    set((state) => ({
      toasts: [
        ...state.toasts,
        {
          id: crypto.randomUUID(),
          ...toast,
        },
      ],
    })),
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    })),
  openMobileNav: () => set({ isMobileNavOpen: true }),
  closeMobileNav: () => set({ isMobileNavOpen: false }),
}));

