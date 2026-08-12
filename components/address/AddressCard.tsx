"use client";

import { MapPin, Pencil, Trash2 } from "lucide-react";
import type { Address } from "@/lib/store/addressesApi";
import { Badge } from "@/components/ui/Badge";

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
    <div className="relative flex flex-col gap-stack-sm rounded-organic border border-outline-variant bg-surface p-6">
      {/* end-4, not left-4 — keeps the actions on the outer corner when mirrored. */}
      <div className="absolute top-4 end-4 flex gap-1">
        <button
          type="button"
          onClick={onEdit}
          disabled={busy}
          className="rounded-md p-1.5 text-on-surface-variant transition-colors duration-fast hover:bg-surface-container hover:text-primary disabled:opacity-45"
          aria-label="تعديل العنوان"
        >
          <Pencil className="size-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={onDelete}
          disabled={busy}
          className="rounded-md p-1.5 text-on-surface-variant transition-colors duration-fast hover:bg-error-container hover:text-on-error-container disabled:opacity-45"
          aria-label="حذف العنوان"
        >
          <Trash2 className="size-4" aria-hidden="true" />
        </button>
      </div>

      <div className="flex size-11 items-center justify-center rounded-xl bg-primary-container text-on-primary-container">
        <MapPin className="size-5" aria-hidden="true" />
      </div>

      <h4 className="text-h3 text-on-surface">{address.label}</h4>

      <p className="text-small leading-relaxed text-on-surface-variant">
        {address.cityName}، {address.district}
        <br />
        {address.streetDetails}
      </p>

      {address.isDefault ? (
        <Badge tone="brand" className="self-start">
          العنوان الافتراضي
        </Badge>
      ) : (
        <button
          type="button"
          onClick={onSetDefault}
          disabled={busy}
          className="self-start text-caption font-semibold text-primary transition-colors duration-fast hover:underline disabled:opacity-45"
        >
          تعيين كعنوان افتراضي
        </button>
      )}
    </div>
  );
}
