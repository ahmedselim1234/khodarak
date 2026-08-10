export type DeliveryDateRules = {
  leadDays: number;
  blackoutWeekdays: number[]; // 0 (Sunday) - 6 (Saturday), matching Date#getUTCDay()
};

function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

// FR-006: the first delivery date must satisfy the admin's configured lead
// time and must not fall on a blackout weekday. Pure function, no I/O — used
// by both the date-picker UI and the Route Handler's server-side validation
// (contracts/subscriptions-api.md), so client and server can never disagree.
export function selectableDeliveryDates(
  today: Date,
  rules: DeliveryDateRules & { horizonDays: number }
): string[] {
  const earliest = addDays(today, rules.leadDays);
  const dates: string[] = [];

  for (let offset = 0; rules.leadDays + offset <= rules.horizonDays; offset++) {
    const candidate = addDays(earliest, offset);
    if (!rules.blackoutWeekdays.includes(candidate.getUTCDay())) {
      dates.push(toIsoDate(candidate));
    }
  }

  return dates;
}

export function isDateSelectable(
  dateStr: string,
  today: Date,
  rules: DeliveryDateRules
): boolean {
  const earliest = addDays(today, rules.leadDays);
  const candidate = new Date(`${dateStr}T00:00:00Z`);

  if (candidate.getTime() < earliest.getTime()) {
    return false;
  }

  return !rules.blackoutWeekdays.includes(candidate.getUTCDay());
}
