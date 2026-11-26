import type { ReactNode } from 'react';

import { Drawer } from '@/shared/components/overlays/Drawer';

type FilterDrawerProps = {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
};

export const FilterDrawer = ({ children, onClose, open }: FilterDrawerProps) => (
  <Drawer appearance="filters" onClose={onClose} open={open} title="Bộ lọc sản phẩm">
    {children}
  </Drawer>
);
