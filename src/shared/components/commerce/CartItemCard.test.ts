import { createElement, type AnchorHTMLAttributes, type ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import type { CartItem } from '@/shared/types/commerce.types';

import { CartItemCard } from './CartItemCard';

vi.mock('react-router-dom', () => ({
  Link: ({ children, to, ...props }: AnchorHTMLAttributes<HTMLAnchorElement> & { children: ReactNode; to: string }) =>
    createElement('a', { ...props, href: to }, children),
}));

const item: CartItem = {
  id: 'line-1',
  productId: 'product-1',
  productSlug: 'linen-shirt',
  productName: 'Áo sơ mi linen',
  brandName: 'Fashion Shop',
  variantId: 'variant-1',
  variantName: 'Màu: Xám đá / Cỡ: M / Chất liệu: Linen',
  sku: 'SKU-1',
  color: 'Xám đá',
  size: 'M',
  quantity: 2,
  unitPrice: 250000,
  subtotal: 500000,
  stockAvailable: 1,
  primaryImage: { id: 'image-1', src: '/shirt.jpg', alt: 'Áo sơ mi linen', width: 800, height: 1000 },
  isStale: true,
};

const renderCartItem = (updating = false) =>
  renderToStaticMarkup(
    createElement(CartItemCard, { item, onQuantityChange: () => undefined, onRemove: () => undefined, updating }),
  );

describe('CartItemCard', () => {
  it('shows the API variant, VND prices, stock warning, and accessible cart controls', () => {
    const markup = renderCartItem();

    expect(markup).toContain('Màu: Xám đá / Cỡ: M / Chất liệu: Linen');
    expect(markup).toContain('250.000');
    expect(markup).toContain('500.000');
    expect(markup).toContain('Còn 1 sản phẩm');
    expect(markup).toContain('aria-label="Decrease quantity for Áo sơ mi linen"');
    expect(markup).toContain('aria-label="Xóa Áo sơ mi linen khỏi giỏ hàng"');
    expect(markup).toContain('alt="Áo sơ mi linen"');
    expect(markup).toContain('width="800"');
    expect(markup).toContain('height="1000"');
  });

  it('locks quantity and removal controls while a mutation is pending', () => {
    const markup = renderCartItem(true);

    expect(markup).toContain('aria-busy="true"');
    expect(markup).toContain('Đang cập nhật số lượng');
    expect(markup.match(/disabled=""/g)).toHaveLength(4);
  });
});
