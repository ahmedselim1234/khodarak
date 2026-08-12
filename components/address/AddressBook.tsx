"use client";

import { useState } from "react";
import { MapPinPlus } from "lucide-react";
import {
  useListAddressesQuery,
  useDeleteAddressMutation,
  useUpdateAddressMutation,
  type Address,
} from "@/lib/store/addressesApi";
import { AddressCard } from "@/components/address/AddressCard";
import { AddressForm } from "@/components/address/AddressForm";

type FormState = { mode: "closed" } | { mode: "create" } | { mode: "edit"; address: Address };

export function AddressBook({ cities }: { cities: { id: string; nameAr: string }[] }) {
  const { data: addresses, isLoading, isError } = useListAddressesQuery();
  const [deleteAddress, { isLoading: deleting }] = useDeleteAddressMutation();
  const [updateAddress, { isLoading: settingDefault }] = useUpdateAddressMutation();
  const [formState, setFormState] = useState<FormState>({ mode: "closed" });

  const busy = deleting || settingDefault;

  async function handleDelete(id: string) {
    await deleteAddress(id);
  }

  async function handleSetDefault(id: string) {
    await updateAddress({ id, body: { isDefault: true } });
  }

  if (isLoading) {
    return (
      <p className="font-body-md text-body-md text-on-surface-variant">جارٍ التحميل...</p>
    );
  }

  if (isError) {
    return (
      <p className="font-body-md text-body-md text-error">
        تعذر تحميل العناوين. حاول تحديث الصفحة.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
      {(addresses ?? []).map((address) => (
        <AddressCard
          key={address.id}
          address={address}
          busy={busy}
          onEdit={() => setFormState({ mode: "edit", address })}
          onDelete={() => handleDelete(address.id)}
          onSetDefault={() => handleSetDefault(address.id)}
        />
      ))}

      {formState.mode === "closed" && (
        <button
          type="button"
          onClick={() => setFormState({ mode: "create" })}
          className="group flex h-full min-h-[200px] flex-col items-center justify-center gap-3 rounded-organic border border-dashed border-outline-variant p-6 text-on-surface-variant transition-colors duration-fast hover:border-primary hover:bg-surface-container-low hover:text-primary"
        >
          <div className="flex size-12 items-center justify-center rounded-full bg-surface-container-high transition-colors duration-fast group-hover:bg-primary-container group-hover:text-on-primary-container">
            <MapPinPlus className="size-5" aria-hidden="true" />
          </div>
          <span className="text-small font-semibold">إضافة عنوان جديد</span>
        </button>
      )}

      {formState.mode !== "closed" && (
        <AddressForm
          cities={cities}
          existingAddress={formState.mode === "edit" ? formState.address : undefined}
          onSuccess={() => setFormState({ mode: "closed" })}
          onCancel={() => setFormState({ mode: "closed" })}
        />
      )}
    </div>
  );
}
