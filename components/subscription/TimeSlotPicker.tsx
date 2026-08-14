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
            aria-pressed={value === slot.id}
            className={`p-4 rounded-2xl border-2 text-right transition-[background-color,border-color,box-shadow,transform] duration-fast ease-out-quart active:scale-[0.98] motion-reduce:active:scale-100 ${
              value === slot.id
                ? "border-primary bg-primary-container shadow-focus"
                : "border-outline-variant hover:border-primary/40 hover:bg-surface-container-low"
            }`}
          >
            <p className="font-label-sm text-label-sm">{slot.label}</p>
            <p className="text-[12px] text-on-surface-variant">{slot.window}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
