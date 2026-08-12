// Never admin-set, never stored — always derived from an interval's own
// `days` at the point of use (research.md §4), so it can never drift out of
// sync with the interval it describes.
function roundTo(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

export function estimateDeliveriesPerMonth(days: number): number {
  return roundTo(30 / days, 2);
}

const LEGACY_FREQUENCY_LABELS: Record<string, string> = {
  weekly: "أسبوعي",
  biweekly: "كل أسبوعين",
  monthly: "شهري",
};

// Shared display label for either a legacy named frequency or a Phase 10
// day-based interval — used by every dashboard surface that shows a
// subscription's current cadence.
export function formatDeliveryCadenceLabel(
  frequency: string,
  deliveryInterval: { days: number } | null | undefined
): string {
  if (frequency === "custom_interval" && deliveryInterval) {
    return `كل ${deliveryInterval.days} يوم`;
  }
  return LEGACY_FREQUENCY_LABELS[frequency] ?? frequency;
}
