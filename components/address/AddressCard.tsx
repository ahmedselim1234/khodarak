"use client";

import type { Address } from "@/lib/store/addressesApi";

export function AddressCard({
  address,
  onEdit,
  onDelete,
  onSetDefault,
  busy = false,
}: {
  address: Address;
  onEdit: () => void;
  onDelete: () => void;
  onSetDefault: () => void;
  busy?: boolean;
}) {
  return (
    <div className="organic-shadow bg-surface-container-lowest rounded-organic p-stack-lg border border-outline-variant/30 relative flex flex-col gap-stack-sm">
      <div className="absolute top-4 left-4 flex gap-2">
        <button
          type="button"
          onClick={onDelete}
          disabled={busy}
          className="p-2 hover:bg-error-container/20 rounded-full text-error transition-colors disabled:opacity-50"
          aria-label="حذف العنوان"
        >
          <span className="material-symbols-outlined">delete</span>
        </button>
        <button
          type="button"
          onClick={onEdit}
          disabled={busy}
          className="p-2 hover:bg-primary-container/20 rounded-full text-primary transition-colors disabled:opacity-50"
          aria-label="تعديل العنوان"
        >
          <span className="material-symbols-outlined">edit</span>
        </button>
      </div>
      <div className="bg-primary-fixed w-12 h-12 rounded-xl flex items-center justify-center text-primary">
        <span className="material-symbols-outlined">location_on</span>
      </div>
      <h4 className="font-headline-md text-headline-md font-bold text-on-surface">
        {address.label}
      </h4>
      <p className="text-on-surface-variant font-body-md leading-relaxed">
        {address.cityName}، {address.district}
        <br />
        {address.streetDetails}
      </p>
      {address.isDefault ? (
        <span className="self-start bg-primary/10 text-primary px-3 py-1 rounded-full text-label-sm font-bold">
          العنوان الافتراضي
        </span>
      ) : (
        <button
          type="button"
          onClick={onSetDefault}
          disabled={busy}
          className="self-start text-primary font-label-sm hover:underline disabled:opacity-50"
        >
          تعيين كعنوان افتراضي
        </button>
      )}
    </div>
  );
}
