export type Frequency = "weekly" | "biweekly" | "monthly";

function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

// research.md §3: advances from the subscription's own current
// next_delivery_date — never from "today" — so an established delivery
// weekday never drifts just because the renewal job happened to run a day
// late or a retry resolved days after its original due date. Deliberately
// NOT lib/subscription/selectableDeliveryDates.ts, which anchors to
// "today + lead time" — the right anchor for picking a brand-new first
// delivery date, the wrong one for advancing a recurring one.
export function advanceDeliveryDate(
  currentDeliveryDate: string,
  frequency: Frequency,
  blackoutWeekdays: number[]
): string {
  const date = new Date(`${currentDeliveryDate}T00:00:00Z`);

  switch (frequency) {
    case "weekly":
      date.setUTCDate(date.getUTCDate() + 7);
      break;
    case "biweekly":
      date.setUTCDate(date.getUTCDate() + 14);
      break;
    case "monthly":
      date.setUTCMonth(date.getUTCMonth() + 1);
      break;
  }

  while (blackoutWeekdays.includes(date.getUTCDay())) {
    date.setUTCDate(date.getUTCDate() + 1);
  }

  return toIsoDate(date);
}
