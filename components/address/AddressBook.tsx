"use client";

import { useState } from "react";
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
          className="border-2 border-dashed border-outline-variant rounded-organic p-stack-lg flex flex-col items-center justify-center gap-4 hover:bg-surface-container-high transition-all text-on-surface-variant group h-full min-h-[200px]"
        >
          <div className="w-16 h-16 rounded-full bg-surface-container-highest flex items-center justify-center group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined !text-4xl">add_location_alt</span>
          </div>
          <span className="font-bold text-headline-md">إضافة عنوان جديد</span>
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
