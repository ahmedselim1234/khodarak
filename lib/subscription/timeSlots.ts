export type TimeSlotId = "morning" | "afternoon" | "evening";

export type TimeSlot = {
  id: TimeSlotId;
  label: string;
  window: string;
};

// Fixed set — plan.md's settings model never defines admin-configurable
// time slots (research.md §2), so this is a shared constant rather than a
// database-backed setting.
export const TIME_SLOTS: TimeSlot[] = [
  { id: "morning", label: "صباحاً", window: "٨ ص - ١٢ م" },
  { id: "afternoon", label: "ظهراً", window: "١٢ م - ٤ م" },
  { id: "evening", label: "مساءً", window: "٤ م - ٩ م" },
];

export const TIME_SLOT_IDS = TIME_SLOTS.map((slot) => slot.id) as [TimeSlotId, ...TimeSlotId[]];

export function isValidTimeSlot(value: string): value is TimeSlotId {
  return TIME_SLOTS.some((slot) => slot.id === value);
}
