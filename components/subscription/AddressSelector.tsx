"use client";

import Link from "next/link";
import { useListAddressesQuery } from "@/lib/store/addressesApi";

// "use client" leaf — reads the existing address book (Phase 1). Prompts to
// add an address (links to /dashboard/settings) when none exist (FR-007).
export function AddressSelector({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (addressId: string) => void;
}) {
  const { data: addresses, isLoading } = useListAddressesQuery();

  if (isLoading) {
    return <p className="font-body-md text-body-md text-on-surface-variant">جارٍ التحميل...</p>;
  }

  if (!addresses || addresses.length === 0) {
    return (
      <div className="flex flex-col gap-stack-sm bg-surface-container-low rounded-2xl p-stack-md text-center">
        <p className="font-body-md text-body-md text-on-surface-variant">
          لا توجد عناوين محفوظة — يلزم إضافة عنوان قبل إتمام الطلب
        </p>
        <Link href="/dashboard/settings" className="text-primary font-bold hover:underline">
          إضافة عنوان جديد
        </Link>
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
      </div>
    </div>
  );
}
