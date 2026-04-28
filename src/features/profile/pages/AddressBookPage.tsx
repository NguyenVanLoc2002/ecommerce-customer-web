import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, PencilLine, Phone, Plus, Trash2 } from 'lucide-react';

import { routePaths, routes } from '@/constants/routes';
import { useAddresses, useDeleteAddress } from '@/shared/hooks/useAddresses';
import { EmptyState } from '@/shared/components/feedback/EmptyState';
import { ErrorCard } from '@/shared/components/feedback/ErrorCard';
import { ConfirmDialog } from '@/shared/components/overlays/ConfirmDialog';
import { AccountShell } from '@/shared/components/layout/AccountShell';
import { Container } from '@/shared/components/layout/Container';
import { PageSEO } from '@/shared/components/seo/PageSEO';
import { Badge } from '@/shared/components/ui/Badge';
import { Button } from '@/shared/components/ui/Button';
import { buttonStyles } from '@/shared/components/ui/buttonStyles';
import { useUiStore } from '@/shared/stores/uiStore';
import type { Address } from '@/shared/types/address.types';
import { formatAddress } from '@/shared/utils/formatAddress';

const cardActionClassName =
  'inline-flex items-center gap-2 border-b border-transparent pb-1 text-[11px] font-bold uppercase tracking-[0.16em] text-text-secondary transition-colors hover:border-border hover:text-text-primary';

export const AddressBookPage = () => {
  const addToast = useUiStore((state) => state.addToast);
  const addressesQuery = useAddresses();
  const deleteAddress = useDeleteAddress();
  const [addressToDelete, setAddressToDelete] = useState<Address | null>(null);
  const addresses = addressesQuery.data ?? [];

  return (
    <>
      <PageSEO description="Manage saved delivery destinations for checkout and future orders." noIndex path={routes.profileAddresses} title="Address Book" />
      <Container className="pb-16 pt-28 md:pb-20 md:pt-32">
        <AccountShell
          activeTab="addresses"
          actions={
            <Link className={buttonStyles({})} to={routePaths.profileAddressNew()}>
              <Plus className="h-4 w-4" />
              Add new address
            </Link>
          }
          description="Store frequently used delivery destinations, set a default handoff point, and keep checkout routing friction-free."
          eyebrow="Curated space"
          title="Address Book"
        >
          {addressesQuery.isLoading ? (
            <div className="grid gap-4 md:grid-cols-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <div className="border border-border bg-surface px-5 py-6 md:px-6" key={index}>
                  <div className="shimmer animate-shimmer space-y-4">
                    <div className="h-5 w-28 bg-surface-soft" />
                    <div className="h-10 w-40 bg-surface-soft" />
                    <div className="h-4 w-full bg-surface-soft" />
                    <div className="h-4 w-4/5 bg-surface-soft" />
                    <div className="h-4 w-32 bg-surface-soft" />
                  </div>
                </div>
              ))}
            </div>
          ) : null}
          {addressesQuery.isError ? (
            <ErrorCard
              action={<Button onClick={() => void addressesQuery.refetch()}>Retry</Button>}
              className="border-border bg-surface"
              description="Your saved destinations could not be loaded from the active customer address source."
              title="Address book unavailable"
            />
          ) : null}
          {!addressesQuery.isLoading && !addressesQuery.isError && addresses.length === 0 ? (
            <EmptyState
              action={
                <Link className={buttonStyles({})} to={routePaths.profileAddressNew()}>
                  Add first address
                </Link>
              }
              className="border-border bg-surface px-6 py-16"
              description="Delivery destinations will appear here once you add one from the customer account."
              title="No saved addresses yet."
            />
          ) : null}
          {!addressesQuery.isLoading && !addressesQuery.isError && addresses.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {addresses.map((address) => (
                <article className="border border-border bg-surface px-5 py-6 transition-colors hover:border-text-primary md:px-6" key={address.id}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex flex-wrap gap-2">
                      {address.isDefault ? <Badge>Default</Badge> : null}
                      <Badge tone="neutral">{address.addressType}</Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-4">
                      <Link className={cardActionClassName} to={routePaths.profileAddressEdit(address.id)}>
                        <PencilLine className="h-4 w-4" />
                        Edit
                      </Link>
                      <button className={cardActionClassName} onClick={() => setAddressToDelete(address)} type="button">
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </button>
                    </div>
                  </div>

                  <div className="mt-6">
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-outline">{address.label || 'Saved location'}</p>
                    <h2 className="mt-3 font-display text-[2rem] leading-none text-text-primary">{address.receiverName}</h2>
                    <p className="mt-4 text-sm leading-7 text-text-secondary">{formatAddress(address)}</p>
                  </div>

                  <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-border pt-4 text-sm text-text-secondary">
                    <Phone className="h-4 w-4" />
                    <span>{address.phoneNumber}</span>
                  </div>
                </article>
              ))}

              <Link
                className="flex min-h-[260px] flex-col items-center justify-center gap-4 border border-dashed border-border bg-surface-muted px-6 py-8 text-center transition-colors hover:border-text-primary hover:bg-surface"
                to={routePaths.profileAddressNew()}
              >
                <span className="inline-flex h-14 w-14 items-center justify-center rounded-full border border-border bg-surface">
                  <MapPin className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-outline">Register new</p>
                  <h2 className="mt-3 font-display text-[1.9rem] leading-none text-text-primary">Delivery location</h2>
                </div>
              </Link>
            </div>
          ) : null}
        </AccountShell>
      </Container>

      <ConfirmDialog
        cancelLabel="Keep address"
        confirmLabel={deleteAddress.isPending ? 'Deleting...' : 'Delete address'}
        description="This removes the saved destination from your customer address book. Checkout selections will need a new address if this one was active."
        onClose={() => setAddressToDelete(null)}
        onConfirm={() => {
          if (!addressToDelete) {
            return;
          }

          deleteAddress.mutate(addressToDelete.id, {
            onSuccess: () => {
              addToast({
                tone: 'success',
                title: 'Address deleted',
                description: `${addressToDelete.receiverName}'s destination was removed.`,
              });
              setAddressToDelete(null);
            },
            onError: (error) => {
              addToast({
                tone: 'danger',
                title: 'Address delete failed',
                description: error instanceof Error ? error.message : 'Try again.',
              });
            },
          });
        }}
        open={Boolean(addressToDelete)}
        title="Delete this address?"
      />
    </>
  );
};

export default AddressBookPage;
