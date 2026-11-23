import { useMemo, useState } from 'react';

import { routes } from '@/constants/routes';
import { useOrders } from '@/features/orders/hooks/useOrders';
import { OrderCard } from '@/shared/components/commerce/OrderCard';
import { EmptyState } from '@/shared/components/feedback/EmptyState';
import { ErrorCard } from '@/shared/components/feedback/ErrorCard';
import { LoadingOverlay } from '@/shared/components/feedback/LoadingOverlay';
import { BreadcrumbNav } from '@/shared/components/layout/BreadcrumbNav';
import { Container } from '@/shared/components/layout/Container';
import { PageSEO } from '@/shared/components/seo/PageSEO';
import { Button } from '@/shared/components/ui/Button';
import { ORDER_STATUSES, type OrderStatus } from '@/shared/types/enums';

type OrderFilter = 'ALL' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

const filterOptions: Array<{ key: OrderFilter; label: string; statuses: OrderStatus[] | null }> = [
  { key: 'ALL', label: 'Tất cả', statuses: null },
  {
    key: 'PROCESSING',
    label: 'Đang xử lý',
    statuses: [ORDER_STATUSES.PENDING, ORDER_STATUSES.AWAITING_PAYMENT, ORDER_STATUSES.CONFIRMED],
  },
  { key: 'SHIPPED', label: 'Đang giao', statuses: [ORDER_STATUSES.PROCESSING, ORDER_STATUSES.SHIPPED] },
  { key: 'DELIVERED', label: 'Đã giao', statuses: [ORDER_STATUSES.DELIVERED, ORDER_STATUSES.COMPLETED] },
  { key: 'CANCELLED', label: 'Đã hủy', statuses: [ORDER_STATUSES.CANCELLED] },
] as const;

export const OrdersPage = () => {
  const [activeFilter, setActiveFilter] = useState<OrderFilter>('ALL');
  const ordersQuery = useOrders();

  const filteredOrders = useMemo(() => {
    if (!ordersQuery.data) {
      return [];
    }

    const currentFilter = filterOptions.find((option) => option.key === activeFilter);
    if (!currentFilter || currentFilter.statuses === null) {
      return ordersQuery.data.items;
    }

    return ordersQuery.data.items.filter((order) => currentFilter.statuses?.includes(order.status));
  }, [activeFilter, ordersQuery.data]);

  return (
    <>
      <PageSEO description="Browse customer order history, current statuses, and cancel eligible orders." noIndex path={routes.orders} title="Orders" />
      <Container className="space-y-6 pb-16 pt-24 md:pb-20 md:pt-28">
        <header className="space-y-5 border-b border-border pb-6">
          <BreadcrumbNav items={[{ label: "Trang chủ", href: routes.home }, { label: "Tài khoản", href: routes.profile }, { label: "Đơn hàng" }]} />
          <p className="text-xs font-semibold uppercase tracking-widest text-text-secondary">Lịch sử giao dịch và vận chuyển</p>
          <h1 className="text-3xl font-semibold md:text-4xl">Đơn hàng của bạn</h1>
        </header>
        <div aria-label="Lọc đơn hàng theo trạng thái" className="overflow-x-auto py-1">
          <div className="flex min-w-max gap-2" role="group">
            {filterOptions.map((option) => (
              <button
                aria-pressed={activeFilter === option.key}
                className={`min-h-11 border px-4 py-2 text-sm font-medium transition-colors ${
                  activeFilter === option.key ? 'border-brand-primary bg-brand-primary text-surface' : 'border-border bg-surface text-text-secondary hover:border-brand-primary hover:text-text-primary'
                }`}
                key={option.key}
                onClick={() => setActiveFilter(option.key)}
                type="button"
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
        {ordersQuery.isLoading ? <LoadingOverlay className="min-h-[320px] border-border bg-surface" inline label="Đang tải đơn hàng…" /> : null}
        {ordersQuery.isError ? (
          <ErrorCard
            action={<Button onClick={() => void ordersQuery.refetch()}>Thử lại</Button>}
            className="border-border bg-surface"
            description="Không thể tải dữ liệu đơn hàng. Vui lòng thử lại."
            title="Chưa tải được đơn hàng"
          />
        ) : null}
        {ordersQuery.data && filteredOrders.length === 0 ? (
          <EmptyState
            className="border-border bg-surface px-6 py-16"
            description="Chọn trạng thái khác để xem những đơn hàng còn lại."
            title="Chưa có đơn hàng trong mục này"
          />
        ) : null}
        <div className="mt-6 space-y-4">
          {filteredOrders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      </Container>
    </>
  );
};

export default OrdersPage;
