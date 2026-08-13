import type { ProductCategory } from "@/lib/products/mapProductRow";
import { isValidTimeSlot, type TimeSlotId } from "@/lib/subscription/timeSlots";
import { isDateSelectable, type DeliveryDateRules } from "@/lib/subscription/selectableDeliveryDates";

export type SubscriptionDraft = {
  step: "build" | "checkout";
  category: ProductCategory;
  deliveryIntervalId: string | null;
  cityId: string | null;
  deliveryDate: string | null;
  addressId: string | null;
  timeSlot: TimeSlotId | null;
};

// sessionStorage, not localStorage: a half-built order should not resurrect
// days later in a new session. The guest cart is deliberately longer-lived
// and stays on localStorage (StoreProvider.tsx).
export const SUBSCRIPTION_DRAFT_STORAGE_KEY = "khodarak.subscriptionDraft";

function readString(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

// A restored draft is untrusted input — it can be hand-edited, and it can
// simply be stale (a date that has since fallen inside the lead-time window).
// Anything that doesn't validate is dropped rather than trusted. Ids that
// need a server list to check (interval, address) can't be validated here;
// SubscriptionWizard drops those at read time once the lists arrive.
//
// Pure, so it's unit-testable without React — same split as
// selectableDeliveryDates.ts.
export function sanitizeSubscriptionDraft(
  raw: unknown,
  today: Date,
  rules: DeliveryDateRules
): SubscriptionDraft | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const value = raw as Record<string, unknown>;

  const deliveryDate = readString(value.deliveryDate);
  const timeSlot = readString(value.timeSlot);

  return {
    step: value.step === "checkout" ? "checkout" : "build",
    category: value.category === "fruits" ? "fruits" : "vegetables",
    deliveryIntervalId: readString(value.deliveryIntervalId),
    cityId: readString(value.cityId),
    deliveryDate: deliveryDate && isDateSelectable(deliveryDate, today, rules) ? deliveryDate : null,
    addressId: readString(value.addressId),
    timeSlot: timeSlot && isValidTimeSlot(timeSlot) ? timeSlot : null,
  };
}
