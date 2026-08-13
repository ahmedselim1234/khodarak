"use client";

import { useState } from "react";
import { MapPinPlus } from "lucide-react";
import { useListAddressesQuery, type Address } from "@/lib/store/addressesApi";
import { AddressForm } from "@/components/address/AddressForm";
import { Dialog } from "@/components/ui/Dialog";

// "use client" leaf — reads the existing address book (Phase 1) and, when
// `cities` is supplied, lets the customer add one in place (FR-007).
//
// The add flow used to be a <Link> to /dashboard/settings, which unmounted
// the subscription wizard and silently discarded the frequency, first
// delivery date and time slot the customer had already picked. Creating the
// address in a dialog keeps the wizard mounted, so nothing can be lost.
//
// `cities` is optional because SubscriptionEditor renders this inside its own
// hand-rolled overlay, where a nested dialog would stack two modals; that
// caller edits a subscription that already has an address, so it opts out by
// omitting the prop.
export function AddressSelector({
  value,
  onChange,
  cities,
  onCreated,
}: {
  value: string | null;
  onChange: (addressId: string) => void;
  cities?: { id: string; nameAr: string }[];
  onCreated?: (address: Address) => void;
}) {
  const { data: addresses, isLoading } = useListAddressesQuery();
  const [dialogOpen, setDialogOpen] = useState(false);

  const canAdd = Boolean(cities && cities.length > 0);

  function handleCreated(address: Address) {
    setDialogOpen(false);
    // Auto-select what the customer just typed — the whole point of adding an
    // address here is to unblock checkout, so making them tap it again is
    // pure friction.
    onChange(address.id);
    onCreated?.(address);
  }

  const dialog = dialogOpen && cities && (
    <Dialog title="عنوان جديد" onClose={() => setDialogOpen(false)}>
      <AddressForm
        cities={cities}
        onSuccess={handleCreated}
        onCancel={() => setDialogOpen(false)}
      />
    </Dialog>
  );

  if (isLoading) {
    return <p className="font-body-md text-body-md text-on-surface-variant">جارٍ التحميل...</p>;
  }

  if (!addresses || addresses.length === 0) {
    return (
      <div className="flex flex-col gap-stack-sm bg-surface-container-low rounded-2xl p-stack-md text-center">
        <p className="font-body-md text-body-md text-on-surface-variant">
          لا توجد عناوين محفوظة — يلزم إضافة عنوان قبل إتمام الطلب
        </p>
        {canAdd && (
          <button
            type="button"
            onClick={() => setDialogOpen(true)}
            className="text-primary font-bold hover:underline"
          >
            إضافة عنوان جديد
          </button>
        )}
        {dialog}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <h3 className="font-headline-md text-headline-md text-primary font-bold">العنوان</h3>
      <div className="flex flex-col gap-2">
        {addresses.map((address) => (
          <button
            key={address.id}
            type="button"
            onClick={() => onChange(address.id)}
            className={
              value === address.id
                ? "p-4 rounded-2xl border-2 border-primary bg-primary-fixed-dim/20 text-right"
                : "p-4 rounded-2xl border-2 border-outline-variant text-right hover:bg-surface-container-low transition-all"
            }
          >
            <p className="font-bold">{address.label}</p>
            <p className="text-[12px] text-on-surface-variant">
              {address.cityName}، {address.district}
            </p>
          </button>
        ))}
        {canAdd && (
          <button
            type="button"
            onClick={() => setDialogOpen(true)}
            className="group flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-outline-variant p-4 text-on-surface-variant transition-colors duration-fast hover:border-primary hover:bg-surface-container-low hover:text-primary"
          >
            <MapPinPlus className="size-4" aria-hidden="true" />
            <span className="font-bold">إضافة عنوان جديد</span>
          </button>
        )}
      </div>
      {dialog}
    </div>
  );
}
