"use client";

import { useListDeliveryIntervalsQuery } from "@/lib/store/deliveryIntervalsApi";

// "use client" leaf — replaces FrequencySelector.tsx (Phase 4) for the
// subscription-builder frequency step (FR-005) and is reused by the
// dashboard's change-interval control (FR-009). Fetches
// GET /api/delivery-intervals on mount — the only source of selectable
// options, no free-text day entry (per the spec's own clarification).
export function DeliveryIntervalSelector({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (deliveryIntervalId: string) => void;
}) {
  const { data: intervals, isLoading } = useListDeliveryIntervalsQuery();

  if (isLoading) {
    return null;
  }

  if (!intervals || intervals.length === 0) {
    return (
      <p className="font-label-sm text-label-sm text-error">
        لا يوجد فاصل زمني للتوصيل متاح حالياً
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <h3 className="font-headline-md text-headline-md text-primary font-bold">
        التردد
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {intervals.map((interval) => (
          <button
            key={interval.id}
            type="button"
            onClick={() => onChange(interval.id)}
            className={
              value === interval.id
                ? "p-3 rounded-2xl border-2 border-primary bg-primary-fixed-dim/20 text-primary font-bold text-center"
                : "p-3 rounded-2xl border-2 border-outline-variant text-on-surface-variant text-center hover:bg-surface-container-low transition-all"
            }
          >
            كل {interval.days} يوم
            <span className="block font-label-sm text-label-sm">
              خصم {interval.discountPercent}٪
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
