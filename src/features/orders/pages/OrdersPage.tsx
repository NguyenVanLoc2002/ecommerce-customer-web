import { useMemo, useState } from 'react';

import { routes } from '@/constants/routes';
import { useOrders } from '@/features/orders/hooks/useOrders';
import { OrderCard } from '@/shared/components/commerce/OrderCard';
import { EmptyState } from '@/shared/components/feedback/EmptyState';
import { ErrorCard } from '@/shared/components/feedback/ErrorCard';
import { LoadingOverlay } from '@/shared/components/feedback/LoadingOverlay';
import { AccountShell } from '@/shared/components/layout/AccountShell';
import { Container } from '@/shared/components/layout/Container';
import { PageSEO } from '@/shared/components/seo/PageSEO';
import { Button } from '@/shared/components/ui/Button';
import { ORDER_STATUSES, type OrderStatus } from '@/shared/types/enums';

type OrderFilter = 'ALL' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

const filterOptions: Array<{ key: OrderFilter; label: string; statuses: OrderStatus[] | null }> = [
  { key: 'ALL', label: 'All Orders', statuses: null },
  {
    key: 'PROCESSING',
    label: 'Processing',
    statuses: [ORDER_STATUSES.PENDING, ORDER_STATUSES.AWAITING_PAYMENT, ORDER_STATUSES.CONFIRMED],
  },
  { key: 'SHIPPED', label: 'Shipped', statuses: [ORDER_STATUSES.PROCESSING, ORDER_STATUSES.SHIPPED] },
  { key: 'DELIVERED', label: 'Delivered', statuses: [ORDER_STATUSES.DELIVERED, ORDER_STATUSES.COMPLETED] },
  { key: 'CANCELLED', label: 'Cancelled', statuses: [ORDER_STATUSES.CANCELLED] },
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
      <Container className="pb-16 pt-28 md:pb-20 md:pt-32">
        <AccountShell
          description="Review every placed order, narrow the archive by fulfillment stage, and open the full transaction detail when needed."
          eyebrow="Order archive"
          title="Order History"
        >
          <div className="sticky top-20 z-20 border-y border-border bg-canvas/95 py-4 backdrop-blur">
            <div className="flex flex-wrap gap-3">
              {filterOptions.map((option) => (
                <button
                  className={`border px-4 py-3 text-[11px] font-bold uppercase tracking-[0.18em] transition-colors ${
                    activeFilter === option.key ? 'border-text-primary bg-text-primary text-surface' : 'border-border bg-surface text-text-primary hover:border-text-primary'
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
          {ordersQuery.isLoading ? <LoadingOverlay className="min-h-[320px] border-border bg-surface" inline label="Loading orders..." /> : null}
          {ordersQuery.isError ? (
            <ErrorCard
              action={<Button onClick={() => void ordersQuery.refetch()}>Retry</Button>}
              className="border-border bg-surface"
              description="The mock order history could not be loaded."
              title="Order history unavailable"
            />
          ) : null}
          {ordersQuery.data && filteredOrders.length === 0 ? (
            <EmptyState
              className="border-border bg-surface px-6 py-16"
              description="New orders placed through checkout will appear here immediately."
              title="No orders match this view."
            />
          ) : null}
          <div className="space-y-5">
            {filteredOrders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        </AccountShell>
      </Container>
    </>
  );
};

export default OrdersPage;
