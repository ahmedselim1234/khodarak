"use client";

import { TIME_SLOTS, type TimeSlotId } from "@/lib/subscription/timeSlots";

// "use client" leaf — the fixed three-option set (research.md §2).
export function TimeSlotPicker({
  value,
  onChange,
}: {
  value: TimeSlotId | null;
  onChange: (slot: TimeSlotId) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="font-headline-md text-headline-md text-primary font-bold">وقت التوصيل</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-stack-md">
        {TIME_SLOTS.map((slot) => (
          <button
            key={slot.id}
            type="button"
            onClick={() => onChange(slot.id)}
            className={
              value === slot.id
                ? "p-4 rounded-2xl border-2 border-primary bg-primary-fixed-dim/20 text-right"
                : "p-4 rounded-2xl border-2 border-outline-variant text-right hover:bg-surface-container-low transition-all"
            }
          >
            <p className="font-label-sm text-label-sm">{slot.label}</p>
            <p className="text-[12px] text-on-surface-variant">{slot.window}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
