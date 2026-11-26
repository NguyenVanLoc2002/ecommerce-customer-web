import { useRef } from 'react';

export const useAuthAction = () => {
  const active = useRef(false);

  return async (action: () => Promise<void>) => {
    if (active.current) return;

    active.current = true;
    try {
      await action();
    } finally {
      active.current = false;
    }
  };
};
