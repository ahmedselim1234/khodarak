"use client";

import { selectableDeliveryDates } from "@/lib/subscription/selectableDeliveryDates";

const HORIZON_DAYS = 21;

const WEEKDAY_FORMATTER = new Intl.DateTimeFormat("ar-SA", {
  weekday: "long",
  day: "numeric",
  month: "long",
  timeZone: "UTC",
});

// "use client" leaf — uses selectableDeliveryDates (FR-006) to restrict the
// choices to dates that satisfy the admin's lead time and blackout weekdays.
export function DeliveryDatePicker({
  leadDays,
  blackoutWeekdays,
  value,
  onChange,
}: {
  leadDays: number;
  blackoutWeekdays: number[];
  value: string | null;
  onChange: (date: string) => void;
}) {
  const dates = selectableDeliveryDates(new Date(), { leadDays, blackoutWeekdays, horizonDays: HORIZON_DAYS });

  return (
    <div className="flex flex-col gap-2">
      <h3 className="font-headline-md text-headline-md text-primary font-bold">تاريخ أول توصيل</h3>
      {dates.length === 0 ? (
        <p className="font-label-sm text-label-sm text-error">لا توجد تواريخ توصيل متاحة حالياً</p>
      ) : (
        <select
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-surface-container-low border border-outline-variant/30 rounded-2xl p-3"
        >
          <option value="" disabled>
            اختر تاريخاً
          </option>
          {dates.map((date) => (
            <option key={date} value={date}>
              {WEEKDAY_FORMATTER.format(new Date(`${date}T00:00:00Z`))}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
